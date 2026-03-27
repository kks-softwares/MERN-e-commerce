import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";

const calculateTotal = (items) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0);

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate("items.product", "name price image countInStock");

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [], totalPrice: 0 });
    cart = await cart.populate("items.product", "name price image countInStock");
  }

  return cart;
};

const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);

  res.json({
    success: true,
    data: cart
  });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const quantity = Number(req.body.quantity) || 1;

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.countInStock < quantity) {
    res.status(400);
    throw new Error("Requested quantity exceeds available stock");
  }

  const cart = await getOrCreateCart(req.user._id);
  const itemIndex = cart.items.findIndex((item) => item.product._id.toString() === productId);

  if (itemIndex >= 0) {
    const updatedQuantity = cart.items[itemIndex].quantity + quantity;

    if (updatedQuantity > product.countInStock) {
      res.status(400);
      throw new Error("Total quantity exceeds available stock");
    }

    cart.items[itemIndex].quantity = updatedQuantity;
    cart.items[itemIndex].price = product.price;
  } else {
    cart.items.push({
      product: product._id,
      quantity,
      price: product.price
    });
  }

  cart.totalPrice = calculateTotal(cart.items);
  await cart.save();

  const populatedCart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name price image countInStock"
  );

  res.json({
    success: true,
    message: "Item added to cart",
    data: populatedCart
  });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const quantity = Number(req.body.quantity);

  if (!productId || !quantity || quantity < 1) {
    res.status(400);
    throw new Error("Product ID and a valid quantity are required");
  }

  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (quantity > product.countInStock) {
    res.status(400);
    throw new Error("Requested quantity exceeds available stock");
  }

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((cartItem) => cartItem.product._id.toString() === productId);

  if (!item) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  item.quantity = quantity;
  item.price = product.price;
  cart.totalPrice = calculateTotal(cart.items);
  await cart.save();

  const populatedCart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name price image countInStock"
  );

  res.json({
    success: true,
    message: "Cart updated successfully",
    data: populatedCart
  });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const cart = await getOrCreateCart(req.user._id);

  cart.items = cart.items.filter((item) => item.product._id.toString() !== productId);
  cart.totalPrice = calculateTotal(cart.items);
  await cart.save();

  const populatedCart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name price image countInStock"
  );

  res.json({
    success: true,
    message: "Item removed from cart",
    data: populatedCart
  });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  res.json({
    success: true,
    message: "Cart cleared successfully",
    data: cart
  });
});

export { getCart, addToCart, updateCartItem, removeCartItem, clearCart };


