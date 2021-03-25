import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    hotel: {
      type: ObjectId,
      ref: "Hotel",
    },
    session: {},
    orderedBy: {
      type: ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
