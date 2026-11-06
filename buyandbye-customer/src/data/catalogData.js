/**
 * BUY & BYE — Menswear Catalog Data
 * Aligned with the database schema (buynbye_db2.sql) and MongoDB seed.
 * Hierarchy: Base Category (Parent ID: 1..4) ➔ Type / Sub-Category (Type ID: 1..N)
 */

export const CATEGORIES = [
  // Parent Categories (Root: category_id 1..4)
  {
    category_id: 1,
    category_name: 'SHIRT',
    parent_category_id: null,
    slug: 'shirt',
    icon: 'Shirt',
    description: 'Bespoke tailoring, crisp formal wear & relaxed casual weekend shirts',
  },
  {
    category_id: 2,
    category_name: 'T-SHIRTS',
    parent_category_id: null,
    slug: 't-shirts',
    icon: 'Smile',
    description: 'Super-combed cotton crewnecks, polo tees, and oversized fits',
  },
  {
    category_id: 3,
    category_name: 'PANTS',
    parent_category_id: null,
    slug: 'pants',
    icon: 'Layers',
    description: 'Premium stretch denim jeans and tailored breathable cotton trousers',
  },
  {
    category_id: 4,
    category_name: 'ACCESSORIES',
    parent_category_id: null,
    slug: 'accessories',
    icon: 'Sparkles',
    description: 'Luxury analog watches, leather footwear, and essential accents',
  },

  // Shirt Sub-Categories (Parent ID: 1, Type ID: 1..3)
  {
    category_id: 5,
    category_name: 'FORMAL SHIRTS',
    parent_category_id: 1,
    type_id: 1,
    slug: 'formal-shirts',
    icon: 'Briefcase',
    description: '100% Egyptian Cotton wrinkle-free luxury corporate wear',
  },
  {
    category_id: 6,
    category_name: 'CASUAL SHIRTS',
    parent_category_id: 1,
    type_id: 2,
    slug: 'casual-shirts',
    icon: 'Coffee',
    description: 'Linen, checks, denim & breathable printed relaxed shirts',
  },
  {
    category_id: 7,
    category_name: 'OTHER SHIRTS',
    parent_category_id: 1,
    type_id: 3,
    slug: 'shirt-other',
    icon: 'Feather',
    description: 'Contemporary & seasonal shirt variations',
  },

  // T-Shirt Sub-Categories (Parent ID: 2, Type ID: 1..4)
  {
    category_id: 8,
    category_name: 'ROUND NECK',
    parent_category_id: 2,
    type_id: 1,
    slug: 'round-neck',
    icon: 'Smile',
    description: 'Classic crewneck everyday comfortable cotton tees',
  },
  {
    category_id: 9,
    category_name: 'POLO',
    parent_category_id: 2,
    type_id: 2,
    slug: 'polo',
    icon: 'Award',
    description: 'Pique knit polo shirts with tipped collars',
  },
  {
    category_id: 10,
    category_name: 'OVERSIZED',
    parent_category_id: 2,
    type_id: 3,
    slug: 'oversized',
    icon: 'Layers',
    description: 'Drop-shoulder relaxed streetwear fits',
  },
  {
    category_id: 11,
    category_name: 'OTHER T-SHIRTS',
    parent_category_id: 2,
    type_id: 4,
    slug: 'tshirt-other',
    icon: 'Sparkles',
    description: 'Henleys, hooded tees, and tanks',
  },

  // Pants Sub-Categories (Parent ID: 3, Type ID: 1..3)
  {
    category_id: 12,
    category_name: 'JEANS',
    parent_category_id: 3,
    type_id: 1,
    slug: 'jeans',
    icon: 'Layers',
    description: 'Durable stretch selvedge denim in slim and regular cuts',
  },
  {
    category_id: 13,
    category_name: 'COTTON PANTS',
    parent_category_id: 3,
    type_id: 2,
    slug: 'cotton-pants',
    icon: 'Feather',
    description: 'Lightweight chinos and pleated formal trousers',
  },
  {
    category_id: 14,
    category_name: 'OTHER PANTS',
    parent_category_id: 3,
    type_id: 3,
    slug: 'pants-other',
    icon: 'Sliders',
    description: 'Cargo joggers, linen trousers, and casual shorts',
  },

  // Accessories Sub-Categories (Parent ID: 4, Type ID: 1..3)
  {
    category_id: 15,
    category_name: 'WATCHES',
    parent_category_id: 4,
    type_id: 1,
    slug: 'watches',
    icon: 'Watch',
    description: 'Precision chronograph & minimalist dress timepieces',
  },
  {
    category_id: 16,
    category_name: 'SHOES',
    parent_category_id: 4,
    type_id: 2,
    slug: 'shoes',
    icon: 'Footprints',
    description: 'Handcrafted leather brogues, loafers & crisp sneakers',
  },
  {
    category_id: 17,
    category_name: 'OTHER ACCESSORIES',
    parent_category_id: 4,
    type_id: 3,
    slug: 'accessories-other',
    icon: 'Sparkles',
    description: 'Leather belts, cufflinks, and wallets',
  },
];

/**
 * Filter taxonomy hierarchy used in Customer FilterSidebar and CategoryPills
 */
