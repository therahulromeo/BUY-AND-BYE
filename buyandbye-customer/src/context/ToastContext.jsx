import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const recentToastsRef = useRef(new Map());

  const showToast = useCallback((message, type = 'info', duration = 3000, position = null) => {
    const now = Date.now();
    const lastTime = recentToastsRef.current.get(message) || 0;

    // Deduplicate: If an identical toast was triggered in the last 1500ms, ignore it
    if (now - lastTime < 1500) {
      return;
    }
    recentToastsRef.current.set(message, now);

    // Route all similar blue popups (success/info), wishlist, bag/cart, and general alerts to bottom-center!
    // Only use bottom-right if explicitly requested.
    const targetPosition = position === 'bottom-right' ? 'bottom-right' : 'bottom-center';

    const id = `${now}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => {
      // Remove any existing toast with exact same message
      const filtered = prev.filter((t) => t.message !== message);
      return [...filtered, { id, message, type, position: targetPosition }];
    });

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      recentToastsRef.current.delete(message);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <style>{`
        @keyframes toastSlideUpCenter {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {/* 1. Bottom-Center Container (All Similar Blue Popups & Wishlist) */}
      <div
        className="toast-container-bottom-center"
        style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          zIndex: 999999,
          pointerEvents: 'none',
          width: 'max-content',
          maxWidth: '92vw',
        }}
      >
        {toasts
          .filter((t) => t.position === 'bottom-center' || t.position === 'center')
          .map((t) => {
            const isWishlist = t.message.toLowerCase().includes('wishlist');
            const isBag =
              t.message.toLowerCase().includes('bag') || t.message.toLowerCase().includes('cart');
            const isBlue = isBag || t.type === 'success' || t.type === 'info';

            // Visual theme:
            // - Blue Pop-up Box (#0056D2): for all success/info/bag notifications
            // - Wishlist: Navy (#0A192F) with gold border (#FFC800) and heart
            // - Warning: Amber (#FFC800)
            // - Danger: Red (#EF4444)
            const bgColor = isWishlist
              ? '#0A192F'
              : isBlue
              ? '#0056D2'
              : t.type === 'warning'
              ? '#FFC800'
              : t.type === 'danger'
              ? '#EF4444'
              : '#0056D2';

            const borderColor = isWishlist
              ? '#FFC800'
              : isBlue
              ? '#60A5FA'
              : t.type === 'warning'
              ? '#E6B000'
              : t.type === 'danger'
              ? '#FCA5A5'
              : '#60A5FA';

            const textColor = t.type === 'warning' && !isBlue ? '#0A1324' : '#FFFFFF';

            const shadow = isBlue
              ? '0 12px 32px rgba(0, 86, 210, 0.4), 0 2px 8px rgba(0,0,0,0.12)'
              : '0 12px 32px rgba(10, 25, 47, 0.28), 0 2px 8px rgba(0,0,0,0.12)';

            return (
              <div
                key={t.id}
                onClick={() => removeToast(t.id)}
                style={{
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 24px',
                  borderRadius: '50px',
                  fontSize: '0.925rem',
                  fontWeight: 700,
                  boxShadow: shadow,
                  animation: 'toastSlideUpCenter 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  backgroundColor: bgColor,
                  color: textColor,
                  border: `1.5px solid ${borderColor}`,
                }}
              >
                {isWishlist ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                ) : isBag ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                ) : isBlue ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span>{t.type === 'warning' ? '★' : 'ℹ'}</span>
                )}
                <span>{t.message}</span>
              </div>
            );
          })}
      </div>

      {/* 2. Bottom-Right Container (General notifications) */}
      <div
        className="toast-container"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 999999,
          pointerEvents: 'none',
        }}
      >
        {toasts
          .filter((t) => t.position !== 'bottom-center')
          .map((t) => (
            <div
              key={t.id}
              onClick={() => removeToast(t.id)}
              style={{
                pointerEvents: 'auto',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '0.925rem',
                fontWeight: 600,
                boxShadow: '0 12px 32px rgba(10, 19, 38, 0.2)',
                animation: 'fadeIn 0.25s ease-out forwards',
                backgroundColor:
                  t.type === 'success'
                    ? '#0056D2'
                    : t.type === 'warning'
                    ? '#FFC800'
                    : t.type === 'danger'
                    ? '#EF4444'
                    : '#0A1324',
                color: t.type === 'warning' ? '#0A1324' : '#FFFFFF',
                border:
                  t.type === 'warning'
                    ? '1px solid #E6B000'
                    : '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <span>{t.type === 'success' ? '✓' : t.type === 'warning' ? '★' : 'ℹ'}</span>
              <span>{t.message}</span>
            </div>
          ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
