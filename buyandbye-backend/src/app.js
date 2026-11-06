import express from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/loggerMiddleware.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';
import { isMongoConnected } from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const app = express();

// Enable CORS
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(requestLogger);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'BuyAndBye REST API Server',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      categories: '/api/categories',
      products: '/api/products',
      orders: '/api/orders',
      customers: '/api/customers',
      payments: '/api/payments',
      employees: '/api/employees',
      reports: '/api/reports/analytics',
    },
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    uptime: `${Math.floor(process.uptime())}s`,
    database: {
      type: isMongoConnected() ? 'MongoDB' : 'JSON / In-Memory Store (Fallback)',
      connected: true,
      mongoActive: isMongoConnected(),
    },
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/reports', reportRoutes);

// Stock logs alias
app.get('/api/stock-logs', (req, res, next) => {
  req.url = '/stock/logs';
  productRoutes(req, res, next);
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
