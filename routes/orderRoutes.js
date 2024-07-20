import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrdersByUser,
  getOrderById,
  acceptOrder,
  cancelOrder,
  completeOrder,
  getPendingOrders,
  getDriverCompletedOrders,
  totalOrders,
  orderPayment,
} from "../controllers/orderController.js";
import { isAdmin, isAuth } from "../middleware/authMiddleware.js";
//router object
const router = express.Router();

// routes
//create order
router.post("/create-order", isAuth, createOrder);

// get all orders
router.get("/get-all-orders", isAuth, isAdmin, getAllOrders);

// get orders by user
router.get("/get-orders-by-user/:userId", isAuth, getOrdersByUser);

// get all pending orders
router.get("/get-orders", isAuth, getPendingOrders);

// get all accepted and pending orders
router.get(
  "/get-driver-completed-orders/:driverId",
  isAuth,
  getDriverCompletedOrders
);

// get order by id
router.get("/get-order/:orderId", isAuth, getOrderById);

// accept order
router.put("/accept/:orderId", isAuth, acceptOrder);

// cancel order
router.put("/cancel-order/:orderId", isAuth, cancelOrder);

// complete order
router.put("/complete-order/:orderId", isAuth, completeOrder);

// get total orderr
router.get("/total", isAuth, isAdmin, totalOrders);

router.post("/payment", orderPayment);

export default router;
