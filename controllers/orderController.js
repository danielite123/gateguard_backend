import orderModel from "../models/orderModel.js";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Function to calculate price based on distance (example)
const calculatePrice = (distance) => {
  // Your price calculation logic here
  const price = parseFloat(distance) * 10; // Example calculation: $10 per unit distance
  return Math.round(price); // Round the price to the nearest whole number
};

export const createOrder = async (req, res) => {
  const { from, to, distance, duration } = req.body;
  const userId = req.user._id; // Assuming `isAuth` middleware sets `req.user`

  const price = calculatePrice(distance);

  const newOrder = new orderModel({
    user: userId, // Link the order to the authenticated user
    from,
    to,
    distance,
    duration,
    price,
    payment: "not-paid",
    status: "pending", // Initial status
  });

  try {
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error in createOrder API", error });
  }
};

// get all orders by user
export const getOrdersByUser = async (req, res) => {
  const userId = req.user._id; // Assuming `isAuth` middleware sets `req.user`

  try {
    const orders = await orderModel.find({ user: userId });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error in getOrdersByUser API", error });
  }
};

// get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel.find();

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error in getAllOrders API", error });
  }
};

// get order by id
export const getOrderById = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Assuming 'from', 'to', 'distance', 'duration' are fields in your order model
    const { from, to, distance, duration, price } = order;

    res.json({ from, to, distance, duration, price });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error in getOrderById API", error });
  }
};

// get all pending orders

export const getPendingOrders = async (req, res) => {
  try {
    // Fetch pending orders (assuming 'pending' is a status in your Order schema)
    const pendingOrders = await orderModel.find({
      status: "pending", // Adjust as per your actual status field in Order schema
    });

    res.status(200).json(pendingOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get all accepted and completed orders by driver
export const getDriverCompletedOrders = async (req, res) => {
  const { driverId } = req.params;

  try {
    const orders = await orderModel.find({
      driver: driverId,
      status: { $in: ["completed", "accepted"] }, // Include both statuses
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// accept orders
export const acceptOrder = async (req, res) => {
  const { orderId } = req.params;
  const { _id: driverId } = req.driver; // Assuming `isAuth` middleware sets `req.driver`

  try {
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { status: "accepted", driver: driverId },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error in acceptOrder API", error });
  }
};

// cancel the order
export const cancelOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { status: "cancelled" },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error in cancelOrder API", error });
  }
};

// complete the order
export const completeOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { status: "completed" },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error in completeOrder API", error });
  }
};

//total number of orders
export const totalOrders = async (req, res) => {
  try {
    const totalOrders = await orderModel.countDocuments({});
    res.status(200).send({
      success: true,
      message: "Total number of orders fetched successfully",
      totalUsers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in total users api",
      error,
    });
  }
};

export const orderPayment = async (req, res) => {
  const { amount, payment_method_id } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method: payment_method_id,
      confirmation_method: "manual",
      confirm: true,
      return_url: "http://localhost:3000/payment-result",
    });
   

    res.send({ success: true, paymentIntent });
  } catch (error) {
    res.send({ error: error.message });
  }
};
