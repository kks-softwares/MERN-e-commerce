import express from "express";

import {
  createOrder,
  getMyOrders,
  getOrders,
  markOrderAsDelivered,
  markOrderAsPaid
} from "../controllers/orderController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/", protect, adminOnly, getOrders);
router.put("/:id/pay", protect, adminOnly, markOrderAsPaid);
router.put("/:id/deliver", protect, adminOnly, markOrderAsDelivered);

export default router;
