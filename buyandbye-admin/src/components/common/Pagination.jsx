import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages, currentPage + 1);

      if (currentPage <= 2) {
        end = 3;
      }
      if (currentPage >= totalPages - 1) {
        start = totalPages - 2;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--spacing-3) 0',
        flexWrap: 'wrap',
        gap: 'var(--spacing-3)',
        fontSize: 'var(--font-size-xs)',
        color: 'var(--color-text-muted)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
        <span>
          Showing <strong style={{ color: 'var(--color-text-primary)' }}>{startItem}</strong> to{' '}
          <strong style={{ color: 'var(--color-text-primary)' }}>{endItem}</strong> of{' '}
          <strong style={{ color: 'var(--color-text-primary)' }}>{totalItems}</strong> entries
        </span>
        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'var(--spacing-3)' }}>
            <span>Per page:</span>
            <select
              className="form-select"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{ width: 'auto', padding: '2px 8px', fontSize: 'var(--font-size-xs)' }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          icon={ChevronLeft}
          aria-label="Previous page"
        />

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            style={{
              minWidth: '28px',
              height: '28px',
              padding: '0 6px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: p === currentPage ? '600' : '400',
              backgroundColor: p === currentPage ? 'var(--color-primary)' : 'transparent',
              color: p === currentPage ? '#ffffff' : 'var(--color-text-secondary)',
              border: p === currentPage ? '1px solid var(--color-primary)' : '1px solid var(--color-border-default)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            {p}
          </button>
        ))}

        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          icon={ChevronRight}
          aria-label="Next page"
        />
      </div>
    </div>
  );
};

export default Pagination;
