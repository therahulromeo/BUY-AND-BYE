import React from 'react';
import { useStore } from '../../context/StoreContext';
import ProductCard from './ProductCard';
import { PackageX, Sparkles } from 'lucide-react';

export default function ProductGrid() {
  const {
    products,
    filteredProducts,
    loadingProducts,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
  } = useStore();

  if (loadingProducts) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.75rem',
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            style={{
              height: '380px',
              borderRadius: '16px',
              backgroundColor: '#E2E8F0',
              animation: 'pulse 1.5s infinite ease-in-out',
            }}
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '4.5rem 2rem',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px dashed var(--border-light)',
        }}
      >
        <PackageX size={56} color="var(--dark-400)" style={{ margin: '0 auto 1.25rem' }} />
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark-900)' }}>
          Catalog Currently Empty
        </h3>
        <p style={{ color: 'var(--dark-500)', maxWidth: '440px', margin: '0.5rem auto 1.5rem', lineHeight: 1.6 }}>
          All previous product data has been cleared. Products added via the Admin Portal will automatically appear here.
        </p>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px dashed var(--border-light)',
        }}
      >
        <PackageX size={52} color="var(--dark-400)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark-900)' }}>
          No Matching Men's Apparel Found
        </h3>
        <p style={{ color: 'var(--dark-500)', maxWidth: '420px', margin: '0.5rem auto 1.5rem' }}>
          We couldn't find items matching your search or active filter combination. Try resetting
          your filters to see all available garments.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSearchQuery('');
            setSelectedCategory('all');
          }}
        >
          <Sparkles size={16} /> View All Menswear Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="products-grid">
      {filteredProducts.map((product) => (
        <ProductCard key={product.product_id} product={product} />
      ))}
    </div>
  );
}
