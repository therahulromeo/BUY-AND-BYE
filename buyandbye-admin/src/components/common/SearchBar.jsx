import { Search, X } from 'lucide-react';

const SearchBar = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  className = '',
  style = {},
}) => {
  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        minWidth: '240px',
        ...style,
      }}
      className={className}
    >
      <Search
        size={16}
        style={{
          position: 'absolute',
          left: '10px',
          color: 'var(--color-text-subtle)',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          paddingLeft: '32px',
          paddingRight: value ? '30px' : '10px',
          height: '36px',
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="btn-ghost btn-icon btn-sm"
          style={{
            position: 'absolute',
            right: '6px',
            color: 'var(--color-text-subtle)',
            padding: '2px',
          }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
