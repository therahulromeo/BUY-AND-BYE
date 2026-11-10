import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  RotateCcw,
  Shirt,
  Sparkles,
  Smile,
  Layers,
  Watch,
  Briefcase,
  Coffee,
  Award,
  Feather,
  Footprints,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { HIERARCHICAL_FILTERS } from '../../data/catalogData';

// Icons tailored to each category type
const getCategoryIcon = (parentId) => {
  switch (parentId) {
    case 'all':
      return Sparkles;
    case 'shirt':
      return Shirt;
    case 't-shirts':
      return Smile;
    case 'pants':
      return Layers;
    case 'accessories':
      return Watch;
    default:
      return Sparkles;
  }
};

// Icons tailored to each sub-category type
const getSubCategoryIcon = (subId) => {
  const s = String(subId).toLowerCase();
  if (s.includes('formal')) return Briefcase;
  if (s.includes('casual')) return Coffee;
  if (s.includes('polo')) return Award;
  if (s.includes('round')) return Smile;
  if (s.includes('oversized')) return Layers;
  if (s.includes('jeans')) return Layers;
  if (s.includes('cotton')) return Feather;
  if (s.includes('watch')) return Watch;
  if (s.includes('shoe')) return Footprints;
  return Shirt;
};

export default function FilterSidebar({ isMobile = false, onClose }) {
  const {
    selectedCategory,
    setSelectedCategory,
    sleeveFilter,
    setSleeveFilter,
  } = useStore();

  const [openCategoryId, setOpenCategoryId] = useState(() => {
    if (selectedCategory && selectedCategory !== 'all') {
      const cat = String(selectedCategory).toLowerCase();
      if (cat.includes('shirt') || cat === 'formal-shirts' || cat === 'casual-shirts' || cat === 'full-sleeve' || cat === 'half-sleeve') {
        return 'shirt';
      }
      if (cat.includes('t-shirt') || cat.includes('tshirt') || cat.includes('polo')) return 't-shirts';
      if (cat.includes('pant') || cat.includes('trouser')) return 'pants';
      if (cat.includes('accessor')) return 'accessories';
    }
    return null;
  });

  // Synchronize open category when external triggers (like hero pills) change selectedCategory
  useEffect(() => {
    if (selectedCategory === 'all') {
      setOpenCategoryId(null);
      return;
    }
    const cat = String(selectedCategory).toLowerCase();
    let newParent = null;
    if (cat.includes('shirt') || cat === 'formal-shirts' || cat === 'casual-shirts' || cat === 'full-sleeve' || cat === 'half-sleeve') {
      newParent = 'shirt';
    } else if (cat.includes('t-shirt') || cat.includes('tshirt') || cat.includes('polo')) {
      newParent = 't-shirts';
    } else if (cat.includes('pant') || cat.includes('trouser')) {
      newParent = 'pants';
    } else if (cat.includes('accessor')) {
      newParent = 'accessories';
    }

    if (newParent && openCategoryId !== newParent) {
      setOpenCategoryId(newParent);
    }
  }, [selectedCategory]);

  const handleReset = () => {
    setSelectedCategory('all');
    setOpenCategoryId(null);
    setSleeveFilter('all');
  };

  const isFilterActive = (filterId, altMatches = []) => {
    if (selectedCategory === filterId) return true;
    return altMatches.includes(selectedCategory);
  };

  // Toggle category open / close on click
  const handleParentClick = (parent) => {
    if (openCategoryId === parent.id) {
      // Closes when clicked again!
      setOpenCategoryId(null);
    } else {
      // Opens on click
      setOpenCategoryId(parent.id);
      setSelectedCategory(parent.id);
    }
  };

  // Check if Shirt is currently selected
  const isShirtSelected = (() => {
    const cat = String(selectedCategory || '').toLowerCase();
    return (
      cat === 'shirt' ||
      cat === 'shirts' ||
      cat === '1' ||
      cat === 'formal-shirts' ||
      cat === 'casual-shirts' ||
      cat === 'full-sleeve' ||
      cat === 'half-sleeve' ||
      cat.startsWith('shirt-') ||
      cat.includes('shirt') ||
      openCategoryId === 'shirt'
    );
  })();

  return (
    <aside className={isMobile ? "filter-sidebar-mobile" : "filter-sidebar"}>
      {/* Categories Header & Reset */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--border-light, #E2E8F0)',
        }}
      >
        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--dark-900)' }}>
          Categories
        </span>
        <button
          onClick={handleReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--primary-600)',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: 0,
          }}
          title="Reset All Filters"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Category List */}
      <div className="filter-group">
        {/* All Menswear */}
        <div
          className={`filter-option ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => {
            setSelectedCategory('all');
            setOpenCategoryId(null);
          }}
          style={{
            fontWeight: selectedCategory === 'all' ? 700 : 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 0',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--primary-500)" />
            <span>All Menswear</span>
          </div>
          <input
            type="radio"
            checked={selectedCategory === 'all'}
            onChange={() => {}}
            style={{ accentColor: 'var(--primary-500)' }}
          />
        </div>

        {/* Hierarchical Categories */}
        {HIERARCHICAL_FILTERS.filter((group) => group.id !== 'all').map((parent) => {
          const ParentIcon = getCategoryIcon(parent.id);
          const isParentActive = isFilterActive(parent.id, [
            parent.slug,
            `${parent.slug}s`,
          ]);
          const isOpen = openCategoryId === parent.id;

          return (
            <div key={parent.id} style={{ marginTop: '0.5rem' }}>
              {/* Category Header */}
              <div
                className={`filter-option ${isParentActive ? 'active' : ''}`}
                onClick={() => handleParentClick(parent)}
                style={{
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ParentIcon size={16} color="var(--primary-500)" />
                  <span>{parent.label}</span>
                  {parent.subCategories && (
                    <span style={{ color: 'var(--dark-400)', display: 'inline-flex', alignItems: 'center' }}>
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                  )}
                </div>
                <input
                  type="radio"
                  checked={isParentActive}
                  onChange={() => {}}
                  style={{ accentColor: 'var(--primary-500)' }}
                />
              </div>

              {/* Sub-Categories: ONLY open when this category is clicked/expanded */}
              {isOpen && parent.subCategories && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    paddingLeft: '1.25rem',
                    borderLeft: '2px solid rgba(226, 232, 240, 0.9)',
                    marginLeft: '8px',
                    marginTop: '4px',
                    marginBottom: '8px',
                  }}
                >
                  {parent.subCategories.map((sub) => {
                    const SubIcon = getSubCategoryIcon(sub.id);
                    const isSubActive = isFilterActive(sub.id, [
                      sub.filterKey,
                      sub.name.toLowerCase(),
                      sub.name.toLowerCase().replace(/\s+/g, '-'),
                      `${sub.name.toLowerCase().replace(/\s+/g, '-')}s`,
                    ]);

                    return (
                      <div
                        key={sub.id}
                        className={`filter-option ${isSubActive ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(sub.id)}
                        style={{
                          fontSize: '0.825rem',
                          padding: '4px 0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <SubIcon size={13} color="var(--dark-400)" />
                          <span style={{ fontWeight: isSubActive ? 700 : 400 }}>{sub.name}</span>
                        </div>
                        <input
                          type="radio"
                          checked={isSubActive}
                          onChange={() => {}}
                          style={{ accentColor: 'var(--primary-500)' }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sleeve Style Section - Appears ONLY when Shirt is selected */}
      {isShirtSelected && (
        <div
          className="filter-group"
          style={{
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-light, #E2E8F0)',
          }}
        >
          <label
            className="filter-title"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}
          >
            <Shirt size={15} color="var(--primary-500)" />
            <span>Sleeve Style</span>
          </label>
          {[
            { id: 'all', label: 'All Sleeves' },
            { id: 'Full Sleeve', label: 'Full Sleeve' },
            { id: 'Half Sleeve', label: 'Half Sleeve / Cuban' },
            { id: 'Other', label: 'Other' },
          ].map((s) => (
            <div
              key={s.id}
              className={`filter-option ${sleeveFilter === s.id ? 'active' : ''}`}
              onClick={() => setSleeveFilter(s.id)}
              style={{ padding: '4px 0', cursor: 'pointer' }}
            >
              <span>{s.label}</span>
              <input
                type="radio"
                checked={sleeveFilter === s.id}
                onChange={() => {}}
                style={{ accentColor: 'var(--primary-500)' }}
              />
            </div>
          ))}
        </div>
      )}

      {isMobile && onClose && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontWeight: 800 }}
            onClick={onClose}
          >
            Apply & View Products
          </button>
        </div>
      )}
    </aside>
  );
}
