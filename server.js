
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Stock from "./stock.js";
import User from "./user.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined. Please check your .env file.");
  process.exit(1);
}

console.log("📌 MONGO_URI:", MONGO_URI);

app.use(express.json());
app.use(cors());

// 🟢 Kết nối MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// ===============================
// 🔹 STOCK API
// ===============================

// 🟢 Lấy thông tin chi tiết của 1 stock
app.get("/stocks/id/:id", async (req, res) => {
  try {
    const stock = await Stock.findOne({ id: req.params.id });
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// 🟢 Lấy danh sách tất cả stocks
app.get("/stocks", async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// 🟢 Thêm mới 1 stock
app.post("/stocks", async (req, res) => {
  try {
    const newStock = new Stock(req.body);
    await newStock.save();
    res.status(201).json({ message: "Stock added", stock: newStock });
  } catch (error) {
    res.status(400).json({ message: "Error adding stock", error });
  }
});

// 🟢 Thêm nhiều stock cùng lúc
app.post("/stocks/bulk", async (req, res) => {
  try {
    const stocks = req.body;
    const savedStocks = await Stock.insertMany(stocks);
    res.status(201).json({ message: "Stocks added", stocks: savedStocks });
  } catch (error) {
    res.status(400).json({ message: "Error adding stocks", error });
  }
});

// 🟢 Xóa 1 stock theo ID
app.delete("/stocks/:id", async (req, res) => {
  try {
    const deletedStock = await Stock.findOneAndDelete({ id: req.params.id });
    if (!deletedStock) {
      return res.status(404).json({ message: "Stock not found" });
    }
    res.json({ message: "Stock deleted", stock: deletedStock });
  } catch (error) {
    res.status(500).json({ message: "Error deleting stock", error });
  }
});

// 🟢 Cập nhật thông tin của 1 stock
app.put("/stocks/:id", async (req, res) => {
  try {
    const updatedStock = await Stock.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedStock) {
      return res.status(404).json({ message: "Stock not found" });
    }
    res.json({ message: "Stock updated", stock: updatedStock });
  } catch (error) {
    res.status(400).json({ message: "Error updating stock", error });
  }
});

// ===============================
// 🔹 USER AUTH API
// ===============================

// 🟢 Đăng ký tài khoản
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
});

// 🟢 Đăng nhập
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("Generated Token:", token);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// 🔹 START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