export const HIERARCHICAL_FILTERS = [
  {
    id: 'all',
    label: 'All Menswear',
    parentId: null,
    typeId: null,
    slug: 'all',
  },
  {
    id: 'shirt',
    label: 'Shirt',
    parentId: 1,
    typeId: null,
    slug: 'shirt',
    subCategories: [
      {
        id: 'shirt-formal-shirt',
        filterKey: 'shirt->formal-shirt',
        label: 'Shirt ➔ Formal Shirt',
        parentId: 1,
        typeId: 1,
        name: 'Formal Shirt',
      },
      {
        id: 'shirt-casual-shirt',
        filterKey: 'shirt->casual-shirt',
        label: 'Shirt ➔ Casual Shirt',
        parentId: 1,
        typeId: 2,
        name: 'Casual Shirt',
      },
      {
        id: 'shirt-other',
        filterKey: 'shirt->other',
        label: 'Shirt ➔ Other',
        parentId: 1,
        typeId: 3,
        name: 'Other',
      },
    ],
  },
  {
    id: 't-shirts',
    label: 'T-Shirts',
    parentId: 2,
    typeId: null,
    slug: 't-shirts',
    subCategories: [
      {
        id: 'tshirt-round-neck',
        filterKey: 't-shirts->round-neck',
        label: 'T-Shirts ➔ Round Neck',
        parentId: 2,
        typeId: 1,
        name: 'Round Neck',
      },
      {
        id: 'tshirt-polo',
        filterKey: 't-shirts->polo',
        label: 'T-Shirts ➔ Polo',
        parentId: 2,
        typeId: 2,
        name: 'Polo',
      },
      {
        id: 'tshirt-oversized',
        filterKey: 't-shirts->oversized',
        label: 'T-Shirts ➔ Oversized',
        parentId: 2,
        typeId: 3,
        name: 'Oversized',
      },
      {
        id: 'tshirt-other',
        filterKey: 't-shirts->other',
        label: 'T-Shirts ➔ Other',
        parentId: 2,
        typeId: 4,
        name: 'Other',
      },
    ],
  },
  {
    id: 'pants',
    label: 'Pants',
    parentId: 3,
    typeId: null,
    slug: 'pants',
    subCategories: [
      {
        id: 'pants-jeans',
        filterKey: 'pants->jeans',
        label: 'Pants ➔ Jeans',
        parentId: 3,
        typeId: 1,
        name: 'Jeans',
      },
      {
        id: 'pants-cotton',
        filterKey: 'pants->cotton',
        label: 'Pants ➔ Cotton',
        parentId: 3,
        typeId: 2,
        name: 'Cotton',
      },
      {
        id: 'pants-other',
        filterKey: 'pants->other',
        label: 'Pants ➔ Other',
        parentId: 3,
        typeId: 3,
        name: 'Other',
      },
    ],
  },
  {
    id: 'accessories',
    label: 'Accessories',
    parentId: 4,
    typeId: null,
    slug: 'accessories',
    subCategories: [
      {
        id: 'accessories-watches',
        filterKey: 'accessories->watches',
        label: 'Accessories ➔ Watches',
        parentId: 4,
        typeId: 1,
        name: 'Watches',
      },
      {
        id: 'accessories-shoes',
        filterKey: 'accessories->shoes',
        label: 'Accessories ➔ Shoes',
        parentId: 4,
        typeId: 2,
        name: 'Shoes',
      },
      {
        id: 'accessories-other',
        filterKey: 'accessories->other',
        label: 'Accessories ➔ Other',
        parentId: 4,
        typeId: 3,
        name: 'Other',
      },
    ],
  },
];

export const INITIAL_PRODUCTS = [];

export const STORE_FEATURES = [
  {
    title: 'Free Express Shipping',
    desc: 'On all orders above ₹499 across India',
    icon: 'Truck',
  },
  {
    title: '100% Premium Cotton',
    desc: 'Crafted with breathable, durable fabrics',
    icon: 'ShieldCheck',
  },
  {
    title: '7-Day Easy Returns',
    desc: 'Hassle-free doorstep exchange & refund',
    icon: 'RotateCcw',
  },
  {
    title: 'Instant UPI & COD',
    desc: 'Google Pay, PhonePe, Cards & Cash on Delivery',
    icon: 'CreditCard',
  },
];

export const TESTIMONIALS = [
  {
    name: 'Vikram Sundaram',
    location: 'Chennai, Tamil Nadu',
    rating: 5,
    comment: 'The Oxford Classic White Shirt fits like bespoke tailoring! The cotton quality is thick yet breathable in Chennai humidity.',
    verified: true,
  },
  {
    name: 'Rahul Mehra',
    location: 'Bengaluru, Karnataka',
    rating: 5,
    comment: 'Ordered 2 linen shirts and chinos. Delivered in 2 days. The royal blue and yellow branding is so distinctive, top notch packaging!',
    verified: true,
  },
  {
    name: 'Karthik Rao',
    location: 'Hyderabad, Telangana',
    rating: 5,
    comment: 'Buy & Bye has become my go-to for work shirts. Outstanding fit, wrinkle-free finish, and super easy checkout with UPI.',
    verified: true,
  },
];
