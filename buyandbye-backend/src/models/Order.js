import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product_id: { type: Number, required: true },
    name: { type: String, required: true },
    sku: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    image: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    order_id: { type: String, required: true, unique: true },
    customer: {
      id: { type: Number },
      name: { type: String, required: true },
      email: { type: String },
      phone: { type: String },
    },
    items: [orderItemSchema],
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    shipping_fee: { type: Number, default: 0 },
    total_amount: { type: Number, required: true },
    payment_method: { type: String, default: 'Cash On Delivery' },
    payment_status: {
      type: String,
      enum: ['Paid', 'Pending', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    order_status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    shipping_address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postal_code: { type: String },
      country: { type: String, default: 'India' },
    },
    tracking_number: { type: String },
    date: { type: String },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
