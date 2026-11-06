# BuyAndBye E-Commerce REST API Backend (Node.js + Express + MongoDB)

High-performance, lightweight REST API backend for the **BuyAndBye** e-commerce platform and admin portal. Built strictly using **Node.js**, **Express.js**, and **MongoDB** (via **Mongoose**).

---

## 🚀 Key Features

- **Built with Node.js & Express.js**: Pure, modular ES Module architecture.
- **MongoDB & Mongoose ODM**:
  - Schema-based data modeling with validation.
  - Automatic collection creation and auto-seeding if the database is newly initialized.
  - Works with local MongoDB (`mongodb://127.0.0.1:27017/buyandbye`) or MongoDB Atlas cloud clusters.
- **Complete RESTful Endpoints**:
  - 🔐 **Admin Authentication**: JWT tokens, login, profile updates, and password management.
  - 🏷️ **Categories**: Nested category hierarchy (`MEN` > `SHIRTS` > `CASUAL SHIRTS` > `FULL SLEEVE`) with real-time dynamic product counts.
  - 📦 **Products & Inventory**: Search, category filters, stock status filters, sorting, and inventory adjustment audit trails.
  - 🛒 **Orders**: Complete order lifecycle (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`), payment tracking, and checkout creation.
  - 👥 **Customers**: Customer records, order history, and spending analytics.
  - 💳 **Payments**: Razorpay, Stripe, Net Banking, and COD transactions with financial summaries.
  - 👔 **Employees**: Full CRUD for store & warehouse personnel.
  - 📊 **Reports & Analytics**: Monthly revenue charts, category share, weekly sales, and top-performing products.
- **CORS Enabled**: Ready to connect with `buyandbye-admin` on `http://localhost:5173` or any storefront.
- **Auto-Persistent Fallback**: If MongoDB is not yet running, the server runs with an auto-persisted local store so development and testing never stall.

---

## 📁 Project Structure

```
buyandbye-backend/
├── .env                  # Environment variables (MONGODB_URI, PORT, etc.)
├── .env.example          # Template environment file
├── .gitignore            # Git ignore definitions
├── package.json          # Node.js project manifest & scripts
├── README.md             # Documentation & API specs
├── data/
│   └── store.json        # Auto-persisted local fallback store
└── src/
    ├── app.js            # Express application configuration
    ├── server.js         # HTTP server entry point & startup
    ├── config/
    │   └── db.js         # MongoDB connection & auto-seeder
    ├── data/
    │   ├── initialData.js# Default seed dataset
    │   └── dataStore.js  # Unified data access layer (MongoDB + fallback)
    ├── models/
    │   ├── Admin.js      # Mongoose Admin model
    │   ├── Category.js   # Mongoose Category model
    │   ├── Product.js    # Mongoose Product model
    │   ├── Order.js      # Mongoose Order model
    │   ├── Customer.js   # Mongoose Customer model
    │   ├── Payment.js    # Mongoose Payment model
    │   ├── Employee.js   # Mongoose Employee model
    │   └── StockLog.js   # Mongoose StockLog model
    ├── middleware/
    │   ├── authMiddleware.js   # JWT token validation
    │   ├── errorMiddleware.js  # 404 handler and error formatter
    │   └── loggerMiddleware.js # HTTP request logger
    ├── controllers/
    │   ├── authController.js
    │   ├── categoryController.js
    │   ├── productController.js
    │   ├── orderController.js
    │   ├── customerController.js
    │   ├── paymentController.js
    │   ├── employeeController.js
    │   └── reportController.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── categoryRoutes.js
    │   ├── productRoutes.js
    │   ├── orderRoutes.js
    │   ├── customerRoutes.js
    │   ├── paymentRoutes.js
    │   ├── employeeRoutes.js
    │   └── reportRoutes.js
    └── scripts/
        └── seedMongo.js  # MongoDB seed script (`npm run seed`)
```

---

## ⚙️ Quick Start

### 1. Install Dependencies
```bash
cd buyandbye-backend
npm install
```

### 2. Configure MongoDB in `.env`
Open `.env` and set your MongoDB connection string:
```env
PORT=8080
NODE_ENV=development
JWT_SECRET=buyandbye_jwt_secret_key_2026_super_secure
CORS_ORIGIN=*

# Local MongoDB:
MONGODB_URI=mongodb://127.0.0.1:27017/buyandbye

# OR MongoDB Atlas Cloud:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/buyandbye?retryWrites=true&w=majority
```

### 3. Seed MongoDB (Optional)
To populate all collections with default admin, categories, and products:
```bash
npm run seed
```

### 4. Start Server

**Development Mode (auto-reloads on edits):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The API will be available at:
- **Base URL:** `http://localhost:8080/api`
- **Health Check:** `http://localhost:8080/api/health`

---

## 📡 API Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Login with username and password |
| `GET` | `/api/auth/me` | Get authenticated admin profile |
| `PUT` | `/api/auth/profile` | Update name, email, avatar |
| `POST` | `/api/auth/change-password`| Change admin password |

**Default Admin Credentials:**
- **Username:** `admin` (or `vicky`)
- **Password:** `admin123`

---

### 🏷️ Categories (`/api/categories`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories?search=&status=` | Get all categories with dynamic product counts |
| `GET` | `/api/categories/:id` | Get category by ID |
| `POST` | `/api/categories` | Create a new category |
| `PUT` | `/api/categories/:id` | Update category details |
| `DELETE` | `/api/categories/:id` | Delete category (checks product constraints) |

---

### 📦 Products & Inventory (`/api/products`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Get products (filters: `search`, `categoryId`, `status`, `sortBy`, `sortOrder`) |
| `GET` | `/api/products/:id` | Get product by ID |
| `POST` | `/api/products` | Create product and record initial stock log |
| `PUT` | `/api/products/:id` | Update product details |
| `DELETE` | `/api/products/:id` | Delete product from catalog |
| `POST` | `/api/products/:id/adjust-stock` | Adjust stock level (`ADD`, `SUBTRACT`, `SET`) with audit trail |
| `GET` | `/api/products/stock/logs` | Retrieve stock adjustment audit history |

---

### 🛒 Orders (`/api/orders`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/orders` | Get orders (filters: `search`, `status`, `paymentStatus`, `sortBy`, `sortOrder`) |
| `GET` | `/api/orders/:id` | Get order details by ID |
| `POST` | `/api/orders` | Place new order (checkout) |
| `PATCH` | `/api/orders/:id/status` | Update order status (`Processing`, `Shipped`, `Delivered`, `Cancelled`) |
| `GET` | `/api/orders/stats/summary` | Get dashboard summary KPIs (sales, totals, stock alerts) |

---

### 👥 Customers (`/api/customers`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/customers?search=&status=` | Get customer list |
| `GET` | `/api/customers/:id` | Get customer profile and order history |

---

### 💳 Payments (`/api/payments`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/payments?search=&status=&gateway=` | Get transaction logs |
| `GET` | `/api/payments/summary` | Get financial volume & status summary |

---

### 👔 Employees (`/api/employees`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/employees` | Get all employees |
| `GET` | `/api/employees/:id` | Get employee by ID |
| `POST` | `/api/employees` | Add employee (`employee_name`, `employee_salary`, `employee_worktype`) |
| `PUT` | `/api/employees/:id` | Update employee information |
| `DELETE` | `/api/employees/:id` | Remove employee |

---

### 📊 Reports (`/api/reports`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/reports/analytics` | Monthly revenue, category share, weekly sales, top 5 products |
