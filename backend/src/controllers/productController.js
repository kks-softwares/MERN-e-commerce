import Category from "../models/Category.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";

const getProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const keyword = req.query.keyword?.trim() || "";
  const category = req.query.category || "";
  const minPrice = Number(req.query.minPrice);
  const maxPrice = Number(req.query.maxPrice);
  const sortBy = req.query.sortBy || "createdAt";
  const order = req.query.order === "asc" ? 1 : -1;

  const query = {};

  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
      { brand: { $regex: keyword, $options: "i" } }
    ];
  }

  if (category) {
    query.category = category;
  }

  if (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) {
    query.price = {};
    if (!Number.isNaN(minPrice)) {
      query.price.$gte = minPrice;
    }
    if (!Number.isNaN(maxPrice)) {
      query.price.$lte = maxPrice;
    }
  }

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate("category", "name")
    .populate("createdBy", "name email")
    .sort({ [sortBy]: order })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    success: true,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: products
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name description")
    .populate("createdBy", "name email");

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({
    success: true,
    data: product
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, brand, countInStock, image, category } = req.body;

  if (!name || !description || price === undefined || !category) {
    res.status(400);
    throw new Error("Name, description, price, and category are required");
  }

  const categoryExists = await Category.findById(category);

  if (!categoryExists) {
    res.status(404);
    throw new Error("Category not found");
  }

  const product = await Product.create({
    name,
    description,
    price,
    brand,
    countInStock,
    image,
    category,
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const { name, description, price, brand, countInStock, image, category } = req.body;

  if (category) {
    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      res.status(404);
      throw new Error("Category not found");
    }
  }

  product.name = name ?? product.name;
  product.description = description ?? product.description;
  product.price = price ?? product.price;
  product.brand = brand ?? product.brand;
  product.countInStock = countInStock ?? product.countInStock;
  product.image = image ?? product.image;
  product.category = category ?? product.category;

  const updatedProduct = await product.save();

  res.json({
    success: true,
    message: "Product updated successfully",
    data: updatedProduct
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  await product.deleteOne();

  res.json({
    success: true,
    message: "Product deleted successfully"
  });
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
