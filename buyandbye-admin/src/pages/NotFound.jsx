import { useNavigate } from 'react-router-dom';
import { ShoppingBasket, ArrowLeft, Home } from 'lucide-react';
import Button from '../components/common/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--spacing-6)',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--spacing-4)',
        }}
      >
        <ShoppingBasket size={36} />
      </div>

      <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>
        404
      </h1>
      <h2 style={{ fontSize: 'var(--font-size-xl)', marginTop: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: '420px', marginBottom: 'var(--spacing-6)' }}>
        The administrative view or resource you are looking for does not exist or has been relocated.
      </p>

      <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Button variant="primary" icon={Home} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
