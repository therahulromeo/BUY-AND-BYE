import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    admin_id: { type: Number, unique: true },
    username: { type: String, required: true, unique: true, trim: true },
    password_tray: { type: String, required: true },
    name: { type: String, default: 'Administrator' },
    email: { type: String, default: 'admin@buyandbye.com' },
    role: { type: String, default: 'Administrator' },
    avatar: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
export default Admin;
