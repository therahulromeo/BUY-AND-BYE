# BUY & BYE — Customer eCommerce Store (Men's Clothing)

A customer-facing web application for **BUY & BYE — MENS CLOTHING**. Built from the ground up with the brand's official color palette (Electric Royal Blue `#0056D2` & Sunny Canary Yellow `#FFC800`), sleek modern aesthetics, and real-time backend synchronization.

Orders placed on this customer website immediately reflect in the **Admin Management Dashboard** (`buyandbye-admin`).

---

## 🎨 Brand Identity & Color Palette

Derived directly from the official **BUY & BYE MENS CLOTHING** brand logo:
- **Primary Royal Blue**: `#0056D2` (Hover: `#0047B3`, Deep: `#002766`, Background Light: `#EEF4FF`)
- **Accent Canary Yellow**: `#FFC800` (Hover: `#E6B000`, Gradient: `linear-gradient(135deg, #FFD200 0%, #FFAA00 100%)`)
- **Obsidian Dark Neutrals**: `#060B14`, `#0A1324`, `#1B2B4E`
- **Clean Surfaces**: `#FFFFFF`, `#F8FAFC`, `#F1F5F9`
- **Typography**: `Outfit` (Headings & Display) and `Plus Jakarta Sans` (UI & Body)

---

## 🌟 Key Customer Features

1. **Brand Showcase & Announcement Strip**:
   - Promo discount ticker (`WELCOME10` for 10% OFF, `BUYBYE20` for 20% OFF).
   - Brand logo with tagline "MENS CLOTHING" and high-res SVG/PNG rendering.
   - Quick "Track Order", "Wishlist", and "Bag" counters with live subtotal.

2. **Hero Experience**:
   - Bold headline: *"Engineered for Men Who Value Pure Distinction"*.
   - Dynamic royal blue gradient with golden ambient glows.
   - Quick jump pills for Formal Shirts, Casual Linens, Chinos, and Polos.
   - Core value props: Free Shipping over ₹499, 100% Breathable Cotton & Linen, 7-Day Easy Returns, Instant UPI & COD.

3. **Catalog & Filtering System**:
   - Filter by Category (All Menswear, Formal Shirts, Casual Shirts, Trousers, Polos & Tees, Full Sleeve, Half Sleeve / Cuban).
   - Sleeve style toggle (Full Sleeve vs. Half Sleeve).
   - Fit profile selector (Slim Fit, Regular Fit, Relaxed Comfort).
   - Real-time Price slider (₹400 – ₹2,500).
   - Sorting options: Bestsellers, Price Low-to-High, Price High-to-Low, Top Rated, Latest Drops.
   - Instant live search with clear button.

4. **Interactive Product Cards & Quick View Modal**:
   - Image zoom preview on hover with Bestseller & Discount badges.
   - Size selector (S, M, L, XL, XXL) with interactive **Size Guide modal** (inches & cm).
   - Color swatches and quantity stepper.
   - "Quick Add" and "Instant Buy Now" buttons.

5. **Quick Cart Drawer**:
   - Slide-over shopping bag with real-time free delivery meter (*"Add ₹X more for FREE Delivery"*).
   - Coupon voucher application with instant discount calculation.
   - Item quantity stepper and instant item removal.

6. **Wishlist Slide-Out**:
   - Save favorite menswear garments with one-click move to shopping bag.

7. **Multi-Step Checkout & Backend Sync**:
   - Step 1: Customer details (Name, Email, Phone number) & Shipping Address.
   - Step 2: Payment method (UPI / Google Pay / PhonePe / Paytm / QR, Credit/Debit Card, Net Banking, Cash on Delivery).
   - Generates realistic order IDs (e.g. `BNB-ORD-1083`) and tracking waybills (`IND-DTDC-XXXXXX`).
   - Celebratory confetti on order placement.
   - **Immediately sends `POST /api/orders` to the backend** and updates shared persistence so the order reflects on the Admin Dashboard instantly!

8. **Live Order Tracking**:
   - Customers can enter any Order ID (e.g. `BNB-ORD-1082`, `BNB-ORD-1083`) or their email.
   - Visual 4-step timeline: Order Placed &rarr; Quality Packed &rarr; In Transit &rarr; Delivered.
   - Itemized manifest and destination confirmation.

---

## 🔗 Architecture & Backend Integration

```text
buyandbye-customer (Port 5174)
       │
       ▼ (REST API: POST /api/orders, GET /api/products)
buyandbye-backend (Port 8080)
       │
       ▼ (MongoDB & store.json persistence)
buyandbye-admin (Port 5173)
```

- **Backend URL**: `http://localhost:8080/api`
- **Orders Endpoint**: `POST /api/orders` &rarr; Creates order, saves to MongoDB/store.json, decrements inventory.
- **Admin Dashboard**: Refreshes or queries `GET /api/orders` &rarr; The customer's newly placed order appears right at the top!

---

## 🚀 How to Run Locally

### 1. Start Customer Store
```bash
cd d:/NEU/buyandbye-customer
npm run dev
```
The website will be live at: **http://localhost:5174/**

### 2. Verify Backend
Ensure `buyandbye-backend` is running on `http://localhost:8080/`.

### 3. Verify Admin Dashboard
Ensure `buyandbye-admin` is running on `http://localhost:5173/`. Navigate to **Orders** or **Dashboard** to see live orders reflect in real-time.
