import orderModel from "../models/orderModel.js";
import Stripe from "stripe";

const stripe = Stripe(
  "sk_test_51PeJ6YECc33s4wLhgKNXzlWVolrM7ReVUGlLD7B1LTnqcMJCYL4vmkHBtOcESxfqqbMDtrLZXRjjOvaQdGGsIB0o00KTpZUdHB"
);

export const createOrder = async (req, res) => {
  const { from, to, distance, duration, price } = req.body;
  const userId = req.user._id; // Assuming `isAuth` middleware sets `req.user`

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
    // Save the order to the database
    const savedOrder = await newOrder.save();

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Trip from " + from + " to " + to,
            },
            unit_amount: price * 100, // Convert dollars to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `https://gategaurd-client.vercel.app/success?session_id={CHECKOUT_SESSION_ID}`, // Redirect URL on success
      cancel_url: "https://gategaurd-client.vercel.app/cancel", // Redirect URL on cancellation
      metadata: {
        orderId: savedOrder._id.toString(), // Pass the order ID to the metadata
      },
    });

    // Return the session ID
    res.status(201).json({ sessionId: session.id });
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

// Update payment status to "paid" after successful payment
export const updatePaymentStatus = async (req, res) => {
  const { orderId } = req.params;
  const { paymentStatus } = req.body; // Should be 'paid'

  try {
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { payment: paymentStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating payment status", error });
  }
};
