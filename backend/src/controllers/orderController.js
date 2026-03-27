import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: orders.length,
    data: orders
  });
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: orders.length,
    data: orders
  });
});

const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, taxPrice = 0, shippingPrice = 0 } = req.body;
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product", "name countInStock");

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  if (
    !shippingAddress?.address ||
    !shippingAddress?.city ||
    !shippingAddress?.postalCode ||
    !shippingAddress?.country
  ) {
    res.status(400);
    throw new Error("Complete shipping address is required");
  }

  if (!paymentMethod) {
    res.status(400);
    throw new Error("Payment method is required");
  }

  for (const item of cart.items) {
    if (item.quantity > item.product.countInStock) {
      res.status(400);
      throw new Error(`Insufficient stock for product: ${item.product.name}`);
    }
  }

  const itemsPrice = cart.totalPrice;
  const totalPrice = itemsPrice + Number(taxPrice) + Number(shippingPrice);

  const order = await Order.create({
    user: req.user._id,
    orderItems: cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.price
    })),
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  });

  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { countInStock: -item.quantity }
    });
  }

  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    data: order
  });
});

const markOrderAsPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.isPaid = true;
  order.paidAt = new Date();
  await order.save();

  res.json({
    success: true,
    message: "Order marked as paid",
    data: order
  });
});

const markOrderAsDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.isDelivered = true;
  order.deliveredAt = new Date();
  await order.save();

  res.json({
    success: true,
    message: "Order marked as delivered",
    data: order
  });
});

export {
  getMyOrders,
  getOrders,
  createOrder,
  markOrderAsPaid,
  markOrderAsDelivered
};
