# BUY & BYE — Menswear E-Commerce Platform

A modern, full-featured menswear e-commerce ecosystem consisting of both the **Customer Storefront Web Application** and the **Admin Management Dashboard**.

---

## 📁 Repository Structure

```text
BUY-AND-BYE/
├── buyandbye-customer/       # Customer-facing shopping storefront (React, Vite)
├── buyandbye-admin/          # Enterprise administrator dashboard (React, Vite)
├── .gitignore                # Production security & secret isolation rules
└── README.md                 # Workspace documentation
```

---

## 🌟 Applications Overview

### 1. 🛍️ Customer Web App (`buyandbye-customer`)
*Port: `http://localhost:5174/`*

A customer-facing web application crafted with official brand colors (Electric Royal Blue `#0056D2` & Canary Yellow `#FFC800`).

- **Interactive Menswear Catalog:** Filter by category (Formal Shirts, Casual Shirts, Trousers, Tees), sleeve style, price, and fit profile.
- **Product Details & Sizing:** Zoomable product preview, size guide modal (inches/cm), and quantity stepper.
- **Quick Cart & Wishlist:** Slide-over shopping bag with real-time free delivery progress meter and coupon discount engine.
- **Multi-Step Checkout:** Instant address capture, payment method selection (UPI, Cards, NetBanking, COD), and confetti confirmation.
- **Live Order Tracking:** Track waybill status (`Placed` → `Packed` → `In Transit` → `Delivered`).
- **Customer Authentication:** Passwordless 1-click email OTP verification.

### 2. 🛡️ Admin Management Dashboard (`buyandbye-admin`)
*Port: `http://localhost:5173/`*

A management console for catalog managers, inventory controllers, and store administrators.

- **KPI Analytics & Sales Dashboard:** Live revenue metrics, order velocity, inventory health, and recent orders.
- **Products & Inventory Manager:** Add, edit, archive products with multi-size stock counts and low-stock alerts.
- **Category Hierarchy:** Multi-level parent and sub-category management with image previews.
- **Order Processing:** Update order fulfillment statuses (`Processing`, `Shipped`, `Delivered`, `Cancelled`) with customer history.
- **Customer Database:** Lifetime customer value, order tallies, and direct contact details.
- **Reports & Analytics:** Sales breakdowns, top-selling categories, and performance export.
- **Security & Access Control:** Admin profile management, password updates, and secure session handling.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher recommended)
- `npm` or `yarn`

### 1. Running Customer Storefront
```bash
cd buyandbye-customer
cp .env.example .env
npm install
npm run dev
```
Open **`http://localhost:5174/`** in your browser.

### 2. Running Admin Dashboard
```bash
cd buyandbye-admin
cp .env.example .env
npm install
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

---

## 🔐 Environment & Security

Both applications provide template `.env.example` files:
- **Never commit `.env` files** containing production secrets or sensitive API credentials to version control.
- All environment configurations and credentials are strictly ignored via `.gitignore`.
- Both apps feature resilient offline fallback mechanisms with demo datasets for local preview and testing.

---

## 📄 License
This project is private and proprietary to **BUY & BYE Menswear**.
