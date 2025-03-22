require('dotenv').config(); // Load biến môi trường từ .env
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Stock = require("./stock"); // Import model Stock

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined. Please check your .env file.");
  process.exit(1);
}

console.log("MONGO_URI:", MONGO_URI); // Debugging

app.use(express.json());
app.use(cors());

// Kết nối MongoDB
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
});

// 🟢 API: Lấy danh sách stocks
app.get("/stocks", async (req, res) => {
    try {
        const stocks = await Stock.find();
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
});

// 🟢 API: Thêm stock mới
app.post("/stocks", async (req, res) => {
    try {
        const newStock = new Stock(req.body);
        await newStock.save();
        res.status(201).json({ message: "Stock added", stock: newStock });
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi thêm stock", error });
    }
});

// 🟢 API: Thêm danh sách stocks mới
app.post("/stocks", async (req, res) => {
    try {
        const stocks = req.body;
        const savedStocks = await Stock.insertMany(stocks);
        res.status(201).json({ message: "Stocks added", stocks: savedStocks });
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi thêm danh sách stocks", error });
    }
});

// 🟢 API: Xóa stock
app.delete("/stocks/:id", async (req, res) => {
    try {
        await Stock.findByIdAndDelete(req.params.id);
        res.json({ message: "Stock deleted" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa stock", error });
    }
});

// 🟢 API: Cập nhật stock
app.put("/stocks/:id", async (req, res) => {
    try {
        const updatedStock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Stock updated", stock: updatedStock });
    } catch (error) {
        res.status(400).json({ message: "Lỗi khi cập nhật stock", error });
    }
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
