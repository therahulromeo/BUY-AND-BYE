import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    transaction_id: { type: String, required: true, unique: true },
    order_id: { type: String, required: true },
    customer_name: { type: String, required: true },
    payment_method: { type: String, default: 'UPI' },
    gateway: { type: String, default: 'Razorpay' },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Successful', 'Pending', 'Failed', 'Refunded'],
      default: 'Successful',
    },
    reference_no: { type: String },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
export default Payment;
