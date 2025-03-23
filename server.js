require('dotenv').config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Stock = require("./stock.ts"); // Import Stock model

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

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
});

// 🟢 API: Get a single stock by `id` (FIXED)
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




// 🟢 API: Get all stocks
app.get("/stocks", async (req, res) => {
    try {
        const stocks = await Stock.find();
        res.json(stocks);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// 🟢 API: Add a single stock
app.post("/stocks", async (req, res) => {
    try {
        const newStock = new Stock(req.body);
        await newStock.save();
        res.status(201).json({ message: "Stock added", stock: newStock });
    } catch (error) {
        res.status(400).json({ message: "Error adding stock", error });
    }
});

// 🟢 API: Add multiple stocks (NEW ROUTE)
app.post("/stocks/bulk", async (req, res) => {
    try {
        const stocks = req.body;
        const savedStocks = await Stock.insertMany(stocks);
        res.status(201).json({ message: "Stocks added", stocks: savedStocks });
    } catch (error) {
        res.status(400).json({ message: "Error adding stocks", error });
    }
});

// 🟢 API: Delete a stock by `id` (FIXED)
app.delete("/stocks/:id", async (req, res) => {
    try {
        const deletedStock = await Stock.findOneAndDelete({ id: req.params.id }); // ✅ Search by `id`
        if (!deletedStock) {
            return res.status(404).json({ message: "Stock not found" });
        }
        res.json({ message: "Stock deleted", stock: deletedStock });
    } catch (error) {
        res.status(500).json({ message: "Error deleting stock", error });
    }
});

// 🟢 API: Update a stock by `id` (FIXED)
app.put("/stocks/:id", async (req, res) => {
    try {
        const updatedStock = await Stock.findOneAndUpdate(
            { id: req.params.id }, // ✅ Search by `id`
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

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
