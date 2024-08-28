import mongoose from "mongoose";
const { Schema } = mongoose;

const orderSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  driver: {
    type: Schema.Types.ObjectId,
    ref: "Driver",
    default: null,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  distance: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  payment: {
    type: String,
    enum: ["paid", "not-paid"],
    default: "not-paid",
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "completed", "cancelled"], // Example status values
    default: "pending",
  },
});

const orderModel = mongoose.model("Order", orderSchema);

export default orderModel;
