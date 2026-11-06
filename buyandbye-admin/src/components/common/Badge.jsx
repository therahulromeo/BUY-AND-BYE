const Badge = ({
  children,
  variant = 'neutral', // 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral'
  dot = true,
  className = '',
  style = {},
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`} style={style}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
};

export default Badge;
