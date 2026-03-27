import express from "express";

import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/", updateCartItem);
router.delete("/clear", clearCart);
router.delete("/:productId", removeCartItem);

export default router;
