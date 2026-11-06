import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    customer_id: { type: Number, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    city: { type: String },
    state: { type: String },
    registered_at: { type: String },
    total_orders: { type: Number, default: 0 },
    total_spent: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
export default Customer;
