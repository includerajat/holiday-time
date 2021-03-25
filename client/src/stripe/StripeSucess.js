import { LoadingOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { stripeSuccessRequest } from "../actions/stripe";

const StripeSucess = ({ match, history }) => {
  const {
    auth: { token },
  } = useSelector((state) => ({ ...state }));
  useEffect(() => {
    // console.log(
    //   "SEND THIS HOTELID TO BACKEND TO CREATE ORDER",
    //   match.params.hotelId
    // );
    stripeSuccessRequest(token, match.params.hotelId).then((res) => {
      // console.log('STRIPE SUCCESS RESPONSE',res.data)
      if (res.data.success) {
        history.push("/dashboard");
      } else {
        history.push("/stripe/cancel");
      }
    });
  }, [match.params.hotelId]);
  return (
    <div className="container">
      <div className="d-flex justify-content-center p-5">
        <LoadingOutlined className="d-flex justify-content-center p-5" />
      </div>
    </div>
  );
};

export default StripeSucess;
