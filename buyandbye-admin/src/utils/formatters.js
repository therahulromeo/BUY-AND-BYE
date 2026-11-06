/**
 * BuyAndBye Formatting Utilities
 */

/**
 * Format number as Indian Rupee (INR) or specified currency
 * @param {number|string} amount
 * @param {string} currency
 * @returns {string}
 */
export const formatCurrency = (amount, currency = 'INR') => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount) || numericAmount === null || numericAmount === undefined) {
    return '₹0.00';
  }

  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(numericAmount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

/**
 * Format date string into human-readable format
 * @param {string|Date} dateString
 * @param {boolean} includeTime
 * @returns {string}
 */
export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
  };

  return date.toLocaleDateString('en-US', options);
};

/**
 * Get status badge variant for orders
 * @param {string} status
 * @returns {'success'|'warning'|'danger'|'info'|'purple'|'neutral'}
 */
export const getOrderStatusVariant = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'delivered':
      return 'success';
    case 'shipped':
      return 'info';
    case 'processing':
      return 'purple';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'danger';
    default:
      return 'neutral';
  }
};

/**
 * Get status badge variant for payments
 * @param {string} status
 * @returns {'success'|'warning'|'danger'|'info'|'neutral'}
 */
export const getPaymentStatusVariant = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'paid':
    case 'completed':
    case 'successful':
      return 'success';
    case 'pending':
      return 'warning';
    case 'refunded':
      return 'info';
    case 'failed':
      return 'danger';
    default:
      return 'neutral';
  }
};

/**
 * Get stock status information
 * @param {number} stock
 * @param {number} threshold
 * @returns {{ label: string, variant: 'success'|'warning'|'danger' }}
 */
export const getStockStatus = (stock, threshold = 10) => {
  const stockNum = Number(stock) || 0;
  if (stockNum <= 0) {
    return { label: 'Out of Stock', variant: 'danger' };
  }
  if (stockNum <= threshold) {
    return { label: 'Low Stock', variant: 'warning' };
  }
  return { label: 'In Stock', variant: 'success' };
};

/**
 * Truncate long strings safely
 */
export const truncateText = (text, maxLength = 40) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
