import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from './ToastContext';
import { productService } from '../services/productService';
import { orderService, matchesUserProfile } from '../services/orderService';
import api from '../services/api';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const { showToast } = useToast();

  // Catalog State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Cart State (Persisted in localStorage)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('buyandbye_customer_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist State (Persisted in localStorage)
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('buyandbye_customer_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [fitFilter, setFitFilter] = useState('all');
  const [sleeveFilter, setSleeveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [maxPrice, setMaxPrice] = useState(Infinity);

  // Modal / Drawer / Page States
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [orderHistoryPageOpen, setOrderHistoryPageOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openProductDetailPage = useCallback((prod) => {
    setSelectedProduct(prod);
    setQuickViewProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Customer Profile State (Persisted in localStorage under buyandbye_customer_profile)
  const [customerProfile, setCustomerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('buyandbye_customer_profile');
      if (saved) return JSON.parse(saved);
      return null;
    } catch {
      return null;
    }
  });

  // Orders State (STRICTLY past & current orders of the current logged-in user)
  const [orders, setOrders] = useState(() => {
    try {
      const savedProf = localStorage.getItem('buyandbye_customer_profile');
      const prof = savedProf ? JSON.parse(savedProf) : null;
      if (!prof) return [];
      const local = orderService.getLocalOrders();
      return local.filter((o) => matchesUserProfile(o, prof));
    } catch {
      return [];
    }
  });

  // Last Placed Order & Active Tracking Order
  const [lastPlacedOrder, setLastPlacedOrder] = useState(() => {
    return orderService.getLastOrder();
  });
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(() => {
    return orderService.getLastOrder();
  });

  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Reload orders strictly for the active user
  const refreshOrders = useCallback(async (targetProfile = customerProfile) => {
    if (!targetProfile) {
      setOrders([]);
      return;
    }
    try {
      const userOrders = await orderService.getUserOrders(targetProfile);
      setOrders(userOrders);
    } catch (e) {
      console.warn('refreshOrders error:', e);
    }
  }, [customerProfile]);

  const saveCustomerProfile = useCallback(async (profileData) => {
    setCustomerProfile(profileData);
    try {
      localStorage.setItem('buyandbye_customer_profile', JSON.stringify(profileData));
    } catch (e) {
      console.warn('Profile persist error:', e);
    }

    // Sync / create customer in backend database and Admin Customer section
    try {
      const res = await api.post('/customers', {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        city: profileData.city,
        state: profileData.state,
        street: profileData.street,
        apartment: profileData.apartment,
        postal_code: profileData.postal_code,
      });
      if (res?.success && res.data?.customer) {
        const fullProf = {
          ...profileData,
          customer_id: res.data.customer.customer_id,
        };
        setCustomerProfile(fullProf);
        try {
          localStorage.setItem('buyandbye_customer_profile', JSON.stringify(fullProf));
        } catch {
          // ignore
        }
      }
    } catch (e) {
      console.warn('Failed to sync customer account to backend:', e);
    }

    refreshOrders(profileData);
  }, [refreshOrders]);

  const clearCustomerProfile = useCallback(() => {
    setCustomerProfile(null);
    setOrders([]);
    try {
      localStorage.removeItem('buyandbye_customer_profile');
    } catch (e) {
      console.warn('Profile clear error:', e);
    }
  }, []);

  useEffect(() => {
    refreshOrders(customerProfile);
  }, [customerProfile, refreshOrders]);

  // Open Dedicated Order History Page (Where tracking is present right below every order)
  const openOrderHistory = useCallback((orderId = null) => {
    refreshOrders();
    setCheckoutOpen(false);
    setOrderHistoryPageOpen(true);
  }, [refreshOrders]);

  // Track Order Directly: navigates to Order History page where live tracking is below each order
  const trackOrderDirectly = useCallback((order) => {
    const target = order || lastPlacedOrder || orderService.getLastOrder();
    setActiveTrackingOrder(target);
    refreshOrders();
    setCheckoutOpen(false);
    setOrderHistoryPageOpen(true);
  }, [lastPlacedOrder, refreshOrders]);

  // Promo Code State
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Sync Cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('buyandbye_customer_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Cart persist error', e);
    }
  }, [cart]);

  // Sync Wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('buyandbye_customer_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Wishlist persist error', e);
    }
  }, [wishlist]);

  // Initial Data Fetch
  useEffect(() => {
    async function initCatalog() {
      setLoadingProducts(true);
      try {
        const [prodList, catList] = await Promise.all([
          productService.getAll(),
          productService.getCategories(),
        ]);
        setProducts(prodList);
        setCategories(catList);
      } catch (err) {
        console.error('Failed to load catalog:', err);
      } finally {
        setLoadingProducts(false);
      }
    }
    initCatalog();
  }, []);

  // Cart Actions
  const addToCart = useCallback(
    (product, quantity = 1, size = 'L', color = null) => {
      const chosenColor = color || (product.colors && product.colors[0]) || 'Standard';
      const itemKey = `${product.product_id}-${size}-${chosenColor}`;

      setCart((prev) => {
        const existingIdx = prev.findIndex((item) => item.itemKey === itemKey);
        if (existingIdx > -1) {
          const updated = [...prev];
          updated[existingIdx].quantity += quantity;
          return updated;
        } else {
          return [
            ...prev,
            {
              itemKey,
              product_id: product.product_id,
              product_name: product.product_name,
              sku: product.sku,
              price: product.price,
              image: product.image,
              quantity,
              selectedSize: size,
              selectedColor: chosenColor,
              category_name: product.category_name,
            },
          ];
        }
      });

      showToast(`Added "${product.product_name}" to your bag`, 'success', 3000, 'bottom-center');
    },
    [showToast]
  );

  const updateCartQty = useCallback((itemKey, newQty) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((i) => i.itemKey !== itemKey));
    } else {
      setCart((prev) =>
        prev.map((item) => (item.itemKey === itemKey ? { ...item, quantity: newQty } : item))
      );
    }
  }, []);

  const removeFromCart = useCallback(
    (itemKey) => {
      setCart((prev) => prev.filter((i) => i.itemKey !== itemKey));
      showToast('Item removed from cart', 'info');
    },
    [showToast]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon(null);
  }, []);

  // Wishlist Actions
  const toggleWishlist = useCallback(
    (product) => {
      const exists = wishlist.some((p) => p.product_id === product.product_id);
      if (exists) {
        setWishlist((prev) => prev.filter((p) => p.product_id !== product.product_id));
        showToast(`Removed "${product.product_name || 'Item'}" from Wishlist`, 'info', 3000, 'bottom-center');
      } else {
        setWishlist((prev) => [...prev, product]);
        showToast(`Added "${product.product_name || 'Item'}" to Wishlist!`, 'warning', 3000, 'bottom-center');
      }
    },
    [wishlist, showToast]
  );

  const isInWishlist = useCallback(
    (productId) => wishlist.some((p) => p.product_id === productId),
    [wishlist]
  );

  // Coupon Logic
  const applyCoupon = useCallback(
    (code) => {
      const clean = (code || '').trim().toUpperCase();
      if (clean === 'WELCOME10') {
        setAppliedCoupon({ code: 'WELCOME10', discountPercent: 10, label: '10% Welcome Discount' });
        showToast('Promo code WELCOME10 applied (10% OFF)!', 'success');
        return true;
      }
      if (clean === 'BUYBYE20') {
        setAppliedCoupon({ code: 'BUYBYE20', discountPercent: 20, label: '20% Mega Brand Offer' });
        showToast('Promo code BUYBYE20 applied (20% OFF)!', 'success');
        return true;
      }
      showToast('Invalid promo code. Try WELCOME10 or BUYBYE20', 'warning');
      return false;
    },
    [showToast]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  }, [showToast]);

  // Derived Calculations
  const cartCount = useMemo(() => {
    return cart.reduce((acc, it) => acc + it.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, it) => acc + it.price * it.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return (cartSubtotal * appliedCoupon.discountPercent) / 100;
  }, [cartSubtotal, appliedCoupon]);

  const taxAmount = useMemo(() => {
    return (cartSubtotal - discountAmount) * 0.05; // 5% GST on apparel
  }, [cartSubtotal, discountAmount]);

  const shippingFee = useMemo(() => {
    if (cartSubtotal === 0) return 0;
    return cartSubtotal >= 499 ? 0 : 49; // Free above ₹499
  }, [cartSubtotal]);

  const cartTotal = useMemo(() => {
    if (cartSubtotal === 0) return 0;
    return Math.max(0, cartSubtotal - discountAmount + taxAmount + shippingFee);
  }, [cartSubtotal, discountAmount, taxAmount, shippingFee]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.product_name.toLowerCase().includes(q);
        const matchesCat = p.category_name?.toLowerCase().includes(q);
        const matchesDesc = p.descriptions?.toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesDesc) return false;
      }

      // Hierarchical Category & Type Filter
      if (selectedCategory !== 'all') {
        const catStr = String(selectedCategory).toLowerCase().trim();
        const baseNorm = String(p.base || p.category_name || '').toLowerCase();
        const typeNorm = String(p.type || p.shirt_type || '').toLowerCase();
        const parentId = Number(p.parent_category_id || p.category_id || 1);
        const typeId = Number(p.type_id || (typeNorm.includes('formal') ? 1 : typeNorm.includes('casual') ? 2 : 1));

        // Format: "Shirt --> Casual Shirt" or "shirt->casual-shirt" or "shirt-casual-shirt"
        if (catStr.includes('-->') || catStr.includes('➔') || catStr.includes('->')) {
          const parts = catStr
            .split(/-->|➔|->/)
            .map((s) => s.trim().toLowerCase());
          const parentPart = parts[0];
          const typePart = parts[1];

          // Match parent
          const matchesParent =
            baseNorm.includes(parentPart) ||
            (parentPart.includes('shirt') && !parentPart.includes('t-shirt') && parentId === 1) ||
            (parentPart.includes('t-shirt') && parentId === 2) ||
            (parentPart.includes('pant') && parentId === 3) ||
            (parentPart.includes('accessor') && parentId === 4);

          // Match type
          const matchesType =
            typeNorm.includes(typePart) ||
            (typePart.includes('formal') && typeId === 1) ||
            (typePart.includes('casual') && typeId === 2) ||
            (typePart.includes('other') && typeId === 3) ||
            (typePart.includes('round') && typeId === 1) ||
            (typePart.includes('polo') && typeId === 2) ||
            (typePart.includes('oversized') && typeId === 3) ||
            (typePart.includes('jeans') && typeId === 1) ||
            (typePart.includes('cotton') && typeId === 2) ||
            (typePart.includes('watch') && typeId === 1) ||
            (typePart.includes('shoe') && typeId === 2);

          if (!matchesParent || !matchesType) return false;
        } else if (catStr === 'formal-shirts' || catStr === 'shirt-formal-shirt' || catStr === 'formal') {
          // Formal Shirt under Shirt (Category ID 1, Type ID 1)
          if (parentId !== 1) return false;
          if (typeId !== 1 && !typeNorm.includes('formal') && !p.product_name.toLowerCase().includes('formal')) {
            return false;
          }
        } else if (catStr === 'casual-shirts' || catStr === 'shirt-casual-shirt' || catStr === 'casual') {
          // Casual Shirt under Shirt (Category ID 1, Type ID 2)
          if (parentId !== 1) return false;
          if (typeId !== 2 && !typeNorm.includes('casual') && !p.product_name.toLowerCase().includes('casual')) {
            return false;
          }
        } else if (catStr === 'shirt-other') {
          if (parentId !== 1) return false;
          if (typeId !== 3 && !typeNorm.includes('other')) return false;
        } else if (catStr === 'tshirt-round-neck' || catStr === 'round-neck') {
          if (parentId !== 2) return false;
          if (typeId !== 1 && !typeNorm.includes('round')) return false;
        } else if (catStr === 'tshirt-polo' || catStr === 'polo') {
          if (parentId !== 2) return false;
          if (typeId !== 2 && !typeNorm.includes('polo') && !p.product_name.toLowerCase().includes('polo')) return false;
        } else if (catStr === 'tshirt-oversized' || catStr === 'oversized') {
          if (parentId !== 2) return false;
          if (typeId !== 3 && !typeNorm.includes('oversized')) return false;
        } else if (catStr === 'pants-jeans' || catStr === 'jeans') {
          if (parentId !== 3) return false;
          if (typeId !== 1 && !typeNorm.includes('jeans')) return false;
        } else if (catStr === 'pants-cotton' || catStr === 'cotton' || catStr === 'cotton-pants') {
          if (parentId !== 3) return false;
          if (typeId !== 2 && !typeNorm.includes('cotton')) return false;
        } else if (catStr === 'accessories-watches' || catStr === 'watches') {
          if (parentId !== 4) return false;
          if (typeId !== 1 && !typeNorm.includes('watch')) return false;
        } else if (catStr === 'accessories-shoes' || catStr === 'shoes') {
          if (parentId !== 4) return false;
          if (typeId !== 2 && !typeNorm.includes('shoe')) return false;
        } else if (catStr === 'shirts' || catStr === 'shirt' || catStr === '1') {
          // All Shirt parent category
          if (parentId !== 1 && !baseNorm.includes('shirt')) return false;
        } else if (catStr === 't-shirts' || catStr === 't-shirt' || catStr === '2') {
          // All T-Shirts parent category
          if (parentId !== 2 && !baseNorm.includes('t-shirt') && !baseNorm.includes('polo')) return false;
        } else if (catStr === 'pants' || catStr === 'pant' || catStr === 'trousers' || catStr === '3') {
          // All Pants parent category
          if (parentId !== 3 && !baseNorm.includes('pant') && !baseNorm.includes('trouser')) return false;
        } else if (catStr === 'accessories' || catStr === 'accesorries' || catStr === '4') {
          // All Accessories parent category
          if (parentId !== 4 && !baseNorm.includes('accessor')) return false;
        } else if (catStr === 'full-sleeve' && p.sleeves !== 'Full Sleeve') {
          return false;
        } else if (catStr === 'half-sleeve' && p.sleeves !== 'Half Sleeve') {
          return false;
        }
      }

      // Fit Filter
      if (fitFilter && fitFilter !== 'all') {
        if (p.fit !== fitFilter) return false;
      }

      // Sleeve Filter
      if (sleeveFilter && sleeveFilter !== 'all') {
        if (p.sleeves !== sleeveFilter) return false;
      }

      // Price Filter
      if (typeof maxPrice === 'number' && isFinite(maxPrice) && maxPrice > 0) {
        if (p.price > maxPrice) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return b.product_id - a.product_id;
      return (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0);
    });
  }, [products, searchQuery, selectedCategory, fitFilter, sleeveFilter, maxPrice, sortBy]);

  const value = {
    products,
    categories,
    loadingProducts,
    cart,
    wishlist,
    cartCount,
    cartSubtotal,
    discountAmount,
    taxAmount,
    shippingFee,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    toggleWishlist,
    isInWishlist,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    fitFilter,
    setFitFilter,
    sleeveFilter,
    setSleeveFilter,
    sortBy,
    setSortBy,
    maxPrice,
    setMaxPrice,
    filteredProducts,
    cartOpen,
    setCartOpen,
    wishlistOpen,
    setWishlistOpen,
    checkoutOpen,
    setCheckoutOpen,
    trackingOpen,
    setTrackingOpen,
    orderHistoryPageOpen,
    setOrderHistoryPageOpen,
    orders,
    refreshOrders,
    openOrderHistory,
    sizeGuideOpen,
    setSizeGuideOpen,
    quickViewProduct,
    setQuickViewProduct,
    selectedProduct,
    setSelectedProduct,
    openProductDetailPage,
    lastPlacedOrder,
    setLastPlacedOrder,
    activeTrackingOrder,
    setActiveTrackingOrder,
    trackOrderDirectly,
    customerProfile,
    saveCustomerProfile,
    clearCustomerProfile,
    profileModalOpen,
    setProfileModalOpen,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}
