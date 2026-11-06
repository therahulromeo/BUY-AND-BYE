import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    product_id: { type: Number, unique: true },
    product_name: { type: String, required: true, trim: true },
    sku: { type: String, trim: true },
    category_id: { type: Number, default: null },
    category_name: { type: String, default: 'General' },
    parent_category_id: { type: Number, default: null },
    parent_name: { type: String, default: null },
    base: { type: String, default: '' },
    type: { type: String, default: '' },
    type_id: { type: Number, default: null },
    sleeve_type: { type: String, default: 'Full Sleeve' },
    size: { type: String, default: '' },
    sizes: { type: [String], default: [] },
    size_stock: { type: mongoose.Schema.Types.Mixed, default: {} },
    shirt_type: { type: String, default: 'Full Sleeve' },
    sleeves: { type: String, default: 'Full Sleeve' },
    descriptions: { type: String, default: '' },
    price: { type: Number, required: true, default: 0 },
    cost_price: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    min_stock: { type: Number, default: 5 },
    status: {
      type: String,
      enum: ['active', 'inactive', 'out_of_stock', 'low_stock'],
      default: 'active',
    },
    image: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
