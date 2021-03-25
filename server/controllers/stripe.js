import User from "../models/user";
import Hotel from "../models/hotel";
import Order from "../models/order";
import Stripe from "stripe";
import queryString from "query-string";

const stripe = Stripe(process.env.STRIPE_SECRET);

export const createConnectAccount = async (req, res) => {
  const user = await User.findById(req.user._id).exec();
  console.log("USER ===>", user);
  if (!user.stripe_account_id) {
    const account = await stripe.accounts.create({
      // country: "US",
      type: "express",
    });
    console.log("ACCOUNT ===>", account);
    user.stripe_account_id = account.id;
    user.save();
  }

  try {
    let accountLink = await stripe.accountLinks.create({
      account: user.stripe_account_id,
      refresh_url: process.env.STRIPE_REDIRECT_URL,
      return_url: process.env.STRIPE_REDIRECT_URL,
      type: "account_onboarding",
    });

    accountLink = Object.assign(accountLink, {
      "stripe_user[email]": user.email || undefined,
    });

    res.send(`${accountLink.url}?${queryString.stringify(accountLink)}`);
  } catch (e) {
    res.status(400).send();
  }
};

export const getAccountStatus = async (req, res) => {
  // console.log("GET ACCOUNT STATUS");
  const user = await User.findById(req.user._id).exec();
  const account = await stripe.accounts.retrieve(user.stripe_account_id);
  // console.log("USER ACCOUNT RETRIEVE", account);
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      stripe_seller: { ...account, charges_enabled: true },
    },
    { new: true }
  )
    .select("-password")
    .exec();
  // console.log(updatedUser);
  res.json(updatedUser);
};

export const getAccountBalance = async (req, res) => {
  const user = await User.findById(req.user._id).exec();
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: user.stripe_account_id,
    });
    // console.log("BALANCE ===> ", balance);
    res.json(balance);
  } catch (e) {
    console.log(e);
  }
};

export const payoutSetting = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).exec();

    const loginLink = await stripe.accounts.createLoginLink(
      user.stripe_account_id,
      {
        redirect_url: process.env.STRIPE_SETTING_REDIRECT_URL,
      }
    );
    // console.log("LOGIN LINK FOR PAYOUT SETTINGS", loginLink);
    res.json(loginLink);
  } catch (e) {
    console.log("Stripe payout setting err", e);
  }
};

export const stripeSessionId = async (req, res) => {
  // console.log("You hit stripe session id", req.body.hotelId);
  const { hotelId } = req.body;

  const item = await Hotel.findById(hotelId).populate("postedBy").exec();

  const fee = (item.price * 20) / 100;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        name: item.title,
        amount: item.price * 100,
        currency: "inr",
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: fee * 100,
      transfer_data: {
        destination: item.postedBy.stripe_account_id,
      },
    },
    success_url: `${process.env.STRIPE_SUCCESS_URL}/${item._id}`,
    cancel_url: process.env.STRIPE_CANCEL_URL,
  });

  await User.findByIdAndUpdate(req.user._id, { stripeSession: session }).exec();
  // console.log("SESSION ===>", session);
  res.send({
    sessionId: session.id,
  });
};

export const stripeSuccess = async (req, res) => {
  try {
    const { hotelId } = req.body;
    const user = await User.findById(req.user._id).exec();
    if (!user.stripeSession) return;
    const session = await stripe.checkout.sessions.retrieve(
      user.stripeSession.id
    );
    if (session.payment_status === "paid") {
      const orderExist = await Order.findOne({
        "session.id": session.id,
      }).exec();
      // console.log(orderExist);
      if (orderExist) {
        res.json({
          success: true,
        });
      } else {
        let newOrder = await new Order({
          hotel: hotelId,
          session,
          orderedBy: user._id,
        }).save();
        await User.findByIdAndUpdate(user._id, {
          $set: { stripeSession: {} },
        });
        res.json({
          success: true,
        });
      }
    }
  } catch (err) {
    console.log("STRIPE SUCCESS ERROR", err);
  }
};
