# BuyAndBye — E-Commerce Admin Dashboard

A commercial-grade, modern, and responsive Admin Web Application for the **BuyAndBye** e-commerce platform. Built with **React**, **Vite**, **JavaScript (JSX)**, **Vanilla CSS Design System**, **Lucide Icons**, and **Recharts**.

---

## 🚀 Key Features

- **Executive Dashboard**: Real-time sales metrics, revenue trajectory charts, category distribution donut, fulfillment order queue, and low-stock alarms.
- **Product Management**: Full catalog grid with SKU generator, category tagging, pricing, cost calculation, stock levels, status badges, image preview, add/edit modal, and delete confirmation dialogs.
- **Category Hierarchy**: Multi-level category tree (Men's Apparel &rarr; Shirts, Trousers &rarr; Formal/Casual &rarr; Full/Half Sleeve), image associations, and dynamic product count counters.
- **Inventory & Stock Control**: Stock valuations, safety threshold monitor, quick stock adjustment modal (Add / Deduct / Set) with complete audit trail history.
- **Order Management**: Multi-state order fulfillment pipeline (Pending, Processing, Shipped, Delivered, Cancelled), customer shipping details, itemized line items, and invoice print capabilities.
- **Customer Directory**: Registered buyer profiles, lifetime spend, order volume history, and contact coordinates.
- **Transactions & Payments**: Multi-gateway payment ledger (Razorpay, Stripe, UPI, NetBanking, COD), transaction reference codes, and status filters.
- **Reports & Analytics**: Time-series sales velocity, day-of-week performance, best-selling SKUs, and instant CSV export.
- **Settings & Security**: Administrator profile management, password change interface, store currencies (INR ₹, USD $), tax rates, and alert notification toggles.

---

## 📂 Strict Folder Structure

```text
buyandbye-admin/
├── public/
│   └── images/
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Pagination.jsx
│   │   │   └── SearchBar.jsx
│   │   ├── layout/
│   │   │   ├── PageHeader.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Topbar.jsx
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── orders/
│   │   └── inventory/
│   ├── layouts/
│   │   └── AdminLayout.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Products.jsx
│   │   ├── Categories.jsx
│   │   ├── Inventory.jsx
│   │   ├── Orders.jsx
│   │   ├── Customers.jsx
│   │   ├── Payments.jsx
│   │   ├── Reports.jsx
│   │   ├── Settings.jsx
│   │   └── NotFound.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── categoryService.js
│   │   ├── customerService.js
│   │   ├── mockData.js
│   │   ├── orderService.js
│   │   ├── paymentService.js
│   │   ├── productService.js
│   │   ├── reportService.js
│   │   └── storage.js
│   ├── hooks/
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ToastContext.jsx
│   ├── utils/
│   │   └── formatters.js
│   ├── styles/
│   │   ├── global.css
│   │   └── variables.css
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .env
├── index.html
├── package.json
└── README.md
```

---

## 🛠 Technology Stack

- **Framework**: React 19 + Vite
- **Language**: JavaScript (JSX)
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Data Visualizations**: Recharts
- **HTTP Client**: Axios with Bearer token interceptor
- **Styling**: Pure CSS Design System with CSS Custom Properties (`variables.css` & `global.css`)

---

## 🔐 Demo Credentials

Configured from `buynbye_db2.sql`:

| Username | Password | Role |
| :--- | :--- | :--- |
| `admin` | `admin123` | Super Administrator |
| `vicky` | `admin123` | Administrator |

*Tip: Quick-fill buttons are provided directly on the Login screen for 1-click testing.*

---

## ⚡ Getting Started

### 1. Install Dependencies

```bash
cd buyandbye-admin
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME="BuyAndBye Admin"
VITE_APP_VERSION="1.0.0"
```

### 3. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 4. Build for Production

```bash
npm run build
```

---

## 🔌 Java Spring Boot REST API Integration

The frontend is pre-architected in `src/services/` to integrate with the BuyAndBye Spring Boot backend:

- **Base Axios Client** (`src/services/api.js`): Automatically extracts `VITE_API_BASE_URL` and attaches `Authorization: Bearer <JWT>` to every outgoing request.
- **Service Isolation**: Page components never invoke Axios directly; they consume domain services (`productService`, `orderService`, etc.) which handle data transformations, error states, and storage synchronization.
