// Backend: checkoutSession.js
import orderModel from "../models/orderModel.js";
import stripe from "stripe";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

export const checkoutSession = async (req, res) => {
  const { orderId } = req.body;

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key is not defined");
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Trip from ${order.from} to ${order.to}`,
            },
            unit_amount: Math.round(order.price * 100), // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      cancel_url: `http://localhost:3000/payment-cancelled`,
      metadata: {
        order_id: order._id.toString(),
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error.message || error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const paymentSuccess = async (req, res) => {
  const { session_id } = req.body;
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key is not defined");
    }

    const session = await stripeInstance.checkout.sessions.retrieve(session_id);
    const orderId = session.metadata.order_id;

    await orderModel.findByIdAndUpdate(orderId, {
      payment: "paid",
      status: "completed",
    });
    res.json({ message: "Payment successful" });
  } catch (error) {
    console.error("Error updating payment status:", error.message || error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
