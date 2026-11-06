import api from './api';
import { DASHBOARD_ANALYTICS } from './mockData';
import { getStored, STORAGE_KEYS } from './storage';

export const reportService = {
  async getAnalytics(timeRange = '30d') {
    try {
      const res = await api.get('/reports/analytics', { params: { timeRange } });
      if (res && res.analytics) return res.analytics;
    } catch (err) {
      console.warn('[ReportService] Backend offline, calculating locally:', err.message);
    }

    const products = getStored(STORAGE_KEYS.PRODUCTS, []);
    const orders = getStored(STORAGE_KEYS.ORDERS, []);

    const productSalesMap = {};
    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        if (!productSalesMap[item.product_id]) {
          productSalesMap[item.product_id] = {
            id: item.product_id,
            name: item.name,
            sku: item.sku,
            unitsSold: 0,
            revenue: 0,
          };
        }
        productSalesMap[item.product_id].unitsSold += item.quantity;
        productSalesMap[item.product_id].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      monthlyRevenue: DASHBOARD_ANALYTICS.monthlyRevenue,
      categoryShare: DASHBOARD_ANALYTICS.categoryShare,
      weeklySales: DASHBOARD_ANALYTICS.weeklySales,
      topProducts,
      totalCatalogProducts: products.length,
      totalRecordedOrders: orders.length,
    };
  },

  exportToCsv(filename, rows) {
    if (!rows || !rows.length) return false;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map((row) =>
          keys
            .map((k) => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k];
              cell = typeof cell === 'object' ? JSON.stringify(cell) : String(cell);
              cell = cell.replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(separator)
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  },
};
