import dotenv from "dotenv";

import connectDB from "./config/db.js";
import { sampleCategory, sampleProducts } from "./data/sampleData.js";
import Category from "./models/Category.js";
import Product from "./models/Product.js";
import User from "./models/User.js";

dotenv.config();

const seedProducts = async () => {
  await connectDB();

  let adminUser = await User.findOne({ email: "admin@example.com" });

  if (!adminUser) {
    adminUser = await User.create({
      name: "Store Admin",
      email: "admin@example.com",
      password: "admin123",
      role: "admin"
    });
  }

  let category = await Category.findOne({ name: sampleCategory.name });

  if (!category) {
    category = await Category.create(sampleCategory);
  }

  await Product.deleteMany({ category: category._id });

  const productsToInsert = sampleProducts.map((product) => ({
    ...product,
    category: category._id,
    createdBy: adminUser._id
  }));

  const insertedProducts = await Product.insertMany(productsToInsert);

  console.log(`Seed complete: ${insertedProducts.length} products created.`);
  console.log("Admin login: admin@example.com / admin123");
  process.exit(0);
};

seedProducts().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
