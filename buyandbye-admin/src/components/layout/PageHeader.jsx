const PageHeader = ({
  title,
  subtitle,
  actions = null,
  breadcrumbs = [],
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--spacing-6)',
        flexWrap: 'wrap',
        gap: 'var(--spacing-3)',
      }}
    >
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" style={{ marginBottom: '4px' }}>
            <ol
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                listStyle: 'none',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-subtle)',
              }}
            >
              {breadcrumbs.map((crumb, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {idx > 0 && <span>/</span>}
                  {crumb.path ? (
                    <a href={crumb.path} style={{ color: 'var(--color-text-muted)' }}>
                      {crumb.label}
                    </a>
                  ) : (
                    <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
