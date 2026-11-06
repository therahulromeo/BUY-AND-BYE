import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    category_id: { type: Number, unique: true },
    category_name: { type: String, required: true, trim: true, uppercase: true },
    parent_category_id: { type: Number, default: null },
    parent_name: { type: String, default: null },
    type_id: { type: Number, default: null },
    description: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    image: { type: String, default: '' },
    product_count: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export default Category;
