import { Inbox } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'Try adjusting your search criteria or add new items to the system.',
  actionLabel = null,
  onAction = null,
  actionIcon = null,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-10) var(--spacing-4)',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-bg-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--spacing-3)',
          color: 'var(--color-text-subtle)',
        }}
      >
        <Icon size={28} />
      </div>
      <h4 style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-1)' }}>
        {title}
      </h4>
      <p style={{ maxWidth: '380px', fontSize: 'var(--font-size-sm)', marginBottom: actionLabel ? 'var(--spacing-4)' : 0 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} icon={actionIcon}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
