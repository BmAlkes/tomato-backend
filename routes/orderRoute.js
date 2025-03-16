import express from "express";
import authMiddleware from "../middleware/auth.js";
import { listOrder, placeOrder, updateStatus, userOrders, verifyOrder } from "../controllers/orderController.js";

const orderRoute = express.Router();

orderRoute.post("/place", authMiddleware, placeOrder);
orderRoute.post('/verify', verifyOrder)
orderRoute.post('/userorders', authMiddleware, userOrders)
orderRoute.get('/list', listOrder)
orderRoute.post('/status', updateStatus )

export default orderRoute;
