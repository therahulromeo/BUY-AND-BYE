import api from './api';
import { INITIAL_PRODUCTS, CATEGORIES } from '../data/catalogData';

export const productService = {
  /**
   * Fetch all products from backend or fallback to catalog data
   */
  async getAll() {
    try {
      const res = await api.get('/products');
      if (res.success && res.data) {
        const rawProducts = res.data.products || res.data;
        if (Array.isArray(rawProducts)) {
          return rawProducts.map((p) => {
            return {
              product_id: p.product_id,
              product_name: p.product_name,
              sku: p.sku || `BNB-PRD-${p.product_id}`,
              category_id: p.category_id,
              parent_category_id: p.parent_category_id !== undefined ? p.parent_category_id : p.category_id,
              parent_name: p.parent_name || p.base || 'Shirt',
              base: p.base || (p.category_name?.toLowerCase().includes('shirt') ? 'Shirt' : p.category_name),
              type: p.type || p.shirt_type || '',
              type_id:
                p.type_id !== undefined
                  ? Number(p.type_id)
                  : p.type?.toLowerCase().includes('formal')
                  ? 1
                  : p.type?.toLowerCase().includes('casual')
                  ? 2
                  : 1,
              category_name: p.category_name || p.base || 'Shirt',
              descriptions: p.descriptions || '',
              price: parseFloat(p.price) || 0,
              original_price: parseFloat(p.original_price) || (parseFloat(p.price) || 0) * 1.35,
              stock: p.stock !== undefined ? p.stock : 0,
              status: p.status || 'active',
              rating: p.rating || 4.8,
              reviews_count: p.reviews_count || 12,
              image: p.image || '',
              images: p.images && p.images.length > 0 ? p.images : p.image ? [p.image] : [],
              sizes: (() => {
                if (Array.isArray(p.sizes) && p.sizes.length > 0) {
                  return p.sizes.filter(
                    (s) =>
                      !p.size_stock ||
                      p.size_stock[s] === undefined ||
                      Number(p.size_stock[s]) > 0
                  );
                }
                if (p.size) return [p.size];
                if ((p.base === 'Accessories' || p.base === 'Accesorries') && p.type === 'Watches') return [];
                if (p.base === 'Pants' || p.category_name?.toLowerCase().includes('pant')) {
                  return ['32', '34', '36', '38', '40', '42'];
                }
                if ((p.base === 'Accessories' || p.base === 'Accesorries') && p.type === 'Shoes') {
                  return ['8', '9', '10'];
                }
                return ['S', 'M', 'L', 'XL', 'XXL'];
              })(),
              size_stock: p.size_stock || {},
              colors: p.colors || ['Navy Blue', 'Classic White'],
              fabric: p.fabric || '100% Breathable Cotton',
              fit: p.fit || 'Regular Fit',
              shirt_type: p.shirt_type || p.sleeves || 'Full Sleeve',
              sleeves: p.shirt_type || p.sleeves || 'Full Sleeve',
              is_bestseller: p.is_bestseller || false,
            };
          });
        }
      }
    } catch (e) {
      console.warn('[ProductService] Backend not reachable, using local catalog:', e);
    }
    return INITIAL_PRODUCTS;
  },

  /**
   * Fetch all categories
   */
  async getCategories() {
    try {
      const res = await api.get('/categories');
      if (res.success && res.data) {
        const raw = res.data.categories || res.data;
        if (Array.isArray(raw) && raw.length > 0) {
          return raw;
        }
      }
    } catch (e) {
      console.warn('[ProductService] Backend categories not reachable, using fallback');
    }
    return CATEGORIES;
  },
};
