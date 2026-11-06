import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Shirt, Sparkles, Briefcase, Coffee, Layers, Smile } from 'lucide-react';

export default function CategoryPills() {
  const { selectedCategory, setSelectedCategory } = useStore();

  // Last version of buttons and text
  const categories = [
    { id: 'all', label: 'All Menswear', icon: Sparkles },
    { id: 'formal-shirts', label: 'Formal Shirts', icon: Briefcase },
    { id: 'casual-shirts', label: 'Casual Shirts', icon: Coffee },
    { id: 'trousers', label: 'Trousers & Chinos', icon: Layers },
    { id: 't-shirts', label: 'Polos & T-Shirts', icon: Smile },
    { id: 'full-sleeve', label: 'Full Sleeve', icon: Shirt },
    { id: 'half-sleeve', label: 'Half Sleeve / Resort', icon: Shirt },
  ];

  // Sub-categories appear only when the respective category is clicked / active
  const subCategoriesByParent = {
    'formal-shirts': [
      { id: 'formal-shirts', label: 'All Formal Shirts' },
      { id: 'full-sleeve', label: 'Full Sleeve' },
      { id: 'half-sleeve', label: 'Half Sleeve' },
    ],
    'casual-shirts': [
      { id: 'casual-shirts', label: 'All Casual Shirts' },
      { id: 'full-sleeve', label: 'Full Sleeve' },
      { id: 'half-sleeve', label: 'Half Sleeve' },
    ],
    trousers: [
      { id: 'trousers', label: 'All Trousers & Chinos' },
      { id: 'pants-jeans', label: 'Jeans' },
      { id: 'pants-cotton', label: 'Cotton Pants' },
      { id: 'pants-other', label: 'Other Pants' },
    ],
    't-shirts': [
      { id: 't-shirts', label: 'All Polos & T-Shirts' },
      { id: 'tshirt-round-neck', label: 'Round Neck' },
      { id: 'tshirt-polo', label: 'Polo' },
      { id: 'tshirt-oversized', label: 'Oversized' },
    ],
  };

  // Determine which parent category is currently active
  const activeParentKey = (() => {
    if (selectedCategory === 'formal-shirts') return 'formal-shirts';
    if (selectedCategory === 'casual-shirts') return 'casual-shirts';
    if (selectedCategory === 'trousers' || String(selectedCategory).startsWith('pants-')) return 'trousers';
    if (selectedCategory === 't-shirts' || String(selectedCategory).startsWith('tshirt-')) return 't-shirts';
    return null;
  })();

  const activeSubCategories = activeParentKey ? subCategoriesByParent[activeParentKey] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div className="category-pills-strip">
        {categories.map((c) => {
          const IconComponent = c.icon;
          const isActive =
            selectedCategory === c.id ||
            (c.id === 'trousers' && String(selectedCategory).startsWith('pants-')) ||
            (c.id === 't-shirts' && String(selectedCategory).startsWith('tshirt-'));

          return (
            <button
              key={c.id}
              className={`pill-item ${isActive ? 'active' : ''}`}
              onClick={() => setSelectedCategory(c.id)}
            >
              <IconComponent size={16} />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-categories appear only when the respective category is clicked */}
      {activeSubCategories && activeSubCategories.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '4px',
            flexWrap: 'wrap',
            padding: '6px 12px',
            backgroundColor: '#F8FAFC',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--dark-500, #64748B)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Sub-Categories:
          </span>
          {activeSubCategories.map((sub) => {
            const isSubActive = selectedCategory === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedCategory(sub.id)}
                style={{
                  fontSize: '0.8125rem',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  border: isSubActive ? '1px solid var(--primary-500)' : '1px solid #CBD5E1',
                  backgroundColor: isSubActive ? 'var(--primary-50, #EFF6FF)' : '#FFFFFF',
                  color: isSubActive ? 'var(--primary-600, #2563EB)' : 'var(--dark-700, #334155)',
                  fontWeight: isSubActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {sub.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
