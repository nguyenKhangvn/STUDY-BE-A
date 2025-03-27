import * as mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    price: { type: Number, required: true },
    previousPrice: { type: Number, default: 0 },
    exchange: { type: String, required: true },
    favorite: { type: Boolean, default: false }
});

// Tạo Model từ Schema
const Stock = mongoose.model("stock", stockSchema);

export default Stock; 
