import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading data...', size = 28 }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-10) var(--spacing-4)',
        gap: 'var(--spacing-2)',
        color: 'var(--color-text-muted)',
      }}
    >
      <Loader2 size={size} className="animate-spin" color="var(--color-primary)" />
      {text && <span style={{ fontSize: 'var(--font-size-sm)' }}>{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
