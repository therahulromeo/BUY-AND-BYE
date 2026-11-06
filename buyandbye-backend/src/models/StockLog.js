import mongoose from 'mongoose';

const stockLogSchema = new mongoose.Schema(
  {
    id: { type: Number },
    product_id: { type: Number, required: true },
    product_name: { type: String, required: true },
    sku: { type: String },
    type: { type: String, enum: ['ADD', 'SUBTRACT', 'SET'], default: 'ADD' },
    quantity: { type: Number, required: true },
    previous_stock: { type: Number, default: 0 },
    new_stock: { type: Number, required: true },
    reason: { type: String, default: '' },
    adjusted_by: { type: String, default: 'Admin' },
    timestamp: { type: String },
  },
  {
    timestamps: true,
  }
);

export const StockLog = mongoose.models.StockLog || mongoose.model('StockLog', stockLogSchema);
export default StockLog;
