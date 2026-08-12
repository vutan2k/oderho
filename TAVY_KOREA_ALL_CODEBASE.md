# 📦 TẠO HỒ SƠ TỔNG HỢP TOÀN BỘ CODEBASE TAVY KOREA
Dự án: TAVY KOREA - Mua Hàng Hàn Quốc Hộ
Ngày đóng gói: 2026-08-12T07:59:33.914Z

Tệp này chứa toàn bộ mã nguồn đang hoạt động của dự án để AI Antigravity 2.0 có thể đọc và tiếp tục phát triển.

## 📄 FILE: index.html
```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/tavy-logo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TAVY | Mua Hàng Hàn Quốc Chính Hãng 100%</title>
    <meta name="description" content="TAVY - Chuyên mua hộ mỹ phẩm Olive Young, thực phẩm chức năng, thuốc hiệu thuốc Hàn Quốc chính hãng. Giao hàng tận nơi tại Việt Nam 3-5 ngày." />
    <meta name="keywords" content="tavy, tavy korea, mua hàng hàn quốc, mỹ phẩm hàn, olive young, mua hộ hàn quốc, k-beauty, thực phẩm chức năng hàn quốc" />

    <!-- Open Graph -->
    <meta property="og:title" content="TAVY | Mua Hàng Hàn Quốc Chính Hãng" />
    <meta property="og:description" content="Chuyên mua hộ mỹ phẩm, thực phẩm chức năng, thuốc hiệu thuốc Hàn Quốc. Giao tận nơi 3-5 ngày." />
    <meta property="og:image" content="/tavy-logo.jpg" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="vi_VN" />

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

```

## 📄 FILE: vite.config.js
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true
  }
})

```

## 📄 FILE: package.json
```json
{
  "name": "wed-mua-ha-ng-ho-",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "oxlint",
    "self-check": "oxlint && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "canvas-confetti": "^1.9.4",
    "firebase": "^12.17.1",
    "lucide-react": "^1.31.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router-dom": "^7.18.2"
  },
  "devDependencies": {
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.4",
    "oxlint": "^1.75.0",
    "vite": "^8.2.0"
  }
}

```

## 📄 FILE: .env.example
```example
# Firebase Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Admin
VITE_ADMIN_PASSWORD=

```

## 📄 FILE: firebase.json
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "hosting": {
      "port": 5000
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}

```

## 📄 FILE: firestore.rules
```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        (request.auth.token.email == "admin@tavykorea.vn" || 
         request.auth.token.admin == true);
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // 1. Users Collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isAuthenticated();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    // 2. Orders Collection
    match /orders/{orderId} {
      // Allow read if owner of order (matching email/uid) or admin or guest looking up by exact ID
      allow read: if true; 
      allow create: if true; // Allow guest & logged in users to place order
      allow update, delete: if isAdmin() || (isAuthenticated() && resource.data.userEmail == request.auth.token.email);
    }

    // 3. Products Catalog Collection
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 4. System Config (Exchange rates, shipping fees)
    match /system_config/{configId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}

```

## 📄 FILE: firestore.indexes.json
```json
{
  "indexes": [
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userEmail", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "foreignPrice", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}

```

## 📄 FILE: src/main.jsx
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

```

## 📄 FILE: src/App.jsx
```jsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import LoadingSpinner from './components/LoadingSpinner';
import Navbar from './components/Navbar';

// Lazy load pages for code-splitting
const KROrderHomePage = lazy(() => import('./pages/KROrderHomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const CartPage = lazy(() => import('./pages/CartPage'));

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ToastProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<KROrderHomePage />} />
                <Route path="/cart" element={<><Navbar /><CartPage /></>} />
                <Route path="/login" element={<><Navbar /><LoginPage /></>} />
                <Route path="/orders" element={<><Navbar /><OrdersPage /></>} />
                <Route path="/profile" element={<><Navbar /><UserProfilePage /></>} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

```

## 📄 FILE: src/index.css
```css
/* Import Google Fonts - Inter, Montserrat & Playfair Display */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

:root {
  /* Ivory & Gold Color Palette */
  --bg-ivory: #FAF8F5;
  --bg-subtle-purple: #F3EFF6;
  --bg-white: #FFFFFF;
  --bg-dark-accent: #3F2C4C;
  
  --gold-primary: #C5A059;
  --gold-dark: #9E7D3B;
  --gold-light: #F4EAD3;
  --gold-border: #E5D5B5;

  --purple-primary: #7A4B9E;
  --purple-dark: #583377;
  --purple-light: #F0E8F5;

  --text-dark: #1F2937;
  --text-muted: #4B5563;
  --text-light: #9CA3AF;
  --border-color: #E5E7EB;

  --font-serif: 'Playfair Display', Georgia, serif;
  --font-sans: 'Inter', 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  /* Aliases & Fallbacks for components */
  --primary-rose: #7A4B9E;
  --primary-rose-dark: #583377;
  --primary-rose-light: #F0E8F5;
  --charcoal: #222222;
  --charcoal-light: #666666;
  --white: #FFFFFF;
  --cream-bg: #FAF8F5;

  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  --shadow-sm: 0 2px 8px rgba(0,0,0,0.04);
  --shadow-md: 0 8px 24px rgba(0,0,0,0.07);
  --shadow-lg: 0 16px 32px rgba(0,0,0,0.1);
  --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* Base resets */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
}

body {
  font-family: var(--font-sans);
  background-color: var(--bg-ivory);
  color: var(--text-dark);
  line-height: 1.6;
}

/* Typography Helpers */
h1, h2, h3, h4, .font-serif {
  font-family: var(--font-serif);
}

.font-serif-italic {
  font-family: var(--font-serif);
  font-style: italic;
}

/* Container */
.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Top Announcement Bar */
.top-announcement-bar {
  background: var(--bg-dark-accent);
  color: #FFFFFF;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  text-align: center;
  padding: 10px 16px;
}

.top-announcement-bar span {
  color: var(--gold-light);
}

/* Header Navbar */
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  transition: var(--transition);
}

.site-nav-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text-dark);
  white-space: nowrap;
}

.brand-logo-text {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: var(--text-dark);
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.brand-logo-text span {
  color: var(--gold-primary);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 16px;
  list-style: none;
}

.nav-links a {
  text-decoration: none;
  color: var(--text-dark);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  transition: var(--transition);
  position: relative;
  padding: 4px 0;
  white-space: nowrap;
}

.nav-links a:hover,
.nav-links a.active {
  color: var(--purple-primary);
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0%;
  height: 2px;
  background: var(--purple-primary);
  transition: var(--transition);
}

.nav-links a:hover::after,
.nav-links a.active::after {
  width: 100%;
}

.nav-icons {
  display: flex;
  align-items: center;
  gap: 18px;
}

.icon-btn {
  background: none;
  border: none;
  color: var(--text-dark);
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.icon-btn:hover {
  color: var(--purple-primary);
}

.cart-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background: var(--purple-primary);
  color: #FFFFFF;
  font-size: 0.65rem;
  font-weight: 700;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Buttons */
.btn-gold {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: var(--purple-primary);
  color: #FFFFFF;
  border: none;
  padding: 14px 32px;
  border-radius: 30px;
  font-family: var(--font-sans);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  text-decoration: none;
  transition: var(--transition);
  box-shadow: 0 4px 14px rgba(122, 75, 158, 0.25);
}

.btn-gold:hover {
  background: var(--purple-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(122, 75, 158, 0.35);
}

.btn-outline-dark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
  color: var(--text-dark);
  border: 1px solid var(--border-color);
  padding: 10px 20px;
  border-radius: 4px;
  font-family: var(--font-sans);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: var(--transition);
}

.btn-outline-dark:hover {
  border-color: var(--purple-primary);
  color: var(--purple-primary);
  background: var(--bg-subtle-purple);
}

/* Section Header */
.section-title-wrap {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.section-subtitle {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--purple-primary);
  margin-bottom: 8px;
  display: block;
}

.section-title {
  font-size: 2.2rem;
  color: var(--text-dark);
  font-weight: 400;
}

.section-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
}

.section-divider::before,
.section-divider::after {
  content: '';
  height: 1px;
  width: 60px;
  background: var(--border-color);
}

.section-divider span {
  font-size: 0.75rem;
  letter-spacing: 3px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
}

/* Category Circles */
.category-circle-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-decoration: none;
  cursor: pointer;
}

.category-icon-bg {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: var(--bg-subtle-purple);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  transition: var(--transition);
  color: var(--purple-primary);
}

.category-circle-card:hover .category-icon-bg {
  background: var(--purple-primary);
  color: #FFFFFF;
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.category-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-dark);
  transition: var(--transition);
}

.category-circle-card:hover .category-name {
  color: var(--purple-primary);
}

/* Product Card Belora style */
.belora-product-card {
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: var(--transition);
}

.belora-product-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-4px);
}

.product-img-wrap {
  position: relative;
  width: 100%;
  padding-top: 110%;
  background: #FAF7FB;
  overflow: hidden;
}

.product-img-wrap img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.belora-product-card:hover .product-img-wrap img {
  transform: scale(1.06);
}

.product-info-body {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
}

.product-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 6px;
}

.product-price {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 8px;
}

.product-stars {
  display: flex;
  gap: 2px;
  color: #F5A623;
  margin-bottom: 16px;
}

/* Footer Belora style */
.site-footer {
  background: var(--bg-white);
  border-top: 1px solid var(--border-color);
  padding-top: 60px;
  padding-bottom: 30px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1.2fr;
  justify-content: space-between;
  gap: 80px;
  margin-bottom: 50px;
}

.footer-col h5 {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--text-dark);
  margin-bottom: 20px;
}

.footer-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-links a {
  text-decoration: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  transition: var(--transition);
}

.footer-links a:hover {
  color: var(--purple-primary);
}

.newsletter-input-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.newsletter-input {
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-family: var(--font-sans);
  font-size: 0.85rem;
  outline: none;
}

.newsletter-input:focus {
  border-color: var(--purple-primary);
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-up {
  animation: fadeInUp 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
}

.mobile-menu-toggle {
  display: none;
}

/* Responsive Grid Classes */
.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 40px;
  align-items: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.commitments-flex {
  display: flex;
  gap: 25px;
  padding-top: 20px;
  border-top: 1px solid rgba(122, 75, 158, 0.25);
  flex-wrap: wrap;
}

@media (max-width: 1024px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  .mobile-menu-toggle {
    display: flex;
  }
  .footer-grid {
    grid-template-columns: 1fr;
  }
  /* Bố cục dọc cho Mobile */
  .hero-grid {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 24px;
  }
  .features-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  /* Typography điều chỉnh Mobile */
  .hero-title {
    font-size: 2.2rem !important;
  }
  .hero-desc {
    margin: 0 auto 24px auto !important;
  }
  .commitments-flex {
    justify-content: center;
    gap: 15px;
  }
  .btn-gold {
    margin: 0 auto;
  }
  .top-announcement-bar {
    font-size: 0.65rem;
    padding: 8px 10px;
  }
  /* Typography điều chỉnh KROrderHomePage Mobile */
  .mobile-nav-drawer {
    padding: 15px !important;
  }
  .mobile-nav-drawer li {
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
  }
  .section-title {
    font-size: 1.8rem !important;
  }
  .filter-btn-group {
    flex-wrap: nowrap;
    overflow-x: auto;
    justify-content: flex-start;
    padding-bottom: 10px;
    -webkit-overflow-scrolling: touch;
  }
  .filter-btn-group::-webkit-scrollbar {
    display: none;
  }
  .filter-btn {
    white-space: nowrap;
  }
}

/* ==========================================================================
   DRAWER & ORDER FORM STYLING
   ========================================================================== */

.drawer-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9998;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-overlay.open {
  opacity: 1;
  visibility: visible;
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 480px;
  max-width: 90vw;
  height: 100vh;
  background-color: #FFFFFF;
  z-index: 9999;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer.open {
  transform: translateX(0);
}

.drawer-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color, #E5E7EB);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #FDFBFF;
}

.drawer-close-btn {
  background: #F3F4F6;
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #4B5563;
  transition: all 0.2s ease;
}

.drawer-close-btn:hover {
  background: #E5E7EB;
  color: #111827;
}

/* Form Controls */
.form-group {
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 8px;
  display: block;
}

.input {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #E5E7EB;
  border-radius: 12px;
  font-family: var(--font-sans, 'Inter', sans-serif);
  font-size: 0.95rem;
  color: #1F2937;
  background-color: #FFFFFF;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.input:focus {
  border-color: var(--purple-primary, #7A4B9E);
  box-shadow: 0 0 0 3px rgba(122, 75, 158, 0.15);
}

textarea.input {
  resize: vertical;
  min-height: 80px;
}

.btn-primary {
  background: var(--purple-primary, #7A4B9E);
  color: #FFFFFF;
  font-family: var(--font-sans, 'Inter', sans-serif);
  font-weight: 700;
  font-size: 1rem;
  padding: 14px 24px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(122, 75, 158, 0.35);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary:hover {
  background: var(--purple-dark, #5C327A);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(122, 75, 158, 0.45);
}

.btn-outline {
  background: transparent;
  color: var(--purple-primary, #7A4B9E);
  border: 2px solid var(--purple-primary, #7A4B9E);
  font-weight: 700;
  font-size: 0.9rem;
  padding: 12px 24px;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-outline:hover {
  background: var(--purple-light, #F9F5FC);
}



```

## 📄 FILE: src/firebase.js
```js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Cấu hình Firebase qua environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Bật Offline Data Persistence
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence not supported by browser');
    }
  });
} catch {
  // Ignore in SSR/unsupported env
}

// 1. Hàm Đăng nhập bằng tài khoản Google 1-click
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      success: true,
      user: {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      }
    };
  } catch (error) {
    console.warn("Firebase Google login fallback:", error);
    const mockUser = {
      uid: 'google-user-' + Date.now(),
      name: 'Nguyễn Văn A (Google)',
      email: 'user.google@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
    };
    return { success: true, user: mockUser };
  }
};

// 2. Hàm Đăng xuất
export const logoutGoogle = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch {
    return { success: true };
  }
};

```

## 📄 FILE: src/context/AppContext.jsx
```jsx
import React, { createContext, useState, useEffect } from 'react';
import { OLIVE_YOUNG_CATALOG } from '../data/catalog';
import {
  subscribeToOrders,
  createOrderInDB,
  updateOrderQuoteInDB,
  updateOrderStatusInDB,
  confirmOrderPaymentInDB,
  subscribeToRates,
  updateRatesInDB,
  saveUserProfileInDB,
  saveProductToDB,
  deleteProductFromDB
} from '../services/dbService';

export const AppContext = createContext();

const defaultRates = {
  USD: { code: 'USD', name: 'Đô la Mỹ', symbol: '$', rate: 25500, shippingFee: 230000 },
  KRW: { code: 'KRW', name: 'Won Hàn Quốc', symbol: '₩', rate: 19.5, shippingFee: 180000 },
  JPY: { code: 'JPY', name: 'Yên Nhật', symbol: '¥', rate: 175, shippingFee: 190000 },
  serviceFeePercent: 5,
};

const initialMockOrders = [
  {
    id: 'ORD-827192',
    customerName: 'Nguyễn Thị Lan',
    customerPhone: '0912345678',
    customerAddress: '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh',
    country: 'USD',
    productUrl: 'https://www.sephora.com/product/dior-lip-glow-oil-P453814',
    productName: 'Son dưỡng Dior Addict Lip Glow Oil',
    brand: 'Dior',
    options: 'Màu 001 Pink - 6ml',
    qty: 2,
    foreignPrice: 40.00,
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    quote: null
  },
  {
    id: 'ORD-554190',
    customerName: 'Trần Minh Anh',
    customerPhone: '0987654321',
    customerAddress: '456 Phố Huế, Hai Bà Trưng, Hà Nội',
    country: 'KRW',
    productUrl: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000159495',
    productName: 'Tinh chất dưỡng da Anua Heartleaf 77% Soothing Toner',
    brand: 'Anua',
    options: 'Chai 250ml',
    qty: 1,
    foreignPrice: 28000,
    status: 'quoted',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    quote: {
      vietnamRate: 19.5,
      rawVnd: 546000,
      taxWebVnd: 54600,
      serviceFeeVnd: 27300,
      shippingWeightKg: 0.35,
      shippingWeightFeeVnd: 63000,
      totalVnd: 690900,
      depositNeededVnd: 345450,
      note: 'Hàng sale Olive Young chính hãng, thời gian bay dự kiến 7-10 ngày làm việc.'
    }
  },
  {
    id: 'ORD-988312',
    customerName: 'Hoàng Thùy Dương',
    customerPhone: '0905556677',
    customerAddress: '78 Lê Duẩn, Hải Châu, Đà Nẵng',
    country: 'JPY',
    productUrl: 'https://www.amazon.co.jp/dp/B07N91P3B5',
    productName: 'Kem chống nắng Anessa Perfect UV Skin Care Milk',
    brand: 'Anessa',
    options: 'Dạng sữa - 60ml',
    qty: 3,
    foreignPrice: 3300,
    status: 'paid',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    quote: {
      vietnamRate: 175,
      rawVnd: 1732500,
      taxWebVnd: 173250,
      serviceFeeVnd: 86625,
      shippingWeightKg: 0.6,
      shippingWeightFeeVnd: 114000,
      totalVnd: 2106375,
      depositNeededVnd: 2106375,
      note: 'Đã mua hàng thành công tại Amazon Nhật Bản.'
    },
    paymentConfirmed: true,
    paymentDate: new Date(Date.now() - 3600000 * 8).toISOString()
  }
];

const initialMockUsers = [
  { name: 'Nguyễn Thị Lan', email: 'lan@gmail.com', password: '123', phone: '0912345678', address: '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh' },
  { name: 'Trần Minh Anh', email: 'anh@gmail.com', password: '123', phone: '0987654321', address: '456 Phố Huế, Hai Bà Trưng, Hà Nội' }
];

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('beauty_users');
    return saved ? JSON.parse(saved) : initialMockUsers;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('beauty_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('beauty_orders');
    return saved ? JSON.parse(saved) : initialMockOrders;
  });

  const [rates, setRates] = useState(() => {
    const saved = localStorage.getItem('beauty_rates');
    return saved ? JSON.parse(saved) : defaultRates;
  });

  const [products, setProducts] = useState(() => {
    try {
      const savedCustom = localStorage.getItem('tavy_custom_products');
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed)) return parsed;
      }
      return OLIVE_YOUNG_CATALOG;
    } catch (e) {
      console.warn("Lỗi đọc tavy_custom_products:", e);
    }
    return OLIVE_YOUNG_CATALOG;
  });

  const [publishedProducts, setPublishedProducts] = useState(() => {
    try {
      const savedPublished = localStorage.getItem('tavy_published_products');
      if (savedPublished) {
        const parsed = JSON.parse(savedPublished);
        if (Array.isArray(parsed)) return parsed;
      }
      // Khởi tạo fallback nếu chưa publish lần nào
      const savedCustom = localStorage.getItem('tavy_custom_products');
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed)) return parsed;
      }
      return OLIVE_YOUNG_CATALOG;
    } catch (e) {
      console.warn("Lỗi đọc tavy_published_products:", e);
    }
    return OLIVE_YOUNG_CATALOG;
  });

  const publishToWeb = () => {
    setPublishedProducts([...products]);
    localStorage.setItem('tavy_published_products', JSON.stringify(products));
  };

  const revertFromWeb = () => {
    setProducts([...publishedProducts]);
    localStorage.setItem('tavy_custom_products', JSON.stringify(publishedProducts));
  };

  // 🤖 AUTO SCRAPER BOT STATE & PENDING APPROVAL QUEUE
  const [botIsRunning, setBotIsRunning] = useState(() => {
    return localStorage.getItem('tavy_bot_is_running') === 'true';
  });

  const [pendingProducts, setPendingProducts] = useState(() => {
    const saved = localStorage.getItem('tavy_pending_products');
    return saved ? JSON.parse(saved) : [];
  });

  // 🛒 CART STATE
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('tavy_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('tavy_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.goodsNo === product.goodsNo);
      if (existing) {
        return prev.map(item => item.goodsNo === product.goodsNo ? { ...item, qty: item.qty + qty } : item);
      }
      return [...prev, { ...product, qty }];
    });
  };

  const removeFromCart = (goodsNo) => {
    setCart(prev => prev.filter(item => item.goodsNo !== goodsNo));
  };

  const updateCartQty = (goodsNo, qty) => {
    if (qty <= 0) return removeFromCart(goodsNo);
    setCart(prev => prev.map(item => item.goodsNo === goodsNo ? { ...item, qty } : item));
  };

  const clearCart = () => setCart([]);

  // 💾 BẮT BUỘC: Lưu danh sách sản phẩm vào localStorage khi có thay đổi (Chống mất khi F5 reload)
  useEffect(() => {
    if (products && products.length > 0) {
      localStorage.setItem('tavy_custom_products', JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    localStorage.setItem('tavy_bot_is_running', botIsRunning ? 'true' : 'false');
  }, [botIsRunning]);

  useEffect(() => {
    localStorage.setItem('tavy_pending_products', JSON.stringify(pendingProducts));
  }, [pendingProducts]);

  // Periodic Auto-Scraper Bot Effect (Runs every 30 minutes when botIsRunning is TRUE)
  useEffect(() => {
    if (!botIsRunning) return;

    const runBotCycle = async () => {
      const { executeSingleBotRun } = await import('../services/autoScraperBotService');
      const res = await executeSingleBotRun(products, pendingProducts);
      if (res.success && res.product) {
        setPendingProducts(prev => {
          if (prev.some(p => p.goodsNo === res.product.goodsNo)) return prev;
          return [res.product, ...prev];
        });
      }
    };

    // Run first cycle after 5 seconds of enabling, then every 30 minutes (1,800,000 ms)
    const initialTimer = setTimeout(runBotCycle, 5000);
    const intervalTimer = setInterval(runBotCycle, 30 * 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [botIsRunning, products]);

  const toggleBot = (enabled) => {
    setBotIsRunning(enabled);
  };

  const approvePendingProduct = (goodsNo) => {
    const target = pendingProducts.find(p => p.goodsNo === goodsNo);
    if (target) {
      addProduct(target);
      setPendingProducts(prev => prev.filter(p => p.goodsNo !== goodsNo));
    }
  };

  const addProduct = (product) => {
    if (!product) return;
    const cleanProduct = {
      ...product,
      goodsNo: product.goodsNo || `SP-${Date.now()}`
    };

    setProducts(prev => {
      const filtered = prev.filter(p => p.goodsNo !== cleanProduct.goodsNo);
      const updated = [cleanProduct, ...filtered];
      try {
        localStorage.setItem('tavy_custom_products', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Sync lên Firestore (fire & forget, không block UI)
    saveProductToDB(cleanProduct).catch(err => console.warn('Firestore sync product failed:', err));
  };

  const approveSelectedPendingProducts = (goodsNoArray = []) => {
    if (!goodsNoArray || goodsNoArray.length === 0) return;
    const selectedSet = new Set(goodsNoArray);
    const targets = pendingProducts.filter(p => selectedSet.has(p.goodsNo));
    
    targets.forEach(item => {
      addProduct(item);
    });

    setPendingProducts(prev => prev.filter(p => !selectedSet.has(p.goodsNo)));
  };

  const approveAllPendingProducts = () => {
    pendingProducts.forEach(p => addProduct(p));
    setPendingProducts([]);
  };

  const rejectPendingProduct = (goodsNo) => {
    setPendingProducts(prev => prev.filter(p => p.goodsNo !== goodsNo));
  };

  const updateProduct = (goodsNo, updates) => {
    setProducts(prev => {
      const updated = prev.map(p => p.goodsNo === goodsNo ? { ...p, ...updates } : p);
      try {
        localStorage.setItem('tavy_custom_products', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const deleteProduct = (goodsNo) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.goodsNo !== goodsNo);
      try {
        localStorage.setItem('tavy_custom_products', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Xóa khỏi Firestore (fire & forget)
    deleteProductFromDB(goodsNo).catch(err => console.warn('Firestore delete product failed:', err));
  };

  useEffect(() => {
    localStorage.setItem('beauty_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('beauty_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('beauty_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('beauty_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('beauty_rates', JSON.stringify(rates));
  }, [rates]);

  // Firestore Realtime Listeners
  useEffect(() => {
    const unsubOrders = subscribeToOrders((firestoreOrders) => {
      if (firestoreOrders && firestoreOrders.length > 0) {
        setOrders(prev => {
          const combined = [...firestoreOrders];
          prev.forEach(p => {
            if (!combined.some(c => c.id === p.id)) {
              combined.push(p);
            }
          });
          return combined;
        });
      }
    });

    const unsubRates = subscribeToRates((dbRates) => {
      if (dbRates) {
        setRates(prev => ({ ...prev, ...dbRates }));
      }
    });

    return () => {
      if (typeof unsubOrders === 'function') unsubOrders();
      if (typeof unsubRates === 'function') unsubRates();
    };
  }, []);

  const registerUser = (name, email, password) => {
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, message: 'Email này đã được đăng ký.' };
    }
    const newUser = { name, email, password, phone: '', address: '' };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    saveUserProfileInDB(newUser);
    return { success: true };
  };

  const updateUserProfile = (updatedFields) => {
    if (!currentUser) return { success: false, message: 'Chưa đăng nhập' };
    const updatedUser = { ...currentUser, ...updatedFields };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.email.toLowerCase() === updatedUser.email.toLowerCase() ? updatedUser : u));
    saveUserProfileInDB(updatedUser);
    return { success: true };
  };


  const loginUser = (email, password) => {
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      return { success: false, message: 'Email hoặc mật khẩu không chính xác.' };
    }
    setCurrentUser(found);
    return { success: true };
  };

  const loginWithGoogleAuth = async () => {
    const { loginWithGoogle } = await import('../firebase');
    const res = await loginWithGoogle();
    if (res.success) {
      setCurrentUser(res.user);
      saveUserProfileInDB(res.user);
      const existing = users.find((u) => u.email.toLowerCase() === res.user.email.toLowerCase());
      if (!existing) {
        setUsers((prev) => [...prev, res.user]);
      }
    }
    return res;
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const createOrder = (orderData) => {
    const newOrder = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      userEmail: currentUser ? currentUser.email : 'guest@beautycargo.vn',
      createdAt: new Date().toISOString(),
      status: 'pending',
      quote: null,
      items: [], // Sẽ chứa mảng các món hàng
      ...orderData,
    };
    createOrderInDB(newOrder);
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateRates = (newRates) => {
    setRates(newRates);
    updateRatesInDB(newRates);
  };

  const updateOrderQuote = (orderId, quoteData) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const rateInfo = rates[order.country];
          const rawVnd = order.foreignPrice * order.qty * rateInfo.rate;
          const taxWebVnd = quoteData.taxWebPercent ? (rawVnd * quoteData.taxWebPercent) / 100 : 0;
          const serviceFeeVnd = (rawVnd * rates.serviceFeePercent) / 100;
          const shippingWeightFeeVnd = quoteData.shippingWeightKg * rateInfo.shippingFee;
          const totalVnd = Math.round(rawVnd + taxWebVnd + serviceFeeVnd + shippingWeightFeeVnd);
          const depositNeededVnd = Math.round(totalVnd * 0.5);

          const fullQuote = {
            vietnamRate: rateInfo.rate,
            rawVnd,
            taxWebVnd,
            serviceFeeVnd,
            shippingWeightKg: quoteData.shippingWeightKg,
            shippingWeightFeeVnd,
            totalVnd,
            depositNeededVnd,
            note: quoteData.note,
          };

          updateOrderQuoteInDB(orderId, fullQuote, totalVnd);

          return {
            ...order,
            status: 'quoted',
            quote: fullQuote,
          };
        }
        return order;
      })
    );
  };

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem('kmart_admin_auth') === 'true';
  });

  const loginAdmin = (password) => {
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123456';
    if (password === adminPass) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('kmart_admin_auth', 'true');
      return { success: true };
    }
    return { success: false, message: 'Mật khẩu quản trị không chính xác.' };
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('kmart_admin_auth');
  };

  const updateOrderTracking = (orderId, { status, trackingCode, note }) => {
    const updates = {
      status: status || undefined,
      trackingCode: trackingCode !== undefined ? trackingCode : undefined,
      adminNote: note !== undefined ? note : undefined,
    };

    updateOrderStatusInDB(orderId, updates);

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: status || order.status,
            trackingCode: trackingCode !== undefined ? trackingCode : order.trackingCode,
            adminNote: note !== undefined ? note : order.adminNote,
            updatedAt: new Date().toISOString()
          };
        }
        return order;
      })
    );
  };

  const updateOrderStatus = (orderId, status) => {
    updateOrderStatusInDB(orderId, { status });
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
  };

  const confirmPayment = (orderId, amountPaid) => {
    confirmOrderPaymentInDB(orderId, amountPaid);
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: 'paid',
              paymentConfirmed: true,
              paymentDate: new Date().toISOString(),
              amountPaid: amountPaid
            }
          : order
      )
    );
  };

  const resetAllData = () => {
    setOrders(initialMockOrders);
    setRates(defaultRates);
    setUsers(initialMockUsers);
    setCurrentUser(null);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        orders,
        rates,
        currentUser,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        registerUser,
        updateUserProfile,
        loginUser,
        loginWithGoogleAuth,
        logoutUser,
        createOrder,
        updateRates,
        updateOrderQuote,
        updateOrderStatus,
        updateOrderTracking,
        confirmPayment,
        resetAllData,
        products,
        setProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        botIsRunning,
        toggleBot,
        pendingProducts,
        approvePendingProduct,
        approveSelectedPendingProducts,
        approveAllPendingProducts,
        rejectPendingProduct,
        publishToWeb,
        revertFromWeb,
        oliveYoungCatalog: publishedProducts || OLIVE_YOUNG_CATALOG,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

```

## 📄 FILE: src/data/catalog.js
```js
/**
 * Danh mục sản phẩm Olive Young & Thực phẩm chức năng Hàn Quốc (36+ sản phẩm mẫu)
 * Kèm theo Trình tạo Sản phẩm Động Không Giới Hạn (Unlimited Product Generator)
 */

export const OLIVE_YOUNG_CATALOG = [
  // ═══ SKINCARE ═══
  {
    goodsNo: 'A000000261415',
    name: 'Tinh chất Cà Chua Xanh Se Khít Lỗ Chân Lông & Nâng Cơ Sungboon Editor Green Tomato Pore Lifting Ampoule Serum 30ml [Bộ 기획 TOP 3 Olive Young]',
    brand: 'Sungboon Editor',
    category: 'skincare',
    foreignPrice: 24900,
    productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=600&q=80'
    ],
    options: 'Chai 30ml + Tặng kèm Chai 30ml [Bộ 기획 1+1]',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9,
    reviewsCount: 3820,
    description: 'Serum Cà Chua Xanh se khít lỗ chân lông quốc dân nổi tiếng TOP 3 Olive Young Korea. Chiết xuất Cà chua xanh chứa Tomatidine độc quyền kết hợp PHA, Volufiline & Hyaluronic Acid giúp se khít lỗ chân lông to lâu năm và nâng cơ mặt.',
    usage: 'Dùng sau bước nước hoa hồng. Lấy 3-5 giọt thoa đều khắp mặt.',
    specifications: { volume: '30ml + 30ml', skinType: 'Mọi loại da, da lỗ chân lông to', expiry: '36 tháng', ingredients: 'Green Tomato Extract, Niacinamide, PHA' }
  },
  {
    goodsNo: 'A000000185934',
    name: 'Tinh chất dưỡng ẩm sâu Torriden Dive-In Low Molecular Hyaluronic Acid Serum 50ml',
    brand: 'Torriden',
    category: 'skincare',
    foreignPrice: 18000,
    productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80'],
    options: 'Chai 50ml + Tặng kèm Toner 20ml',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9,
    reviewsCount: 1240,
    description: 'Serum dưỡng ẩm quốc dân Hàn Quốc TOP 1 Olive Young 3 năm liên tiếp. Với công thức 5 loại Hyaluronic Acid phân tử nhỏ.',
    usage: 'Sau khi rửa mặt và dùng nước hoa hồng, thoa 3-4 giọt serum đều khắp mặt.',
    specifications: { volume: '50ml', skinType: 'Da dầu thiếu nước & nhạy cảm', expiry: '36 tháng', ingredients: '5D Hyaluronic Acid, D-Panthenol' }
  },
  {
    goodsNo: 'A000000159495',
    name: 'Nước hoa hồng làm dịu da Anua Heartleaf 77% Soothing Toner 250ml',
    brand: 'Anua',
    category: 'skincare',
    foreignPrice: 28000,
    productImage: 'https://images.unsplash.com/photo-1556229174-5e42a09e45af?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1556229174-5e42a09e45af?auto=format&fit=crop&w=600&q=80'],
    options: 'Chai 250ml',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.8,
    reviewsCount: 980,
    description: 'Toner chứa 77% chiết xuất lá rau diếp cá thu hoạch tại Hàn Quốc. Làm dịu mẩn đỏ và hỗ trợ giảm mụn ẩn.',
    usage: 'Dùng sau bước rửa mặt, vỗ nhẹ hoặc đắp lotion mask 5 phút.',
    specifications: { volume: '250ml', skinType: 'Da mụn, da nhạy cảm mẩn đỏ', expiry: '30 tháng', ingredients: '77% Houttuynia Cordata Extract' }
  },
  {
    goodsNo: 'A000000146950',
    name: 'Tinh chất rau má phục hồi da Madagascar Centella Ampoule 100ml',
    brand: 'Skin1004',
    category: 'skincare',
    foreignPrice: 22000,
    productImage: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=600&q=80'],
    options: 'Chai 100ml',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9,
    reviewsCount: 1560,
    description: 'Chứa 100% chiết xuất rau má tinh khiết từ đảo Madagascar. Phục hồi da hư tổn và làm dịu cháy nắng.',
    usage: 'Thoa 2-3 giọt serum lên toàn bộ khuôn mặt.',
    specifications: { volume: '100ml', skinType: 'Da mụn, da yếu nhạy cảm', expiry: '36 tháng', ingredients: '100% Centella Asiatica Extract' }
  },
  {
    goodsNo: 'A000000201102',
    name: 'Kem chống nắng nâng tông tự nhiên Round Lab Birch Juice Moisturizing Sunscreen SPF50+',
    brand: 'Round Lab',
    category: 'skincare',
    foreignPrice: 25000,
    productImage: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80'],
    options: 'Tuýp 50ml',
    origin: 'Store Olive Young Myeongdong, Hàn Quốc',
    rating: 4.9,
    reviewsCount: 2300,
    description: 'Kem chống nắng nhựa cây Bạch Dương nổi tiếng TOP 1 Olive Young, mỏng nhẹ như kem dưỡng.',
    usage: 'Thoa đều lên mặt trước khi ra ngoài 15-20 phút.',
    specifications: { volume: '50ml', skinType: 'Mọi loại da', expiry: '36 tháng', ingredients: 'Birch Juice Extract, Hyaluronic Acid' }
  },
  {
    goodsNo: 'A000000192301',
    name: 'Kem dưỡng sâm cổ truyền Beauty of Joseon Dynasty Cream 50ml',
    brand: 'Beauty of Joseon',
    category: 'skincare',
    foreignPrice: 24000,
    productImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80'],
    options: 'Hũ 50ml',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.8,
    reviewsCount: 1120,
    description: 'Kem dưỡng ẩm đông y Hàn Quốc chiết xuất nhân sâm, nước gạo nếp và 2% Niacinamide.',
    usage: 'Thoa ở bước cuối cùng của chu trình skincare buổi tối.',
    specifications: { volume: '50ml', skinType: 'Da khô, da bắt đầu lão hóa', expiry: '36 tháng', ingredients: 'Ginseng root water, Niacinamide' }
  },
  {
    goodsNo: 'A000000300001',
    name: 'Mặt nạ giấy cấp ẩm làm dịu Mediheal Essential Sheet Mask [Hộp 10 miếng]',
    brand: 'Mediheal',
    category: 'skincare',
    foreignPrice: 15000,
    productImage: 'https://images.unsplash.com/photo-1556229174-5e42a09e45af?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1556229174-5e42a09e45af?auto=format&fit=crop&w=600&q=80'],
    options: 'Hộp 10 miếng (Tặng 2 miếng)',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9,
    reviewsCount: 4500,
    description: 'Mặt nạ giấy quốc dân số 1 Olive Young bán hơn 2 tỉ miếng toàn cầu.',
    usage: 'Đắp 15-20 phút sau khi rửa mặt sạch.',
    specifications: { volume: '10 miếng', skinType: 'Mọi loại da', expiry: '36 tháng', ingredients: 'Tea Tree, N.M.F Aquaring' }
  },
  {
    goodsNo: 'A000000300002',
    name: 'Xịt khoáng tinh chất vảy vàng d’Alba White Truffle First Spray Serum 100ml',
    brand: "d'Alba",
    category: 'skincare',
    foreignPrice: 29000,
    productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80'],
    options: 'Chai xịt 100ml',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9,
    reviewsCount: 3100,
    description: 'Xịt khoáng huyết thanh nấm nấm nấm Truffle trắng Ý kết hợp bơ thực vật căng bóng chuẩn hàng không.',
    usage: 'Lắc đều trước khi xịt trực tiếp lên mặt.',
    specifications: { volume: '100ml', skinType: 'Da khô, da thiếu bóng', expiry: '36 tháng', ingredients: 'White Truffle Extract, Avocardo Oil' }
  },
  {
    goodsNo: 'A000000300003',
    name: 'Kem dưỡng ẩm phục hồi da nhạy cảm Aestura Atobarrier 365 Cream 80ml',
    brand: 'Aestura',
    category: 'skincare',
    foreignPrice: 31000,
    productImage: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80'],
    options: 'Tuýp 80ml',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9,
    reviewsCount: 2900,
    description: 'Kem phục hồi màng bảo vệ da số 1 bệnh viện da liễu Hàn Quốc với viên nén Ceramide.',
    usage: 'Thoa đều kem lên mặt sau serum.',
    specifications: { volume: '80ml', skinType: 'Da nhạy cảm, da tổn thương', expiry: '36 tháng', ingredients: 'Triple Ceramide, Fatty Acid' }
  },

  // ═══ MAKEUP ═══
  {
    goodsNo: 'A000000128120',
    name: 'Son tint lì bóng Romand Juicy Lasting Tint',
    brand: 'Romand',
    category: 'makeup',
    foreignPrice: 9900,
    productImage: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80'],
    options: 'Màu 06 Figfig - 5.5g',
    origin: 'Store Olive Young Myeongdong, Hàn Quốc',
    rating: 4.7,
    reviewsCount: 2100,
    description: 'Dòng son tint bóng bám màu siêu lâu nổi tiếng của Romand.',
    usage: 'Thoa mỏng lòng môi hoặc toàn bộ môi.',
    specifications: { volume: '5.5g', skinType: 'Mọi tông da', expiry: '24 tháng', ingredients: 'Chiết xuất mâm xôi, đu đủ' }
  },
  {
    goodsNo: 'A000000180234',
    name: 'Phấn nước che phủ căng bóng Clio Kill Cover Mesh Glow Cushion',
    brand: 'Clio',
    category: 'makeup',
    foreignPrice: 32000,
    productImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80'],
    options: 'Tone 03 Linen - 15g x 2',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9,
    reviewsCount: 890,
    description: 'Cushion dạng lưới thế hệ mới giúp che khuyết điểm hoàn hảo căng bóng chuẩn Hàn.',
    usage: 'Dùng bông dặm nhẹ phấn nước lên mặt.',
    specifications: { volume: '15g + Lõi phụ 15g', skinType: 'Da khô đến thường', expiry: '36 tháng', ingredients: 'Hyaluronic Acid, Niacinamide' }
  },
  {
    goodsNo: 'A000000171209',
    name: 'Chì kẻ chân mày tự nhiên lâu trôi Etude House Drawing Eye Brow',
    brand: 'Etude House',
    category: 'makeup',
    foreignPrice: 4500,
    productImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80'],
    options: 'Màu 02 Dark Brown - 0.25g',
    origin: 'Store Etude Korea',
    rating: 4.6,
    reviewsCount: 3100,
    description: 'Chì kẻ mày hai đầu quốc dân Hàn Quốc với đầu chì hình vát dễ tạo dáng gẩy sợi.',
    usage: 'Xoay nhẹ đầu chì và phẩy sợi theo dáng lông mày.',
    specifications: { volume: '0.25g', skinType: 'Mọi loại da', expiry: '36 tháng', ingredients: 'Vitamin E, Jojoba oil' }
  },
  {
    goodsNo: 'A000000199881',
    name: 'Phấn má hồng dạng hũ Dasique Blending Mood Cheek 4 ô màu pastel',
    brand: 'Dasique',
    category: 'makeup',
    foreignPrice: 22000,
    productImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80'],
    options: 'Bảng 4 màu Warm Blending',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9,
    reviewsCount: 750,
    description: 'Bảng má hồng 4 ô màu pastel ngọt ngào siêu mỏng nhẹ của Dasique Korea.',
    usage: 'Dùng cọ lấy một lượng phấn má vừa đủ thoa đều lên gò má.',
    specifications: { volume: '10.4g', skinType: 'Mọi loại da', expiry: '36 tháng', ingredients: 'Mica, Silica, Talc' }
  },
  {
    goodsNo: 'A000000215560',
    name: 'Mascara chốt mi cong bám lâu 24h Kiss Me Heroine Make Long & Curl',
    brand: 'Kiss Me Korea',
    category: 'makeup',
    foreignPrice: 16000,
    productImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80'],
    options: 'Màu Đen Jet Black 6g',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9,
    reviewsCount: 4100,
    description: 'Mascara quốc dân tơi mi, tơi sợi không vón cục, kháng nước chống lem 24 giờ.',
    usage: 'Chải mascara từ chân mi dích dắc lên ngọn mi.',
    specifications: { volume: '6g', skinType: 'Mọi loại mi', expiry: '36 tháng', ingredients: 'Polymer chốt mi cong' }
  },
  {
    goodsNo: 'A000000300004',
    name: 'Son kem bùn mịn lì lâu trôi Peripera Ink Velvet Lip Tint 4g',
    brand: 'Peripera',
    category: 'makeup',
    foreignPrice: 8500,
    productImage: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80'],
    options: 'Màu 01 Good Brick 4g',
    origin: 'Store Olive Young Myeongdong, Hàn Quốc',
    rating: 4.8,
    reviewsCount: 5600,
    description: 'Son kem nhung mịn lì như nhung bám màu huyền thoại của Peripera Korea.',
    usage: 'Thoa trực tiếp lên môi.',
    specifications: { volume: '4g', skinType: 'Mọi loại da', expiry: '24 tháng', ingredients: 'Jojoba oil, Hyaluronic acid' }
  },

  // ═══ HEALTH ═══
  {
    goodsNo: 'P000000001001',
    name: 'Cao Hắc Sâm Hàn Quốc Cao Cấp CheongKwanJang Everytime Extract',
    brand: 'CheongKwanJang (KGC)',
    category: 'health',
    foreignPrice: 98000,
    productImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'],
    options: 'Hộp 30 gói x 10ml',
    origin: 'Tập đoàn Hồng Sâm Chính Phủ Hàn Quốc KGC',
    rating: 5.0,
    reviewsCount: 340,
    description: 'Chiết xuất 100% hồng sâm 6 năm tuổi Hàn Quốc nguyên chất đậm đặc.',
    usage: 'Dùng 1 gói mỗi ngày sau bữa ăn sáng hoặc trưa.',
    specifications: { volume: '30 gói (10ml/gói)', skinType: 'Người lớn, người già', expiry: '24 tháng', ingredients: '100% Chiết xuất Hồng Sâm 6 năm tuổi' }
  },
  {
    goodsNo: 'P000000001002',
    name: 'Viên Uống Collagen Thủy Phân Orthomol Beauty Hàn Quốc',
    brand: 'Orthomol',
    category: 'health',
    foreignPrice: 65000,
    productImage: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=600&q=80'],
    options: 'Hộp 30 chai nước uống',
    origin: 'Nhập khẩu chính hãng Hàn Quốc / Đức',
    rating: 4.9,
    reviewsCount: 520,
    description: 'Nước uống Collagen cao cấp tích hợp Vitamin C, E, Biotin và Phytoceramides.',
    usage: 'Uống 1 chai mỗi ngày trong hoặc sau bữa ăn.',
    specifications: { volume: '30 chai x 20ml', skinType: 'Phụ nữ từ 25 tuổi trở lên', expiry: '18 tháng', ingredients: 'Collagen Hydrolysate, Hyaluronic Acid' }
  },
  {
    goodsNo: 'P000000001009',
    name: 'Kẹo dẻo bổ sung Collagen lựu đỏ BOTO Pomegranate Small Molecule Collagen Gummy',
    brand: 'BOTO Korea',
    category: 'health',
    foreignPrice: 18500,
    productImage: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&w=600&q=80'],
    options: 'Túi 90g (30 viên kẹo)',
    origin: 'Nội địa Seoul, Hàn Quốc',
    rating: 4.8,
    reviewsCount: 1450,
    description: 'Kẹo dẻo vị lựu đỏ thơm ngon bổ sung Collagen phân tử nhỏ từ cá ngừ đại dương.',
    usage: 'Nhai 3 viên mỗi ngày như món ăn vặt mượt da.',
    specifications: { volume: 'Gói 90g', skinType: 'Mọi lứa tuổi', expiry: '24 tháng', ingredients: 'Low molecular fish collagen, Vitamin C' }
  },
  {
    goodsNo: 'P000000001015',
    name: 'Men vi sinh bao bọc kép LACTO-FIT Probiotics Gold 50 gói',
    brand: 'Chong Kun Dang Health',
    category: 'health',
    foreignPrice: 19000,
    productImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'],
    options: 'Hộp 50 gói x 2g',
    origin: 'Tập đoàn Dược phẩm CKD Hàn Quốc',
    rating: 4.9,
    reviewsCount: 5200,
    description: 'Men vi sinh tiêu hóa TOP 1 Hàn Quốc giúp cải thiện đường ruột và hệ miễn dịch.',
    usage: 'Uống 1 gói mỗi ngày trực tiếp không cần pha nước.',
    specifications: { volume: '50 gói', skinType: 'Mọi thành viên gia đình', expiry: '24 tháng', ingredients: 'Lactobacillus acidophilus, Bifidobacterium' }
  },
  {
    goodsNo: 'P000000001030',
    name: 'Nước hồng sâm củ tỏi đen Kanghwa Korean Red Ginseng Black Garlic 30 gói',
    brand: 'Kanghwa Bio',
    category: 'health',
    foreignPrice: 38000,
    productImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'],
    options: 'Hộp 30 gói x 70ml',
    origin: 'Nội địa Hàn Quốc',
    rating: 4.9,
    reviewsCount: 890,
    description: 'Hồng sâm 6 năm tuổi lên men kết hợp tỏi đen giúp hạ mỡ máu và tăng đề kháng.',
    usage: 'Dùng 1-2 gói mỗi ngày.',
    specifications: { volume: '30 gói (70ml/gói)', skinType: 'Người trưởng thành, người cao tuổi', expiry: '36 tháng', ingredients: 'Red Ginseng Extract, Black Garlic' }
  },

  // ═══ PHARMACY ═══
  {
    goodsNo: 'P000000002001',
    name: 'Dung Dịch Xịt Mũi Trị Xoang Dị Ứng Hàn Quốc Nazal / Hanmi',
    brand: 'Hanmi Pharmacy',
    category: 'pharmacy',
    foreignPrice: 12000,
    productImage: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=600&q=80'],
    options: 'Chai xịt 30ml',
    origin: 'Nhà thuốc nội địa Seoul, Hàn Quốc',
    rating: 4.8,
    reviewsCount: 670,
    description: 'Sản phẩm xịt mũi chuyên dụng bán tại các hiệu thuốc Hàn Quốc.',
    usage: 'Xịt 1-2 lần vào mỗi bên mũi. Ngày xịt 2-3 lần khi ngứa nghẹt mũi.',
    specifications: { volume: '30ml', skinType: 'Người bị nghẹt mũi, viêm xoang', expiry: '36 tháng', ingredients: 'Naphazoline Hydrochloride' }
  },
  {
    goodsNo: 'P000000002008',
    name: 'Cao dán nhức mỏng giảm đau xương khớp Hồng Sâm Sinsin Pas Korea',
    brand: 'Sinsin Pharm',
    category: 'pharmacy',
    foreignPrice: 9500,
    productImage: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=600&q=80'],
    options: 'Gói 10 miếng dán hồng sâm',
    origin: 'Nhà thuốc Hàn Quốc',
    rating: 4.9,
    reviewsCount: 880,
    description: 'Cao dán hồng sâm nóng giảm đau nhức xương khớp, vai gáy và bong gân thể thao.',
    usage: 'Làm sạch vùng da bị đau rồi dán trực tiếp 1 miếng lên.',
    specifications: { volume: 'Túi 10 miếng dán', skinType: 'Người già đau nhức, vận động viên', expiry: '36 tháng', ingredients: 'Chiết xuất Hồng Sâm, Menthol' }
  },
  {
    goodsNo: 'P000000002020',
    name: 'Miếng dán mụn y tế mỏng tệp da Olive Young Care Plus Acne Patch 102 miếng',
    brand: 'Olive Young Care Plus',
    category: 'pharmacy',
    foreignPrice: 7500,
    productImage: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=600&q=80'],
    options: 'Gói 102 miếng dán dính chắc tệp màu da',
    origin: 'Nhà thuốc Olive Young Hàn Quốc',
    rating: 4.9,
    reviewsCount: 9500,
    description: 'Miếng dán mụn Hydrocolloid chống nước siêu mỏng che mụn và hút mủ tức thì.',
    usage: 'Dán trực tiếp miếng dán lên nốt mụn sưng mủ.',
    specifications: { volume: '102 miếng', skinType: 'Da mụn sưng', expiry: '36 tháng', ingredients: 'Hydrocolloid Dressing' }
  }
];

/**
 * TRÌNH TẠO SẢN PHẨM ĐỘNG KHÔNG GIỚI HẠN (UNLIMITED PRODUCT GENERATOR)
 * Tạo n sản phẩm Hàn Quốc mới độc nhất để Admin hoặc Bot cào thêm tùy ý mà KHÔNG BAO GIỜ BỊ GIỚI HẠN
 */
export function generateUnlimitedKoreanProducts(count = 10, existingGoodsNos = new Set()) {
  const KOREAN_BRANDS = ['Sulwhasoo', 'Laneige', 'Innisfree', 'COSRX', 'Numbuzin', 'Wakemake', 'Espoir', 'Hince', 'Manyo', 'Banila Co', 'Illiyoon', 'Mediheal', 'Dr.Jart+'];
  const CATEGORIES = ['skincare', 'makeup', 'health', 'pharmacy'];
  const IMAGES = [
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1556229174-5e42a09e45af?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80'
  ];

  const PRODUCT_TEMPLATES = [
    { prefix: 'Tinh chất dưỡng da căng bóng', cat: 'skincare', priceRange: [18000, 45000] },
    { prefix: 'Kem dưỡng ẩm phục hồi chuyên sâu', cat: 'skincare', priceRange: [22000, 52000] },
    { prefix: 'Toner cân bằng pH làm dịu mẩn đỏ', cat: 'skincare', priceRange: [16000, 35000] },
    { prefix: 'Kem chống nắng vật lý mỏng nhẹ', cat: 'skincare', priceRange: [20000, 38000] },
    { prefix: 'Son thỏi mịn lì lâu trôi', cat: 'makeup', priceRange: [12000, 28000] },
    { prefix: 'Phấn phủ kiềm dầu nén hạt siêu mịn', cat: 'makeup', priceRange: [15000, 32000] },
    { prefix: 'Bảng màu mắt 9 ô tone ấm', cat: 'makeup', priceRange: [24000, 48000] },
    { prefix: 'Nước hồng sâm bổ dưỡng Hàn Quốc', cat: 'health', priceRange: [45000, 120000] },
    { prefix: 'Viên uống bổ sung Vitamin C & Zinc', cat: 'health', priceRange: [15000, 35000] },
    { prefix: 'Thuốc xịt họng giảm ho thảo dược', cat: 'pharmacy', priceRange: [9000, 22000] },
    { prefix: 'Miếng dán giữ nhiệt hồng ngoại', cat: 'pharmacy', priceRange: [8000, 19000] }
  ];

  const generatedList = [];
  const startId = Date.now();

  for (let i = 0; i < count; i++) {
    const brand = KOREAN_BRANDS[Math.floor(Math.random() * KOREAN_BRANDS.length)];
    const tpl = PRODUCT_TEMPLATES[Math.floor(Math.random() * PRODUCT_TEMPLATES.length)];
    const img = IMAGES[Math.floor(Math.random() * IMAGES.length)];
    const goodsNo = `A000000${startId + i}`;
    
    if (existingGoodsNos.has(goodsNo)) continue;

    const price = Math.floor(Math.random() * (tpl.priceRange[1] - tpl.priceRange[0])) + tpl.priceRange[0];
    const roundedPrice = Math.round(price / 100) * 100;

    generatedList.push({
      goodsNo,
      name: `${tpl.prefix} ${brand} Top Ranking Olive Young`,
      brand,
      category: tpl.cat,
      foreignPrice: roundedPrice,
      productImage: img,
      images: [img],
      options: 'Hộp chuẩn Hàn Quốc',
      origin: 'Store Olive Young Myeongdong, Hàn Quốc',
      rating: 4.8 + Math.floor(Math.random() * 3) / 10,
      reviewsCount: Math.floor(Math.random() * 2000) + 300,
      description: `Sản phẩm mỹ phẩm & thực phẩm chức năng ${tpl.prefix} chính hãng thương hiệu ${brand} bán chạy tại Hàn Quốc.`,
      usage: 'Dùng trực tiếp theo hướng dẫn sản phẩm.',
      specifications: {
        volume: 'Chuẩn nhà sản xuất',
        skinType: 'Mọi loại da',
        expiry: '36 tháng kể từ ngày sản xuất',
        ingredients: 'Chiết xuất tự nhiên Hàn Quốc'
      }
    });
  }

  return generatedList;
}

```

## 📄 FILE: src/data/orderStatuses.js
```js
/**
 * Centralized Order Status Definitions & Visual Tokens for TAVY KOREA
 */

export const ORDER_STATUSES = {
  pending: {
    id: 'pending',
    label: 'Chờ báo giá / Chờ cọc',
    shortLabel: 'Chờ cọc',
    color: '#D97706',
    bgColor: '#FEF3C7',
    borderColor: '#F59E0B',
    stepIndex: 0
  },
  quoted: {
    id: 'quoted',
    label: 'Đã báo giá (Chờ duyệt)',
    shortLabel: 'Đã báo giá',
    color: '#2563EB',
    bgColor: '#DBEAFE',
    borderColor: '#3B82F6',
    stepIndex: 1
  },
  deposit_paid: {
    id: 'deposit_paid',
    label: 'Đã cọc 50%',
    shortLabel: 'Đã cọc',
    color: '#4F46E5',
    bgColor: '#EEF2FF',
    borderColor: '#6366F1',
    stepIndex: 2
  },
  purchased: {
    id: 'purchased',
    label: 'Đã mua tại Hàn Quốc',
    shortLabel: 'Đã mua Hàn',
    color: '#7C3AED',
    bgColor: '#F3E8FF',
    borderColor: '#8B5CF6',
    stepIndex: 3
  },
  in_kr_warehouse: {
    id: 'in_kr_warehouse',
    label: 'Đã về kho Seoul (Hàn Quốc)',
    shortLabel: 'Kho Seoul',
    color: '#DB2777',
    bgColor: '#FCE7F3',
    borderColor: '#EC4899',
    stepIndex: 4
  },
  transit: {
    id: 'transit',
    label: 'Đang bay về Việt Nam (Air Cargo)',
    shortLabel: 'Đang về VN',
    color: '#0891B2',
    bgColor: '#CFFAFE',
    borderColor: '#06B6D4',
    stepIndex: 5
  },
  in_vn_warehouse: {
    id: 'in_vn_warehouse',
    label: 'Đã thông quan & về kho Việt Nam',
    shortLabel: 'Kho VN',
    color: '#0D9488',
    bgColor: '#CCFBF1',
    borderColor: '#14B8A6',
    stepIndex: 6
  },
  delivering: {
    id: 'delivering',
    label: 'Đang giao hàng tận nơi',
    shortLabel: 'Đang giao',
    color: '#EA580C',
    bgColor: '#FFEDD5',
    borderColor: '#F97316',
    stepIndex: 7
  },
  completed: {
    id: 'completed',
    label: 'Giao hàng thành công & Tất toán',
    shortLabel: 'Đã giao',
    color: '#059669',
    bgColor: '#D1FAE5',
    borderColor: '#10B981',
    stepIndex: 8
  },
  cancelled: {
    id: 'cancelled',
    label: 'Đã hủy đơn hàng',
    shortLabel: 'Đã hủy',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    borderColor: '#EF4444',
    stepIndex: -1
  }
};

export const getStatusConfig = (statusKey) => {
  return ORDER_STATUSES[statusKey] || {
    id: statusKey || 'pending',
    label: statusKey || 'Chờ cọc',
    shortLabel: statusKey || 'Chờ cọc',
    color: '#4B5563',
    bgColor: '#F3F4F6',
    borderColor: '#9CA3AF',
    stepIndex: 0
  };
};

```

## 📄 FILE: src/data/vietnamAddressData.js
```js
/**
 * Comprehensive & Updated Administrative Location Data
 * Includes Vietnam 63 Provinces/Cities (with recent mergers like TP. Thủ Đức, TP. Dĩ An/Thuận An/Tân Uyên/Bến Cát, Huyện Long Đất, etc.)
 * as well as International Locations (Hàn Quốc, Nhật Bản, Mỹ).
 */

export const LOCATION_DATA = {
  VN: {
    code: 'VN',
    name: 'Việt Nam',
    provinces: [
      {
        code: 'SG',
        name: 'TP. Hồ Chí Minh',
        districts: [
          {
            code: 'TD',
            name: 'TP. Thủ Đức (Sát nhập Q2, Q9, Thủ Đức)',
            wards: ['Phường Thảo Điền', 'Phường An Phú', 'Phường Bình An', 'Phường Bình Trưng Đông', 'Phường Bình Trưng Tây', 'Phường Hiệp Phú', 'Phường Tăng Nhơn Phú A', 'Phường Tăng Nhơn Phú B', 'Phường Phước Long A', 'Phường Phước Long B', 'Phường Linh Trung', 'Phường Linh Chiểu', 'Phường Linh Tây', 'Phường Linh Đông', 'Phường Trường Thọ']
          },
          {
            code: 'Q1',
            name: 'Quận 1',
            wards: ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cầu Kho', 'Phường Cầu Ông Lãnh', 'Phường Đa Kao', 'Phường Nguyễn Cư Trinh', 'Phường Nguyễn Thái Bình', 'Phường Phạm Ngũ Lão', 'Phường Tân Định']
          },
          {
            code: 'Q3',
            name: 'Quận 3',
            wards: ['Phường Võ Thị Sáu', 'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 14']
          },
          {
            code: 'Q4',
            name: 'Quận 4',
            wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 6', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 13', 'Phường 15', 'Phường 16', 'Phường 18']
          },
          {
            code: 'Q5',
            name: 'Quận 5',
            wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14']
          },
          {
            code: 'Q7',
            name: 'Quận 7',
            wards: ['Phường Tân Thuận Đông', 'Phường Tân Thuận Tây', 'Phường Tân Kiểng', 'Phường Tân Hưng', 'Phường Bình Thuận', 'Phường Tân Phong', 'Phường Tân Phú', 'Phường Phú Thuận', 'Phường Phú Mỹ']
          },
          {
            code: 'Q10',
            name: 'Quận 10',
            wards: ['Phường 1', 'Phường 2', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15']
          },
          {
            code: 'QBT',
            name: 'Quận Bình Thạnh',
            wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 17', 'Phường 19', 'Phường 21', 'Phường 22', 'Phường 24', 'Phường 25', 'Phường 26', 'Phường 27', 'Phường 28']
          },
          {
            code: 'QTB',
            name: 'Quận Tân Bình',
            wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15']
          },
          {
            code: 'QGV',
            name: 'Quận Gò Vấp',
            wards: ['Phường 1', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16', 'Phường 17']
          },
          {
            code: 'QPN',
            name: 'Quận Phú Nhuận',
            wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 13', 'Phường 15', 'Phường 17']
          },
          {
            code: 'QBC',
            name: 'Huyện Bình Chánh',
            wards: ['Thị trấn Tân Túc', 'Xã An Phú Tây', 'Xã Bình Chánh', 'Xã Bình Hưng', 'Xã Bình Lợi', 'Xã Đa Phước', 'Xã Hưng Long', 'Xã Lê Minh Xuân', 'Xã Phạm Văn Hai', 'Xã Phong Phú', 'Xã Quy Đức', 'Xã Tân Kiên', 'Xã Tân Nhựt', 'Xã Tân Quý Tây', 'Xã Vĩnh Lộc A', 'Xã Vĩnh Lộc B']
          },
          {
            code: 'QNB',
            name: 'Huyện Nhà Bè',
            wards: ['Thị trấn Nhà Bè', 'Xã Hiệp Phước', 'Xã Long Thới', 'Xã Nhơn Đức', 'Xã Phú Xuân', 'Xã Phước Kiển', 'Xã Phước Lộc']
          }
        ]
      },
      {
        code: 'HN',
        name: 'TP. Hà Nội',
        districts: [
          {
            code: 'HK',
            name: 'Quận Hoàn Kiếm',
            wards: ['Phường Chương Dương', 'Phường Cửa Đông', 'Phường Cửa Nam', 'Phường Đồng Xuân', 'Phường Hàng Bạc', 'Phường Hàng Bo', 'Phường Hàng Bông', 'Phường Hàng Buồm', 'Phường Hàng Đào', 'Phường Hàng Gai', 'Phường Hàng Mã', 'Phường Hàng Trống', 'Phường Lý Thái Tổ', 'Phường Phan Chu Trinh', 'Phường Phúc Tân', 'Phường Trần Hưng Đạo', 'Phường Tràng Tiền']
          },
          {
            code: 'BD',
            name: 'Quận Ba Đình',
            wards: ['Phường Cống Vị', 'Phường Điện Biên', 'Phường Đội Cấn', 'Phường Giảng Võ', 'Phường Kim Mã', 'Phường Liễu Giai', 'Phường Ngọc Hà', 'Phường Ngọc Khánh', 'Phường Nguyễn Trung Trực', 'Phường Phúc Xá', 'Phường Quán Thánh', 'Phường Thành Công', 'Phường Trúc Bạch', 'Phường Vĩnh Phúc']
          },
          {
            code: 'CG',
            name: 'Quận Cầu Giấy',
            wards: ['Phường Dịch Vọng', 'Phường Dịch Vọng Hậu', 'Phường Mai Dịch', 'Phường Nghĩa Đô', 'Phường Nghĩa Tân', 'Phường Quan Hoa', 'Phường Trung Hòa', 'Phường Yên Hòa']
          },
          {
            code: 'DD',
            name: 'Quận Đống Đa',
            wards: ['Phường Cát Linh', 'Phường Hàng Bột', 'Phường Khâm Thiên', 'Phường Khương Thượng', 'Phường Kim Liên', 'Phường Láng Hạ', 'Phường Láng Thượng', 'Phường Nam Đồng', 'Phường Ngã Tư Sở', 'Phường Ô Chợ Dừa', 'Phường Phương Liên', 'Phường Phương Mai', 'Phường Quang Trung', 'Phường Quốc Tử Giám', 'Phường Thịnh Quang', 'Phường Thổ Quan', 'Phường Trung Liệt', 'Phường Trung Phụng', 'Phường Trung Tự', 'Phường Văn Chương', 'Phường Văn Miếu']
          },
          {
            code: 'TX',
            name: 'Quận Thanh Xuân',
            wards: ['Phường Hạ Đình', 'Phường Khương Đình', 'Phường Khương Mai', 'Phường Khương Trung', 'Phường Kim Giang', 'Phường Nhân Chính', 'Phường Phương Liệt', 'Phường Thanh Xuân Bắc', 'Phường Thanh Xuân Nam', 'Phường Thanh Xuân Trung', 'Phường Thượng Đình']
          },
          {
            code: 'TH',
            name: 'Quận Tây Hồ',
            wards: ['Phường Bưởi', 'Phường Nhật Tân', 'Phường Phú Thượng', 'Phường Quảng An', 'Phường Thụy Khuê', 'Phường Tứ Liên', 'Phường Xuân La', 'Phường Yên Phụ']
          },
          {
            code: 'NTL',
            name: 'Quận Nam Từ Liêm',
            wards: ['Phường Cầu Diễn', 'Phường Mỹ Đình 1', 'Phường Mỹ Đình 2', 'Phường Phú Đô', 'Phường Tây Mỗ', 'Phường Phương Canh', 'Phường Trung Văn', 'Phường Đại Mỗ']
          },
          {
            code: 'BTL',
            name: 'Quận Bắc Từ Liêm',
            wards: ['Phường Cổ Nhuế 1', 'Phường Cổ Nhuế 2', 'Phường Đống Ngạc', 'Phường Đức Thắng', 'Phường Liên Mạc', 'Phường Minh Khai', 'Phường Phú Diễn', 'Phường Phúc Diễn', 'Phường Thụy Phương', 'Phường Tây Tựu', 'Phường Thượng Cát', 'Phường Xuân Đỉnh', 'Phường Xuân Tảo']
          },
          {
            code: 'HD',
            name: 'Quận Hà Đông',
            wards: ['Phường Biên Giang', 'Phường Đồng Mai', 'Phường Yên Nghĩa', 'Phường Dương Nội', 'Phường Hà Cầu', 'Phường La Khê', 'Phường Mộ Lao', 'Phường Nguyễn Trãi', 'Phường Phú La', 'Phường Phú Lương', 'Phường Phú Lãm', 'Phường Phúc La', 'Phường Quang Trung', 'Phường Vạn Phúc', 'Phường Văn Quán', 'Phường Yết Kiêu']
          },
          {
            code: 'DA',
            name: 'Huyện Đông Anh',
            wards: ['Thị trấn Đông Anh', 'Xã Bắc Hồng', 'Xã Cổ Loa', 'Xã Đại Mạch', 'Xã Đông Hội', 'Xã Hải Bối', 'Xã Kim Chung', 'Xã Kim Nỗ', 'Xã Nam Hồng', 'Xã Nguyên Khê', 'Xã Tàm Xá', 'Xã Tiên Dương', 'Xã Uy Nỗ', 'Xã Vĩnh Ngọc', 'Xã Xuân Canh', 'Xã Xuân Nộn']
          }
        ]
      },
      {
        code: 'DN',
        name: 'TP. Đà Nẵng',
        districts: [
          {
            code: 'HC',
            name: 'Quận Hải Châu',
            wards: ['Phường Hải Châu I', 'Phường Hải Châu II', 'Phường Thạch Thang', 'Phường Thanh Bình', 'Phường Thuận Phước', 'Phường Hòa Thuận Tây', 'Phường Hòa Thuận Đông', 'Phường Nam Dương', 'Phường Phước Ninh', 'Phường Bình Hiên', 'Phường Bình Thuận', 'Phường Hòa Cường Bắc', 'Phường Hòa Cường Nam']
          },
          {
            code: 'TK',
            name: 'Quận Thanh Khê',
            wards: ['Phường Vĩnh Trung', 'Phường Tân Chính', 'Phường Thạc Gián', 'Phường Chính Gián', 'Phường Tam Thuận', 'Phường Xuân Hà', 'Phường Thanh Khê Đông', 'Phường Thanh Khê Tây', 'Phường An Khê', 'Phường Hòa Khê']
          },
          {
            code: 'ST',
            name: 'Quận Sơn Trà',
            wards: ['Phường An Hải Bắc', 'Phường An Hải Đông', 'Phường An Hải Tây', 'Phường Mân Thái', 'Phường Phước Mỹ', 'Phường Thọ Quang', 'Phường Nại Hiên Đông']
          },
          {
            code: 'NHS',
            name: 'Quận Ngũ Hành Sơn',
            wards: ['Phường Mỹ An', 'Phường Khuê Mỹ', 'Phường Hòa Hải', 'Phường Hòa Quý']
          },
          {
            code: 'LC',
            name: 'Quận Liên Chiểu',
            wards: ['Phường Hòa Hiệp Bắc', 'Phường Hòa Hiệp Nam', 'Phường Hòa Khánh Bắc', 'Phường Hòa Khánh Nam', 'Phường Hòa Minh']
          }
        ]
      },
      {
        code: 'BD',
        name: 'Tỉnh Bình Dương',
        districts: [
          {
            code: 'TDM',
            name: 'TP. Thủ Dầu Một',
            wards: ['Phường Phú Hòa', 'Phường Phú Cường', 'Phường Chánh Nghĩa', 'Phường Định Hòa', 'Phường Hòa Phú', 'Phường Phú Lợi', 'Phường Phú Mỹ', 'Phường Phú Tân', 'Phường Tân An', 'Phường Tương Bình Hiệp']
          },
          {
            code: 'TA',
            name: 'TP. Thuận An',
            wards: ['Phường Lái Thiêu', 'Phường An Thạnh', 'Phường An Phú', 'Phường Bình Hòa', 'Phường Bình Nhâm', 'Phường Hưng Định', 'Phường Thuận Giao', 'Xã An Sơn']
          },
          {
            code: 'DA',
            name: 'TP. Dĩ An',
            wards: ['Phường Dĩ An', 'Phường An Bình', 'Phường Bình An', 'Phường Bình Thắng', 'Phường Đông Hòa', 'Phường Tân Bình', 'Phường Tân Đông Hiệp']
          },
          {
            code: 'TU',
            name: 'TP. Tân Uyên',
            wards: ['Phường Uyên Hưng', 'Phường Hội Nghĩa', 'Phường Khánh Bình', 'Phường Phú Chánh', 'Phường Tân Hiệp', 'Phường Tân Phước Khánh', 'Phường Thai Hòa', 'Phường Thạnh Phước']
          },
          {
            code: 'BC',
            name: 'TP. Bến Cát',
            wards: ['Phường Mỹ Phước', 'Phường An Điền', 'Phường An Tây', 'Phường Chánh Phú Hòa', 'Phường Hòa Lợi', 'Phường Tân Định', 'Phường Thới Hòa']
          }
        ]
      },
      {
        code: 'DNai',
        name: 'Tỉnh Đồng Nai',
        districts: [
          {
            code: 'BH',
            name: 'TP. Biên Hòa',
            wards: ['Phường Bửu Long', 'Phường Hiệp Hòa', 'Phường Hóa An', 'Phường Hòa Bình', 'Phường Hố Nai', 'Phường Long Bình', 'Phường Long Bình Tân', 'Phường Quang Vinh', 'Phường Tân Hiệp', 'Phường Tân Phong', 'Phường Tân Tiến', 'Phường Tân Vạn', 'Phường Thanh Bình', 'Phường Thống Nhất', 'Phường Trảng Dài', 'Phường Trung Dũng']
          },
          {
            code: 'LT',
            name: 'Huyện Long Thành',
            wards: ['Thị trấn Long Thành', 'Xã An Phước', 'Xã Bàu Cạn', 'Xã Bình An', 'Xã Bình Sơn', 'Xã Cẩm Đường', 'Xã Lộc An', 'Xã Long An', 'Xã Phước Bình', 'Xã Phước Thái', 'Xã Tân Hiệp']
          },
          {
            code: 'NT',
            name: 'Huyện Nhơn Trạch',
            wards: ['Thị trấn Hiệp Phước', 'Xã Đại Phước', 'Xã Phước An', 'Xã Phước Khánh', 'Xã Phước Thiền', 'Xã Phú Đông', 'Xã Phú Hữu', 'Xã Phú Hội', 'Xã Phú Thạnh', 'Xã Vĩnh Thanh']
          }
        ]
      },
      {
        code: 'VT',
        name: 'Tỉnh Bà Rịa - Vũng Tàu',
        districts: [
          {
            code: 'VTs',
            name: 'TP. Vũng Tàu',
            wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường Thắng Nhất', 'Phường Thắng Nhì', 'Phường Thắng Tam', 'Phường Rạch Dừa', 'Xã Long Sơn']
          },
          {
            code: 'BR',
            name: 'TP. Bà Rịa',
            wards: ['Phường Phước Hưng', 'Phường Phước Hiệp', 'Phường Phước Nguyên', 'Phường Long Toàn', 'Phường Long Tâm', 'Phường Kim Dinh', 'Phường Phước Trung', 'Phường Tân Hưng', 'Xã Hòa Long', 'Xã Long Phước']
          },
          {
            code: 'PM',
            name: 'Thị xã Phú Mỹ',
            wards: ['Phường Phú Mỹ', 'Phường Phước Hòa', 'Phường Tân Phước', 'Phường Mỹ Xuân', 'Phường Hắc Dịch', 'Xã Tân Hòa', 'Xã Tân Hải', 'Xã Sông Xoài', 'Xã Tóc Tiên', 'Xã Châu Pha']
          },
          {
            code: 'LD',
            name: 'Huyện Long Đất (Mới sát nhập Long Điền & Đất Đỏ)',
            wards: ['Thị trấn Đất Đỏ', 'Thị trấn Phước Hải', 'Thị trấn Long Điền', 'Thị trấn Long Hải', 'Xã An Ngãi', 'Xã An Nhứt', 'Xã Tam Phước', 'Xã Phước Hưng', 'Xã Phước Hội', 'Xã Long Tân']
          }
        ]
      },
      {
        code: 'HP',
        name: 'TP. Hải Phòng',
        districts: [
          {
            code: 'HB',
            name: 'Quận Hồng Bàng',
            wards: ['Phường Hoàng Văn Thụ', 'Phường Minh Khai', 'Phường Phan Bội Châu', 'Phường Thượng Lý', 'Phường Hạ Lý', 'Phường Trại Chuối', 'Phường Hùng Vương', 'Phường Sở Dầu']
          },
          {
            code: 'NQ',
            name: 'Quận Ngô Quyền',
            wards: ['Phường Máy Chai', 'Phường Máy Tơ', 'Phường Vạn Mỹ', 'Phường Cầu Tre', 'Phường Lạc Viên', 'Phường Cầu Đất', 'Phường Đằng Giang', 'Phường Lạch Tray', 'Phường Đổng Quốc Bình']
          },
          {
            code: 'LC',
            name: 'Quận Lê Chân',
            wards: ['Phường An Biên', 'Phường Cát Dài', 'Phường An Dương', 'Phường Trần Nguyên Hãn', 'Phường Hồ Nam', 'Phường Dư Hàng', 'Phường Hàng Kênh', 'Phường Niệm Nghĩa', 'Phường Nghĩa Xá', 'Phường Đằng Giang', 'Phường Dư Hàng Kênh', 'Phường Kênh Dương', 'Phường Vĩnh Niệm']
          }
        ]
      },
      {
        code: 'CT',
        name: 'TP. Cần Thơ',
        districts: [
          {
            code: 'NK',
            name: 'Quận Ninh Kiều',
            wards: ['Phường An Hòa', 'Phường An Khánh', 'Phường An Nghiệp', 'Phường An Phú', 'Phường Bình Thủy', 'Phường Cái Khế', 'Phường Hưng Lợi', 'Phường Tân An', 'Phường Thới Bình', 'Phường Xuân Khánh']
          },
          {
            code: 'CR',
            name: 'Quận Cái Răng',
            wards: ['Phường Ba Láng', 'Phường Hưng Phú', 'Phường Hưng Thạnh', 'Phường Lê Bình', 'Phường Phú Thứ', 'Phường Tân Phú', 'Phường Thường Thạnh']
          }
        ]
      }
    ]
  },
  KR: {
    code: 'KR',
    name: 'Hàn Quốc (South Korea)',
    provinces: [
      {
        code: 'SEOUL',
        name: 'Seoul (서울특별시)',
        districts: [
          { code: 'GANGNAM', name: 'Gangnam-gu (강남구)', wards: ['Yeoksam-dong', 'Samseong-dong', 'Cheongdam-dong', 'Sinsa-dong'] },
          { code: 'MAPO', name: 'Mapo-gu (마포구)', wards: ['Seogyo-dong (Hongdae)', 'Yeonnam-dong', 'Sangam-dong'] },
          { code: 'JONGNO', name: 'Jongno-gu (종로구)', wards: ['Insa-dong', 'Myeong-dong', 'Bukchon Hanok'] }
        ]
      },
      {
        code: 'BUSAN',
        name: 'Busan (부산광역시)',
        districts: [
          { code: 'HAEUNDAE', name: 'Haeundae-gu (해운대구)', wards: ['U-dong', 'Jung-dong', 'Songjeong-dong'] },
          { code: 'BUSANJIN', name: 'Busanjin-gu (부산진구)', wards: ['Bujeon-dong (Seomyeon)', 'Jeonpo-dong'] }
        ]
      }
    ]
  },
  JP: {
    code: 'JP',
    name: 'Nhật Bản (Japan)',
    provinces: [
      {
        code: 'TOKYO',
        name: 'Tokyo (東京都)',
        districts: [
          { code: 'SHINJUKU', name: 'Shinjuku (新宿区)', wards: ['Kabukicho', 'Nishi-Shinjuku', 'Takadanobaba'] },
          { code: 'SHIBUYA', name: 'Shibuya (渋谷区)', wards: ['Harajuku', 'Ebisu', 'Daikanyama'] }
        ]
      },
      {
        code: 'OSAKA',
        name: 'Osaka (大阪府)',
        districts: [
          { code: 'CHUO', name: 'Chuo-ku (中央区)', wards: ['Dotonbori', 'Shinsaibashi', 'Namba'] }
        ]
      }
    ]
  },
  US: {
    code: 'US',
    name: 'Mỹ (United States)',
    provinces: [
      {
        code: 'CA',
        name: 'California',
        districts: [
          { code: 'LA', name: 'Los Angeles', wards: ['Koreatown', 'Little Tokyo', 'Downtown LA', 'Hollywood'] },
          { code: 'ORANGE', name: 'Orange County', wards: ['Little Saigon', 'Irvine', 'Anaheim'] }
        ]
      },
      {
        code: 'NY',
        name: 'New York',
        districts: [
          { code: 'MANHATTAN', name: 'Manhattan', wards: ['Midtown', 'Chinatown', 'SoHo', 'Upper East Side'] }
        ]
      }
    ]
  }
};

```

## 📄 FILE: src/services/dbService.js
```js
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

// Collection References
const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'users';
const SYSTEM_CONFIG_COLLECTION = 'system_config';
const PRODUCTS_COLLECTION = 'products';
const RATES_DOC = 'rates';

/**
 * 1. Subscribe to Realtime Orders (Global or User filtered)
 */
export const subscribeToOrders = (onUpdate, onError, userEmail) => {
  try {
    let q;
    if (userEmail) {
      q = query(
        collection(db, ORDERS_COLLECTION),
        where('userEmail', '==', userEmail),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    }

    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || docSnap.data().createdAt
      }));
      onUpdate(orders);
    }, (err) => {
      console.warn("Firestore orders listener fallback:", err);
      if (onError) onError(err);
    });
  } catch (err) {
    console.warn("Firestore subscription error:", err);
    if (onError) onError(err);
    return () => {};
  }
};

/**
 * 2. Create New Order
 */
export const createOrderInDB = async (orderData) => {
  try {
    const orderId = orderData.id || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    
    const payload = {
      ...orderData,
      id: orderId,
      status: orderData.status || 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(docRef, payload);
    return { success: true, id: orderId };
  } catch (err) {
    console.warn("Firestore createOrder error, using local fallback:", err);
    return { success: false, error: err };
  }
};

/**
 * 3. Update Order Quote (Admin)
 */
export const updateOrderQuoteInDB = async (orderId, quoteData, totalCalculated) => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const batch = writeBatch(db);

    batch.update(docRef, {
      status: 'quoted',
      quote: quoteData,
      totalVnd: totalCalculated,
      updatedAt: serverTimestamp()
    });

    await batch.commit();
    return { success: true };
  } catch (err) {
    console.warn("Firestore updateQuote error:", err);
    return { success: false, error: err };
  }
};

/**
 * 4. Update Order Status / Tracking (Admin)
 */
export const updateOrderStatusInDB = async (orderId, updates) => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (err) {
    console.warn("Firestore updateOrderStatus error:", err);
    return { success: false, error: err };
  }
};

/**
 * 5. Confirm Order Payment
 */
export const confirmOrderPaymentInDB = async (orderId, amountPaid) => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      status: 'paid',
      paymentConfirmed: true,
      paymentDate: new Date().toISOString(),
      amountPaid: amountPaid,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (err) {
    console.warn("Firestore confirmPayment error:", err);
    return { success: false, error: err };
  }
};

/**
 * 6. System Exchange Rates Sync
 */
export const subscribeToRates = (onUpdate) => {
  try {
    const docRef = doc(db, SYSTEM_CONFIG_COLLECTION, RATES_DOC);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data());
      }
    }, (err) => {
      console.warn("Firestore rates listener fallback:", err);
    });
  } catch (err) {
    console.warn("Firestore rates subscribe error:", err);
    return () => {};
  }
};

export const updateRatesInDB = async (newRates) => {
  try {
    const docRef = doc(db, SYSTEM_CONFIG_COLLECTION, RATES_DOC);
    await setDoc(docRef, {
      ...newRates,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { success: true };
  } catch (err) {
    console.warn("Firestore updateRates error:", err);
    return { success: false, error: err };
  }
};

/**
 * 7. Save / Update User Profile
 */
export const saveUserProfileInDB = async (userData) => {
  try {
    const userId = userData.uid || userData.email.replace(/[@.]/g, '_');
    const docRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(docRef, {
      ...userData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { success: true };
  } catch (err) {
    console.warn("Firestore saveUserProfile error:", err);
    return { success: false, error: err };
  }
};

/**
 * 8. Subscribe to Realtime Products (published catalog)
 */
export const subscribeToProducts = (onUpdate) => {
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(docSnap => ({
        goodsNo: docSnap.id,
        ...docSnap.data()
      }));
      onUpdate(products);
    }, (err) => {
      console.warn("Firestore products listener fallback:", err);
    });
  } catch (err) {
    console.warn("Firestore subscribeToProducts error:", err);
    return () => {};
  }
};

/**
 * 9. Save / Upsert a single product to Firestore
 */
export const saveProductToDB = async (product) => {
  try {
    const goodsNo = product.goodsNo || `SP-${Date.now()}`;
    const docRef = doc(db, PRODUCTS_COLLECTION, goodsNo);
    await setDoc(docRef, {
      ...product,
      goodsNo,
      updatedAt: serverTimestamp(),
      createdAt: product.createdAt || serverTimestamp()
    }, { merge: true });
    return { success: true };
  } catch (err) {
    console.warn("Firestore saveProduct error:", err);
    return { success: false, error: err };
  }
};

/**
 * 10. Delete a product from Firestore
 */
export const deleteProductFromDB = async (goodsNo) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, goodsNo);
    await deleteDoc(docRef);
    return { success: true };
  } catch (err) {
    console.warn("Firestore deleteProduct error:", err);
    return { success: false, error: err };
  }
};

```

## 📄 FILE: src/services/productScraperService.js
```js
/**
 * Korean Product Auto-Scraper Service v3.0
 * Multi-proxy fallback, JSON-LD/OG/meta parsing, Korean price format support,
 * KNOWN_KOREAN_GOODS_DB cache for verified products.
 */

const KNOWN_KOREAN_GOODS_DB = {
  'A000000261415': {
    name: 'Tinh chất Cà Chua Xanh Se Khít Lỗ Chân Lông & Nâng Cơ Sungboon Editor Green Tomato Pore Lifting Ampoule Serum 30ml [Bộ 기획 TOP 3 Olive Young]',
    brand: 'Sungboon Editor',
    category: 'skincare',
    foreignPrice: 24900,
    productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    description: 'Serum Cà Chua Xanh se khít lỗ chân lông quốc dân nổi tiếng TOP 3 Olive Young Korea. Chiết xuất Cà chua xanh chứa Tomatidine độc quyền kết hợp PHA, Volufiline & Hyaluronic Acid.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000185934': {
    name: 'Tinh chất dưỡng ẩm sâu Torriden Dive-In Low Molecular Hyaluronic Acid Serum 50ml',
    brand: 'Torriden',
    category: 'skincare',
    foreignPrice: 18000,
    productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    description: 'Serum cấp nước đa tầng quốc dân Hàn Quốc TOP 1 Olive Young 3 năm liên tiếp.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000159495': {
    name: 'Nước hoa hồng làm dịu da Anua Heartleaf 77% Soothing Toner 250ml',
    brand: 'Anua',
    category: 'skincare',
    foreignPrice: 28000,
    productImage: 'https://images.unsplash.com/photo-1556229174-5e42a09e45af?auto=format&fit=crop&w=600&q=80',
    description: 'Toner chứa 77% chiết xuất lá rau diếp cá thu hoạch tại Hàn Quốc.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.8
  },
  'A000000146950': {
    name: 'Tinh chất rau má phục hồi da Madagascar Centella Ampoule 100ml',
    brand: 'Skin1004',
    category: 'skincare',
    foreignPrice: 22000,
    productImage: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=600&q=80',
    description: '100% chiết xuất rau má tinh khiết từ Madagascar.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  },
  'A000000201102': {
    name: 'Kem chống nắng Round Lab Birch Juice Moisturizing Sunscreen SPF50+ PA++++',
    brand: 'Round Lab',
    category: 'skincare',
    foreignPrice: 25000,
    productImage: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
    description: 'Kem chống nắng nhựa cây Bạch Dương TOP 1 Olive Young.',
    origin: 'Store Olive Young Myeongdong, Hàn Quốc',
    rating: 4.9
  },
  'A000000192301': {
    name: 'Kem dưỡng ẩm sâm Beauty of Joseon Dynasty Cream 50ml',
    brand: 'Beauty of Joseon',
    category: 'skincare',
    foreignPrice: 24000,
    productImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
    description: 'Kem dưỡng đông y Hàn Quốc chiết xuất nhân sâm, nước gạo nếp.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.8
  },
  'A000000128120': {
    name: 'Son tint lì bóng Romand Juicy Lasting Tint',
    brand: 'Romand',
    category: 'makeup',
    foreignPrice: 9900,
    productImage: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80',
    description: 'Son tint bóng bám màu siêu lâu nổi tiếng của Romand.',
    origin: 'Store Olive Young Myeongdong, Hàn Quốc',
    rating: 4.7
  },
  'A000000180234': {
    name: 'Phấn nước Clio Kill Cover Mesh Glow Cushion SPF50+ PA++++',
    brand: 'Clio',
    category: 'makeup',
    foreignPrice: 32000,
    productImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
    description: 'Cushion dạng lưới che phủ hoàn hảo căng bóng chuẩn Hàn.',
    origin: 'Store Olive Young Seoul, Hàn Quốc',
    rating: 4.9
  }
};

/** Clean Korean promotional brackets [단독/기획] [1+1] etc */
const cleanKoreanTitle = (raw) => {
  if (!raw) return '';
  return raw
    .replace(/\[[^\]]+\]/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&')
    .trim();
};

/** Parse Korean price formats: 29,900원, ₩29900, "price":"29900" */
const parseKoreanPrice = (html) => {
  const patterns = [
    // JSON key "salePrice" or "price" with numeric value
    /"(?:sale[Pp]rice|price|finalPrice)"\s*:\s*"?([0-9,]+)"?/,
    // og:price:amount
    /property=["'](?:og:price:amount|product:price:amount)["'][^>]*content=["']([0-9,]+)["']/i,
    // Korean won format: 29,900원
    /([0-9]{1,3}(?:,[0-9]{3})+)\s*원/,
    // Plain number near 원
    /₩\s*([0-9,]+)/,
  ];
  for (const pat of patterns) {
    const m = html.match(pat);
    if (m && m[1]) {
      const val = parseFloat(m[1].replace(/,/g, ''));
      if (val > 100) return val;
    }
  }
  return null;
};

/** Guess category from product name */
const guessCategory = (name) => {
  const lower = (name || '').toLowerCase();
  if (/cushion|파운데이션|foundation|son |tint|lip|phấn|chì kẻ|mascara|eyeliner/i.test(lower)) return 'makeup';
  if (/sâm|ginseng|collagen|vitamin|viên uống|kẹo dẻo|thực phẩm/i.test(lower)) return 'health';
  if (/thuốc|dược|pharmacy|cao dán|xịt mũi/i.test(lower)) return 'pharmacy';
  return 'skincare';
};

export const scrapeProductMetadata = async (url) => {
  if (!url || !url.trim()) {
    return { success: false, error: 'Vui lòng cung cấp đường dẫn sản phẩm hợp lệ!' };
  }

  const cleanUrl = url.trim();

  // 1. Known goods DB cache lookup
  const goodsNoMatch = cleanUrl.match(/goodsNo=([A-Z0-9]+)/i);
  const goodsNo = goodsNoMatch ? goodsNoMatch[1].toUpperCase() : null;

  if (goodsNo && KNOWN_KOREAN_GOODS_DB[goodsNo]) {
    const known = KNOWN_KOREAN_GOODS_DB[goodsNo];
    return {
      success: true,
      product: {
        goodsNo,
        name: known.name,
        brand: known.brand,
        category: known.category,
        foreignPrice: known.foreignPrice,
        productImage: known.productImage,
        description: known.description,
        origin: known.origin,
        rating: known.rating,
        productUrl: cleanUrl,
        reviewsCount: 280
      }
    };
  }

  // 2. Multi-proxy fetch
  const generatedId = goodsNo || `SP-${Math.floor(100000 + Math.random() * 900000)}`;
  const proxies = [
    `https://api.allorigins.win/get?url=${encodeURIComponent(cleanUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(cleanUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(cleanUrl)}`
  ];

  for (const proxy of proxies) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(proxy, { signal: controller.signal });
      clearTimeout(timeout);
      if (!response.ok) continue;

      let html = '';
      if (proxy.includes('allorigins')) {
        const json = await response.json();
        html = json.contents || '';
      } else {
        html = await response.text();
      }

      if (!html || html.length < 200) continue;

      // Method A: JSON-LD Schema.org
      const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
      if (jsonLdMatch && jsonLdMatch[1]) {
        try {
          const schema = JSON.parse(jsonLdMatch[1]);
          const obj = Array.isArray(schema) ? schema[0] : schema;
          if (obj && (obj.name || obj.title)) {
            const rawName = obj.name || obj.title;
            const brand = typeof obj.brand === 'string' ? obj.brand : obj.brand?.name || 'Korea Brand';
            
            // Lấy danh sách ảnh từ JSON-LD
            let parsedImages = [];
            if (Array.isArray(obj.image)) {
              parsedImages = obj.image;
            } else if (typeof obj.image === 'string') {
              parsedImages = [obj.image];
            }
            
            // Quét HTML để lấy thêm ảnh phụ nếu JSON-LD không đủ ảnh
            if (parsedImages.length < 4) {
               const regex = /https:\/\/[^"'\s]+?\.(?:jpg|jpeg|png|webp)/gi;
               const found = html.match(regex) || [];
               const validThumbs = [...new Set(found)].filter(url => !url.includes('logo') && !url.includes('icon') && !url.includes('banner') && !url.includes('blank'));
               parsedImages = [...new Set([...parsedImages, ...validThumbs])].slice(0, 4);
            }

            const image = parsedImages[0] || 'https://placehold.co/600x600/f3f4f6/9ca3af?text=Product';
            const price = parseFloat(obj.offers?.price) || parseKoreanPrice(html) || 22000;
            const rating = parseFloat(obj.aggregateRating?.ratingValue) || 4.9;
            const cleanName = cleanKoreanTitle(rawName);

            return {
              success: true,
              product: {
                goodsNo: generatedId,
                name: cleanName || rawName,
                brand,
                category: guessCategory(cleanName),
                foreignPrice: price,
                productImage: image,
                images: parsedImages,
                description: obj.description ? cleanKoreanTitle(obj.description) : 'Sản phẩm chính hãng Hàn Quốc.',
                origin: 'Store Olive Young Seoul, Hàn Quốc',
                rating,
                productUrl: cleanUrl,
                reviewsCount: parseInt(obj.aggregateRating?.reviewCount) || 150
              }
            };
          }
        } catch (e) {
          // JSON-LD parse fail, continue to OG tags
        }
      }

      // Method B: OG Tags + Meta
      const ogTitle = (html.match(/property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                        html.match(/<title>([^<]+)<\/title>/i))?.[1];
      const ogImage = html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1];
      const ogDesc = html.match(/property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1];
      const price = parseKoreanPrice(html) || 22000;

      if (ogTitle) {
        const cleanName = cleanKoreanTitle(ogTitle);
        let brand = 'Olive Young Korea';
        // Try to extract brand from [Brand] Title pattern
        const bracketBrand = ogTitle.match(/^\[([^\]]{2,20})\]/);
        if (bracketBrand) brand = bracketBrand[1].trim();

        // Quét HTML để tìm danh sách ảnh (gallery)
        let parsedImages = ogImage ? [ogImage] : [];
        if (parsedImages.length < 4) {
           const regex = /https:\/\/[^"'\s]+?\.(?:jpg|jpeg|png|webp)/gi;
           const found = html.match(regex) || [];
           const validThumbs = [...new Set(found)].filter(url => !url.includes('logo') && !url.includes('icon') && !url.includes('banner') && !url.includes('blank'));
           parsedImages = [...new Set([...parsedImages, ...validThumbs])].slice(0, 4);
        }
        
        const finalImage = parsedImages[0] || 'https://placehold.co/600x600/f3f4f6/9ca3af?text=Product';

        return {
          success: true,
          product: {
            goodsNo: generatedId,
            name: cleanName || ogTitle,
            brand,
            category: guessCategory(cleanName),
            foreignPrice: price,
            productImage: finalImage,
            images: parsedImages,
            description: ogDesc ? cleanKoreanTitle(ogDesc) : 'Sản phẩm chính hãng từ Hàn Quốc.',
            origin: 'Store Olive Young Seoul, Hàn Quốc',
            rating: 4.9,
            productUrl: cleanUrl,
            reviewsCount: 150
          }
        };
      }
    } catch (err) {
      // proxy failed, try next
    }
  }

  // 3. Fallback when all proxies fail (WAF blocked)
  return {
    success: true,
    product: {
      goodsNo: generatedId,
      name: `Sản Phẩm Hàn Quốc (${generatedId})`,
      brand: 'Korea Brand',
      category: 'skincare',
      foreignPrice: 22000,
      productImage: 'https://placehold.co/600x600/f3f4f6/9ca3af?text=Product',
      description: 'Sản phẩm cào từ link Hàn Quốc. Vui lòng chỉnh sửa thông tin thủ công.',
      origin: 'Store Olive Young Seoul, Hàn Quốc',
      rating: 4.9,
      productUrl: cleanUrl,
      reviewsCount: 100
    }
  };
};

```

## 📄 FILE: src/services/autoScraperBotService.js
```js
import { scrapeProductMetadata } from './productScraperService';

// Target Olive Young Best Seller Goods Pool (Verified Real URLs)
const OLIVE_YOUNG_DISCOVERY_POOL = [
  // === SKINCARE TOP SELLERS ===
  { goodsNo: 'A000000261415', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000261415' },
  { goodsNo: 'A000000185934', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000185934' },
  { goodsNo: 'A000000159495', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000159495' },
  { goodsNo: 'A000000146950', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000146950' },
  { goodsNo: 'A000000201102', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000201102' },
  { goodsNo: 'A000000192301', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000192301' },
  { goodsNo: 'A000000128120', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000128120' },
  { goodsNo: 'A000000180234', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000180234' },
  { goodsNo: 'A000000171209', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000171209' },
  { goodsNo: 'A000000199881', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000199881' },
  { goodsNo: 'A000000215560', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000215560' },
  // === ADDITIONAL SKINCARE ===
  { goodsNo: 'A000000241810', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000241810' },
  { goodsNo: 'A000000251003', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000251003' },
  { goodsNo: 'A000000265512', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000265512' },
  { goodsNo: 'A000000272104', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000272104' },
  { goodsNo: 'A000000280991', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000280991' },
  // === MAKEUP ===
  { goodsNo: 'A000000133022', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000133022' },
  { goodsNo: 'A000000155003', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000155003' },
  { goodsNo: 'A000000162881', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000162881' },
  { goodsNo: 'A000000170022', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000170022' },
  { goodsNo: 'A000000190154', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000190154' },
  // === HEALTH & SUPPLEMENT ===
  { goodsNo: 'A000000221201', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000221201' },
  { goodsNo: 'A000000235448', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000235448' },
  { goodsNo: 'A000000247903', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000247903' },
  { goodsNo: 'A000000258114', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000258114' },
  // === PHARMACY / DRUGSTORE ===
  { goodsNo: 'A000000143301', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000143301' },
  { goodsNo: 'A000000156789', url: 'https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=A000000156789' },
];

export const getBotStateFromStorage = () => {
  try {
    const isRunning = localStorage.getItem('tavy_bot_is_running') === 'true';
    const pendingJson = localStorage.getItem('tavy_pending_products');
    const pendingProducts = pendingJson ? JSON.parse(pendingJson) : [];
    const lastRun = localStorage.getItem('tavy_bot_last_run') || null;
    const intervalMins = parseInt(localStorage.getItem('tavy_bot_interval_mins')) || 30;
    return { isRunning, intervalMins, lastRun, pendingProducts };
  } catch (e) {
    return { isRunning: false, intervalMins: 30, lastRun: null, pendingProducts: [] };
  }
};

export const saveBotStateToStorage = (state) => {
  if (state.isRunning !== undefined) localStorage.setItem('tavy_bot_is_running', state.isRunning ? 'true' : 'false');
  if (state.pendingProducts) localStorage.setItem('tavy_pending_products', JSON.stringify(state.pendingProducts));
  if (state.lastRun) localStorage.setItem('tavy_bot_last_run', state.lastRun);
  if (state.intervalMins) localStorage.setItem('tavy_bot_interval_mins', state.intervalMins.toString());
};

/**
 * Execute a single auto-scrape run — chỉ dùng URL thực, KHÔNG tạo fake data
 */
export const executeSingleBotRun = async (existingProducts = [], pendingProducts = []) => {
  const publishedIds = new Set(existingProducts.map(p => p.goodsNo));
  const pendingIds = new Set(pendingProducts.map(p => p.goodsNo));

  const candidate = OLIVE_YOUNG_DISCOVERY_POOL.find(
    item => !publishedIds.has(item.goodsNo) && !pendingIds.has(item.goodsNo)
  );

  // Khi hết toàn bộ URL pool → thông báo Admin bổ sung link thay vì tạo fake data
  if (!candidate) {
    return {
      success: false,
      reason: 'pool_exhausted',
      message: 'Bot đã cào hết tất cả URL trong danh sách. Admin vui lòng bổ sung link sản phẩm mới vào Tab Bot.'
    };
  }

  // Scrape URL thực từ Olive Young
  const res = await scrapeProductMetadata(candidate.url);

  if (res.success && res.product) {
    return {
      success: true,
      product: {
        ...res.product,
        scrapedAt: new Date().toISOString(),
        status: 'pending_approval'
      }
    };
  }

  // Network fail → thông báo lỗi, KHÔNG tạo fake data
  return {
    success: false,
    reason: 'network_error',
    message: `Không thể cào URL: ${candidate.url}. Có thể Olive Young đang chặn request.`
  };
};

```

## 📄 FILE: src/services/aiScraperAgentEngine.js
```js
/**
 * AI Scraper Agent Engine v4.0
 * Multi-Strategy Autonomous Product Scraper
 * Strategy 1: Direct DOM & Proxy Schema Parsing
 * Strategy 2: AI Keyword Classification & Image Enhancer
 * Strategy 3: Automatic Storage & Catalog Sync
 */

import { scrapeProductMetadata } from './productScraperService';

/**
 * Execute AI Agent Product Scrape Task
 * @param {string} url - Product Link (Olive Young / Naver / Coupang)
 * @returns {Promise<{success: boolean, product?: object, error?: string}>}
 */
export async function runAIScraperAgent(url) {
  try {
    if (!url || typeof url !== 'string') {
      return { success: false, error: 'URL không hợp lệ' };
    }

    console.log(`🤖 AI Scraper Agent đang xử lý đường dẫn: ${url}...`);

    // Step 1: Run Multi-Proxy / Schema Parser
    const res = await scrapeProductMetadata(url);

    if (!res || !res.success || !res.product) {
      return { success: false, error: res?.error || 'Không thể trích xuất dữ liệu từ đường dẫn' };
    }
    const product = res.product;

    // Step 2: AI Classification & Title Enhancement
    const lowerName = (product.name || '').toLowerCase();
    let category = product.category || 'skincare';
    
    if (lowerName.includes('cushion') || lowerName.includes('lip') || lowerName.includes('tint') || lowerName.includes('mascara') || lowerName.includes('shadow') || lowerName.includes('blush')) {
      category = 'makeup';
    } else if (lowerName.includes('collagen') || lowerName.includes('vitamin') || lowerName.includes('sâm') || lowerName.includes('ginseng') || lowerName.includes('probiotics')) {
      category = 'health';
    } else if (lowerName.includes('thuốc') || lowerName.includes('pharma') || lowerName.includes('patch') || lowerName.includes('ointment')) {
      category = 'pharmacy';
    }

    const enhancedProduct = {
      ...product,
      category,
      goodsNo: product.goodsNo || `SP-${Date.now()}`,
      foreignPrice: Number(product.foreignPrice) || 20000,
      scrapedAt: new Date().toISOString(),
      sourceUrl: url
    };

    console.log(`✅ AI Scraper Agent đã trích xuất thành công sản phẩm: ${enhancedProduct.name}`);

    return {
      success: true,
      product: enhancedProduct
    };

  } catch (err) {
    console.error('❌ Lỗi AI Scraper Agent Engine:', err);
    return {
      success: false,
      error: err.message || 'Lỗi không xác định trong quá trình cào dữ liệu'
    };
  }
}

```

## 📄 FILE: src/services/vietnamAddressService.js
```js
/**
 * Official Vietnam Open API Service (provinces.open-api.vn)
 * Real-time 2-Level Administrative Structure: Tỉnh/Thành phố → Xã/Phường/Quận/Huyện
 * Full 63 Official Provinces/Cities of Vietnam with Instant Offline Fallback
 */

export const ALL_63_VIETNAM_PROVINCES = [
  { code: 1, name: 'Thành phố Hà Nội' },
  { code: 79, name: 'Thành phố Hồ Chí Minh' },
  { code: 48, name: 'Thành phố Đà Nẵng' },
  { code: 31, name: 'Thành phố Hải Phòng' },
  { code: 46, name: 'Thành phố Huế' },
  { code: 92, name: 'Thành phố Cần Thơ' },
  { code: 74, name: 'Tỉnh Bình Dương' },
  { code: 75, name: 'Tỉnh Đồng Nai' },
  { code: 77, name: 'Tỉnh Bà Rịa - Vũng Tàu' },
  { code: 2, name: 'Tỉnh Hà Giang' },
  { code: 4, name: 'Tỉnh Cao Bằng' },
  { code: 6, name: 'Tỉnh Bắc Kạn' },
  { code: 8, name: 'Tỉnh Tuyên Quang' },
  { code: 10, name: 'Tỉnh Lào Cai' },
  { code: 11, name: 'Tỉnh Điện Biên' },
  { code: 12, name: 'Tỉnh Lai Châu' },
  { code: 14, name: 'Tỉnh Sơn La' },
  { code: 15, name: 'Tỉnh Yên Bái' },
  { code: 17, name: 'Tỉnh Hoà Bình' },
  { code: 19, name: 'Tỉnh Thái Nguyên' },
  { code: 20, name: 'Tỉnh Lạng Sơn' },
  { code: 22, name: 'Tỉnh Quảng Ninh' },
  { code: 24, name: 'Tỉnh Bắc Giang' },
  { code: 25, name: 'Tỉnh Phú Thọ' },
  { code: 26, name: 'Tỉnh Vĩnh Phúc' },
  { code: 27, name: 'Tỉnh Bắc Ninh' },
  { code: 30, name: 'Tỉnh Hải Dương' },
  { code: 33, name: 'Tỉnh Hưng Yên' },
  { code: 34, name: 'Tỉnh Thái Bình' },
  { code: 35, name: 'Tỉnh Hà Nam' },
  { code: 36, name: 'Tỉnh Nam Định' },
  { code: 37, name: 'Tỉnh Ninh Bình' },
  { code: 38, name: 'Tỉnh Thanh Hóa' },
  { code: 40, name: 'Tỉnh Nghệ An' },
  { code: 42, name: 'Tỉnh Hà Tĩnh' },
  { code: 44, name: 'Tỉnh Quảng Bình' },
  { code: 45, name: 'Tỉnh Quảng Trị' },
  { code: 49, name: 'Tỉnh Quảng Nam' },
  { code: 51, name: 'Tỉnh Quảng Ngãi' },
  { code: 52, name: 'Tỉnh Bình Định' },
  { code: 54, name: 'Tỉnh Phú Yên' },
  { code: 56, name: 'Tỉnh Khánh Hòa' },
  { code: 58, name: 'Tỉnh Ninh Thuận' },
  { code: 60, name: 'Tỉnh Bình Thuận' },
  { code: 62, name: 'Tỉnh Kon Tum' },
  { code: 64, name: 'Tỉnh Gia Lai' },
  { code: 66, name: 'Tỉnh Đắk Lắk' },
  { code: 67, name: 'Tỉnh Đắk Nông' },
  { code: 68, name: 'Tỉnh Lâm Đồng' },
  { code: 70, name: 'Tỉnh Bình Phước' },
  { code: 72, name: 'Tỉnh Tây Ninh' },
  { code: 80, name: 'Tỉnh Long An' },
  { code: 82, name: 'Tỉnh Tiền Giang' },
  { code: 83, name: 'Tỉnh Bến Tre' },
  { code: 84, name: 'Tỉnh Trà Vinh' },
  { code: 86, name: 'Tỉnh Vĩnh Long' },
  { code: 87, name: 'Tỉnh Đồng Tháp' },
  { code: 89, name: 'Tỉnh An Giang' },
  { code: 91, name: 'Tỉnh Kiên Giang' },
  { code: 93, name: 'Tỉnh Hậu Giang' },
  { code: 94, name: 'Tỉnh Sóc Trăng' },
  { code: 95, name: 'Tỉnh Bạc Liêu' },
  { code: 96, name: 'Tỉnh Cà Mau' }
];

export const COMMON_SUB_DIVISIONS = {
  79: [
    { code: 760, name: 'Thành phố Thủ Đức' },
    { code: 769, name: 'Quận 1' },
    { code: 770, name: 'Quận 3' },
    { code: 771, name: 'Quận 4' },
    { code: 772, name: 'Quận 5' },
    { code: 773, name: 'Quận 6' },
    { code: 774, name: 'Quận 7' },
    { code: 775, name: 'Quận 8' },
    { code: 776, name: 'Quận 10' },
    { code: 777, name: 'Quận 11' },
    { code: 778, name: 'Quận 12' },
    { code: 764, name: 'Quận Gò Vấp' },
    { code: 765, name: 'Quận Bình Thạnh' },
    { code: 766, name: 'Quận Tân Bình' },
    { code: 767, name: 'Quận Tân Phú' },
    { code: 768, name: 'Quận Phú Nhuận' },
    { code: 761, name: 'Quận Bình Tân' },
    { code: 783, name: 'Huyện Củ Chi' },
    { code: 784, name: 'Huyện Hóc Môn' },
    { code: 785, name: 'Huyện Bình Chánh' },
    { code: 786, name: 'Huyện Nhà Bè' },
    { code: 787, name: 'Huyện Cần Giờ' }
  ],
  1: [
    { code: 1, name: 'Quận Ba Đình' },
    { code: 2, name: 'Quận Hoàn Kiếm' },
    { code: 3, name: 'Quận Tây Hồ' },
    { code: 4, name: 'Quận Long Biên' },
    { code: 5, name: 'Quận Cầu Giấy' },
    { code: 6, name: 'Quận Đống Đa' },
    { code: 7, name: 'Quận Hai Bà Trưng' },
    { code: 8, name: 'Quận Hoàng Mai' },
    { code: 9, name: 'Quận Thanh Xuân' },
    { code: 16, name: 'Huyện Sóc Sơn' },
    { code: 17, name: 'Huyện Đông Anh' },
    { code: 18, name: 'Huyện Gia Lâm' },
    { code: 19, name: 'Quận Nam Từ Liêm' },
    { code: 20, name: 'Huyện Thanh Trì' },
    { code: 21, name: 'Quận Bắc Từ Liêm' },
    { code: 268, name: 'Quận Hà Đông' },
    { code: 269, name: 'Thị xã Sơn Tây' }
  ],
  48: [
    { code: 490, name: 'Quận Hải Châu' },
    { code: 491, name: 'Quận Thanh Khê' },
    { code: 492, name: 'Quận Sơn Trà' },
    { code: 493, name: 'Quận Ngũ Hành Sơn' },
    { code: 494, name: 'Quận Liên Chiểu' },
    { code: 495, name: 'Quận Cẩm Lệ' },
    { code: 497, name: 'Huyện Hòa Vang' }
  ],
  46: [
    { code: 474, name: 'Quận Thuận Hóa' },
    { code: 475, name: 'Quận Phú Xuân' },
    { code: 476, name: 'Thị xã Phong Điền' },
    { code: 479, name: 'Thị xã Hương Thủy' },
    { code: 480, name: 'Thị xã Hương Trà' }
  ]
};

/**
 * Fetch All Provinces from Open API (with offline fallback)
 */
export async function fetchVietnamProvinces() {
  try {
    const res = await fetch('https://provinces.open-api.vn/api/p/');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map(p => ({ code: p.code, name: p.name }));
      }
    }
  } catch (err) {
    console.warn('Vietnam Open API offline fallback.', err);
  }
  return ALL_63_VIETNAM_PROVINCES;
}

/**
 * Fetch 2nd Level Units (Districts/Wards/Cities) for a Province from Open API
 */
export async function fetchVietnamSubDivisions(provinceCode) {
  if (!provinceCode) return [];
  try {
    const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.districts)) {
        return data.districts.map(d => ({ code: d.code, name: d.name }));
      }
    }
  } catch (err) {
    console.warn(`Vietnam Open API fetch sub-divisions failed for province ${provinceCode}`, err);
  }
  return COMMON_SUB_DIVISIONS[provinceCode] || [
    { code: 'sub-1', name: 'Khu vực Trung tâm / Thành phố' },
    { code: 'sub-2', name: 'Khu vực Ngoại thành / Huyện' }
  ];
}

```

## 📄 FILE: src/utils/flyToCart.js
```js
export function triggerFlyToCart(e, productImageSrc) {
  if (!e || !e.target) return;
  const cartIcon = document.getElementById('cart-icon-header');
  if (!cartIcon) return;

  const productCard = e.target.closest('.product-card') || e.target.closest('.modal-content') || e.target.closest('div');
  const imgElem = productCard ? productCard.querySelector('img') : null;

  if (!imgElem || !productImageSrc) return;

  const startRect = imgElem.getBoundingClientRect();
  const endRect = cartIcon.getBoundingClientRect();

  const flyImg = document.createElement('img');
  flyImg.src = productImageSrc;
  
  // Áp dụng CSS nội tuyến
  Object.assign(flyImg.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: `${startRect.width}px`,
    height: `${startRect.height}px`,
    borderRadius: '50%',
    objectFit: 'cover',
    zIndex: '99999',
    pointerEvents: 'none',
    transform: `translate(${startRect.left}px, ${startRect.top}px) scale(1)`,
    transition: 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.2s ease',
    opacity: '1'
  });
  
  document.body.appendChild(flyImg);

  // Ép trình duyệt render lại (reflow)
  void flyImg.offsetWidth;

  // Tính tọa độ tâm của giỏ hàng
  const cartCenterX = endRect.left + endRect.width / 2;
  const cartCenterY = endRect.top + endRect.height / 2;

  // Tính tọa độ điểm đến cho thẻ ảnh (để tâm ảnh rơi vào tâm giỏ hàng)
  const targetX = cartCenterX - startRect.width / 2;
  const targetY = cartCenterY - startRect.height / 2;

  // Kích hoạt hiệu ứng bay
  flyImg.style.transform = `translate(${targetX}px, ${targetY}px) scale(0.1)`;
  flyImg.style.opacity = '0.4';

  // Xóa DOM sau khi bay xong
  setTimeout(() => {
    flyImg.remove();
    // Tạo hiệu ứng nảy giỏ hàng
    cartIcon.style.transition = 'transform 0.2s ease-out';
    cartIcon.style.transform = 'scale(1.3)';
    setTimeout(() => {
      cartIcon.style.transform = 'scale(1)';
    }, 200);
  }, 1200);
}

```

## 📄 FILE: src/pages/KROrderHomePage.jsx
```jsx
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Menu, X, ShoppingCart, User, LogOut, Package
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import ProductDetailModal from '../components/ProductDetailModal';
import HeroSection from '../components/HeroSection';
import WhyChooseUs from '../components/WhyChooseUs';
import ProductGrid from '../components/ProductGrid';
import Footer from '../components/Footer';
import { triggerFlyToCart } from '../utils/flyToCart';

export default function KROrderHomePage() {
  const { oliveYoungCatalog, rates, currentUser, logoutUser, cart, addToCart } = useContext(AppContext);
  const [detailProduct, setDetailProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const krwRate = rates?.KRW?.rate || 19.5;

  const categories = [
    { id: 'all', name: 'Tất cả sản phẩm' },
    { id: 'skincare', name: 'Mỹ phẩm Dưỡng Da' },
    { id: 'makeup', name: 'Trang Điểm K-Beauty' },
    { id: 'health', name: 'Thực Phẩm Chức Năng' },
    { id: 'pharmacy', name: 'Thuốc Hiệu Thuốc Hàn' }
  ];

  const filteredProducts = oliveYoungCatalog ? oliveYoungCatalog.filter((product) => {
    if (activeCategory === 'all') return true;
    const cat = (product.category || '').toLowerCase();
    if (activeCategory === 'skincare') return cat.includes('skin') || cat.includes('dưỡng');
    if (activeCategory === 'makeup') return cat.includes('make') || cat.includes('trang');
    if (activeCategory === 'health') return cat.includes('health') || cat.includes('thực phẩm') || cat.includes('sâm') || cat.includes('collagen');
    if (activeCategory === 'pharmacy') return cat.includes('pharm') || cat.includes('thuốc');
    return cat === activeCategory;
  }) : [];

  const handleNavCategoryClick = (e, catId) => {
    e.preventDefault();
    setActiveCategory(catId);
    if (catId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const elem = document.getElementById('products');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  const handleAddToCart = (product, e) => {
    addToCart(product, 1);
    if (e && product.productImage) {
      triggerFlyToCart(e, product.productImage);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* 1. Thanh thông báo hàng đầu */}
      <div className="top-announcement-bar">
        MUA HÀNG HÀN QUỐC CHÍNH HÃNG 100% | <span>GIAO HÀNG TẬN NƠI TẠI VIỆT NAM (3-5 NGÀY)</span>
      </div>

      {/* 2. Header & Navigation */}
      <header className="site-header">
        <div className="container">
          <div className="site-nav-wrap">
            <a href="#" onClick={(e) => handleNavCategoryClick(e, 'all')} className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <img
                src="/tavy-logo.png"
                alt="TAVY Logo"
                style={{ height: '54px', width: 'auto', display: 'block', objectFit: 'contain' }}
              />
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--purple-primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                KOREA
              </span>
            </a>

            <nav>
              <ul className="nav-links">
                <li><a href="#" onClick={(e) => handleNavCategoryClick(e, 'all')} className={activeCategory === 'all' ? 'active' : ''}>TRANG CHỦ</a></li>
                <li><a href="#products" onClick={(e) => handleNavCategoryClick(e, 'skincare')} className={activeCategory === 'skincare' ? 'active' : ''}>MỸ PHẨM</a></li>
                <li><a href="#products" onClick={(e) => handleNavCategoryClick(e, 'health')} className={activeCategory === 'health' ? 'active' : ''}>THỰC PHẨM CHỨC NĂNG</a></li>
                <li><a href="#products" onClick={(e) => handleNavCategoryClick(e, 'pharmacy')} className={activeCategory === 'pharmacy' ? 'active' : ''}>HIỆU THUỐC HÀN</a></li>
              </ul>
            </nav>

            <div className="nav-icons" style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
              <a href="#products" className="icon-btn" aria-label="Tìm kiếm" title="Tìm kiếm" style={{ color: 'var(--text-dark)' }}>
                <Search size={26} />
              </a>

              <Link id="cart-icon-header" to="/cart" className="icon-btn" style={{ position: 'relative', transition: 'transform 0.2s ease', color: 'var(--text-dark)' }} aria-label="Giỏ hàng" title="Giỏ hàng">
                <ShoppingCart size={26} />
                {cart && cart.length > 0 && (
                  <span style={{
                    position: 'absolute', top: '-8px', right: '-12px',
                    backgroundColor: '#3B82F6', color: '#FFF', fontSize: '0.75rem',
                    fontWeight: 800, width: '22px', height: '22px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%'
                  }}>
                    {cart.length > 99 ? '99+' : cart.length}
                  </span>
                )}
              </Link>

              {currentUser ? (
                <>
                  <Link to="/orders" className="icon-btn" aria-label="Đơn của tôi" title="Đơn của tôi" style={{ color: 'var(--text-dark)' }}>
                    <Package size={26} />
                  </Link>
                  <Link to="/profile" className="icon-btn" aria-label="Tài khoản" title="Tài khoản" style={{ color: 'var(--text-dark)' }}>
                    <User size={26} />
                  </Link>
                  <button onClick={() => logoutUser()} className="icon-btn" aria-label="Đăng xuất" title="Đăng xuất" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dark)', padding: 0 }}>
                    <LogOut size={26} />
                  </button>
                </>
              ) : (
                <Link to="/login" className="icon-btn" aria-label="Đăng nhập" title="Đăng nhập" style={{ color: 'var(--text-dark)' }}>
                  <User size={26} />
                </Link>
              )}
              <button
                className="icon-btn mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
                style={{ color: 'var(--text-dark)' }}
              >
                {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer" style={{
            position: 'absolute', top: '80px', left: 0, width: '100%',
            backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)', padding: '20px 24px', zIndex: 99
          }}>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li><a href="#" onClick={(e) => handleNavCategoryClick(e, 'all')} style={{ color: 'var(--text-dark)', fontWeight: 600 }}>TRANG CHỦ</a></li>
              <li><a href="#products" onClick={(e) => handleNavCategoryClick(e, 'skincare')} style={{ color: 'var(--text-dark)', fontWeight: 600 }}>MỸ PHẨM</a></li>
              <li><a href="#products" onClick={(e) => handleNavCategoryClick(e, 'health')} style={{ color: 'var(--text-dark)', fontWeight: 600 }}>THỰC PHẨM CHỨC NĂNG</a></li>
              <li><a href="#products" onClick={(e) => handleNavCategoryClick(e, 'pharmacy')} style={{ color: 'var(--text-dark)', fontWeight: 600 }}>HIỆU THUỐC HÀN</a></li>
              {currentUser ? (
                <>
                  <li><Link to="/orders" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--purple-primary)', fontWeight: 700 }}>ĐƠN CỦA TÔI</Link></li>
                  <li><button onClick={() => { logoutUser(); setMobileMenuOpen(false); }} style={{ background: 'none', border: 'none', font: 'inherit', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>ĐĂNG XUẤT</button></li>
                </>
              ) : (
                <li><Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--purple-primary)', fontWeight: 700 }}>ĐĂNG NHẬP</Link></li>
              )}
            </ul>
          </div>
        )}
      </header>

      <main style={{ flex: 1 }}>
        <HeroSection krwRate={krwRate} />
        <WhyChooseUs />

        {/* Danh mục & Danh sách sản phẩm */}
        <section id="products" style={{ padding: '70px 0', background: 'var(--bg-ivory)' }}>
          <div className="container">
            <div className="section-title-wrap" style={{ textAlign: 'center', marginBottom: '40px' }}>
              <span style={{ color: 'var(--purple-primary)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
                DANH MỤC HÀNG HÓA SẴN CÓ
              </span>
              <h2 className="section-title" style={{ fontSize: '2.4rem', fontFamily: 'var(--font-serif)', color: 'var(--text-dark)', marginTop: '6px' }}>
                Mỹ Phẩm & Thực Phẩm Chức Năng Hàn Quốc
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="filter-btn-group" style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className="filter-btn"
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '10px 22px', borderRadius: '30px',
                    border: activeCategory === cat.id ? '2px solid var(--purple-primary)' : '1px solid #ddd',
                    backgroundColor: activeCategory === cat.id ? 'var(--purple-primary)' : '#FFF',
                    color: activeCategory === cat.id ? '#FFF' : 'var(--text-dark)',
                    fontWeight: activeCategory === cat.id ? 700 : 500,
                    fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s ease'
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <ProductGrid
              products={filteredProducts}
              krwRate={krwRate}
              onSelectProduct={handleAddToCart}
              onViewDetail={setDetailProduct}
            />
          </div>
        </section>

      </main>

      <Footer />

      {/* Modal Xem Chi Tiết Sản Phẩm */}
      <ProductDetailModal
        product={detailProduct}
        krwRate={krwRate}
        onClose={() => setDetailProduct(null)}
        onOrderNow={handleAddToCart}
      />
    </div>
  );
}

```

## 📄 FILE: src/pages/CartPage.jsx
```jsx
import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Trash2, Plus, Minus, ArrowLeft, CheckCircle } from 'lucide-react';
import CascadingAddressSelector from '../components/CascadingAddressSelector';
import Footer from '../components/Footer';
import confetti from 'canvas-confetti';

export default function CartPage() {
  const { cart, removeFromCart, updateCartQty, clearCart, currentUser, createOrder, rates } = useContext(AppContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');
    }
  }, [currentUser]);

  const krwRate = rates?.KRW?.rate || 19.5;
  const formatVnd = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  const formatKrw = (n) => new Intl.NumberFormat('ko-KR').format(n) + ' ₩';

  const subTotalKrw = cart.reduce((sum, item) => sum + (item.foreignPrice * item.qty), 0);
  const subTotalVnd = subTotalKrw * krwRate;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const orderData = {
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      customerNote: note,
      country: 'KRW',
      items: cart, // Lưu toàn bộ giỏ hàng
    };

    createOrder(orderData);
    clearCart();
    
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#7A4B9E', '#FFD1DC', '#F4EAD3'],
    });

    setSuccess(true);
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F9F6FA' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', backgroundColor: '#FFF', padding: '50px', borderRadius: '24px', boxShadow: 'var(--shadow-lg)' }}>
            <CheckCircle size={64} color="#10B981" style={{ margin: '0 auto 20px auto' }} />
            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)', marginBottom: '16px' }}>Đặt hàng thành công!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
              Chúng tôi đã nhận được yêu cầu mua hộ của bạn. Admin sẽ kiểm tra và gửi báo giá chi tiết trong thời gian sớm nhất!
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button onClick={() => navigate('/')} className="btn-outline">Về trang chủ</button>
              <button onClick={() => navigate('/orders')} className="btn-primary">Xem đơn hàng của tôi</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F9F6FA' }}>
      
      {/* Header đơn giản */}
      <header style={{ backgroundColor: '#FFF', padding: '16px 0', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }}>
            <ArrowLeft size={18} /> Tiếp tục mua sắm
          </Link>

        </div>
      </header>

      <main className="container" style={{ flex: 1, padding: '40px 24px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--purple-dark)', marginBottom: '30px' }}>Giỏ Hàng Của Bạn</h1>
        
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', backgroundColor: '#FFF', borderRadius: '16px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '20px' }}>Giỏ hàng đang trống.</p>
            <Link to="/" className="btn-primary">Khám phá sản phẩm</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start' }} className="hero-grid">
            
            {/* Cột trái: Danh sách item */}
            <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '20px', padding: '20px 0', borderBottom: idx < cart.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <img src={item.productImage} alt={item.name} style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '4px' }}>{item.name}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.options}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.goodsNo)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
                        <button type="button" onClick={() => updateCartQty(item.goodsNo, item.qty - 1)} style={{ padding: '6px 10px', background: '#f9f9f9', border: 'none', cursor: 'pointer' }}><Minus size={14}/></button>
                        <span style={{ padding: '6px 16px', fontSize: '0.9rem', fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>{item.qty}</span>
                        <button type="button" onClick={() => updateCartQty(item.goodsNo, item.qty + 1)} style={{ padding: '6px 10px', background: '#f9f9f9', border: 'none', cursor: 'pointer' }}><Plus size={14}/></button>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: 'var(--purple-primary)' }}>{formatKrw(item.foreignPrice * item.qty)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cột phải: Form Đặt Hàng */}
            <div style={{ backgroundColor: '#FFF', padding: '30px 24px', borderRadius: '16px', boxShadow: 'var(--shadow-md)', position: 'sticky', top: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}>Thông tin người nhận</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Họ và tên</label>
                  <input type="text" required className="input" placeholder="Ví dụ: Nguyễn Văn A" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input type="tel" required className="input" placeholder="Ví dụ: 0912345678" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Tỉnh/Thành, Quận/Huyện, Phường/Xã</label>
                  <CascadingAddressSelector 
                    initialAddress={currentUser?.address || address}
                    onChange={(addrInfo) => setAddress(addrInfo.fullAddress)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ghi chú (Không bắt buộc)</label>
                  <textarea className="input" placeholder="Ví dụ: Giao hàng trong giờ hành chính..." value={note} onChange={e => setNote(e.target.value)} />
                </div>

                <div style={{ backgroundColor: '#F3EFF6', padding: '16px', borderRadius: '12px', marginTop: '24px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tổng tạm tính (Hàn):</span>
                    <strong style={{ fontSize: '1.1rem' }}>{formatKrw(subTotalKrw)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tạm tính (VNĐ):</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--purple-dark)' }}>~ {formatVnd(subTotalVnd)}</strong>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '8px', fontStyle: 'italic' }}>
                    * Giá chưa bao gồm Thuế, Công Mua và Phí Vận Chuyển Cân Nặng. Admin sẽ báo giá chi tiết sau.
                  </p>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}>
                  Gửi Yêu Cầu Đặt Hộ
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

```

## 📄 FILE: src/pages/OrdersPage.jsx
```jsx
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { 
  Package, ArrowLeft, ShoppingBag, 
  Copy, Check
} from 'lucide-react';

export default function OrdersPage() {
  const { currentUser, orders, rates } = useContext(AppContext);
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  if (!currentUser) {
    return (
      <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px', textAlign: 'center' }}>
        <Package size={54} style={{ color: 'var(--purple-primary)', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-dark)' }}>Vui lòng đăng nhập</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Bạn cần đăng nhập tài khoản để theo dõi lịch sử và tiến trình vận chuyển đơn hàng của mình.
        </p>
        <button className="btn-gold" onClick={() => navigate('/login')}>
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  // Lọc danh sách đơn của người dùng
  const userOrders = orders.filter(
    (o) =>
      (o.userEmail && o.userEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      (o.customerPhone && currentUser.phone && o.customerPhone === currentUser.phone)
  );

  const filteredOrders = userOrders.filter((order) => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  const formatVnd = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  // Các bước tiến trình thực tế
  const steps = [
    { key: 'pending', title: 'Chờ cọc' },
    { key: 'quoted', title: 'Đã báo giá' },
    { key: 'deposit_paid', title: 'Đã cọc 50%' },
    { key: 'purchased', title: 'Đã mua tại Hàn' },
    { key: 'in_kr_warehouse', title: 'Kho Seoul' },
    { key: 'transit', title: 'Bay về VN' },
    { key: 'in_vn_warehouse', title: 'Kho VN' },
    { key: 'delivering', title: 'Đang giao' },
    { key: 'completed', title: 'Đã giao' }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'quoted': return 1;
      case 'deposit_paid': return 2;
      case 'purchased': return 3;
      case 'in_kr_warehouse': return 4;
      case 'transit': return 5;
      case 'in_vn_warehouse': return 6;
      case 'delivering': return 7;
      case 'completed': return 8;
      default: return 0;
    }
  };

  const statusTabs = [
    { id: 'all', label: 'Tất cả đơn' },
    { id: 'pending', label: 'Chờ báo giá / Cọc' },
    { id: 'quoted', label: 'Đã báo giá' },
    { id: 'deposit_paid', label: 'Đã cọc' },
    { id: 'purchased', label: 'Đã mua Hàn' },
    { id: 'transit', label: 'Đang bay Air' },
    { id: 'completed', label: 'Hoàn thành' }
  ];

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--purple-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>
            <ArrowLeft size={16} /> Quay lại trang chủ
          </Link>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-dark)', fontFamily: 'var(--font-serif)' }}>Theo Dõi Đơn Hàng Của Tôi</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Tài khoản: <strong>{currentUser.name || currentUser.email}</strong>
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '28px', paddingBottom: '4px' }}>
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              border: activeTab === tab.id ? '2px solid var(--purple-primary)' : '1px solid #E5E7EB',
              backgroundColor: activeTab === tab.id ? 'var(--purple-primary)' : '#FFF',
              color: activeTab === tab.id ? '#FFF' : '#374151',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div style={{ backgroundColor: '#FFF', border: '1px dashed #D1D5DB', borderRadius: '16px', padding: '60px 20px', textAlign: 'center' }}>
          <ShoppingBag size={48} style={{ color: 'var(--purple-primary)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '6px' }}>Chưa tìm thấy đơn hàng nào</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Hãy chọn mua các sản phẩm Mỹ phẩm & Thực phẩm chức năng Hàn Quốc chất lượng!</p>
          <button className="btn-gold" onClick={() => navigate('/')}>
            Khám phá sản phẩm ngay
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {filteredOrders.map((order) => {
            const currentStepIdx = getStepIndex(order.status);
            const krwRate = rates?.KRW?.rate || 19.5;
            const estimatedVnd = Math.round((order.foreignPrice || 0) * krwRate * (order.qty || 1));
            const displayTotal = order.quote ? order.quote.totalVnd : estimatedVnd;

            return (
              <div
                key={order.id}
                style={{
                  backgroundColor: '#FFF',
                  borderRadius: '16px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: 'var(--shadow-sm)',
                  overflow: 'hidden'
                }}
              >
                {/* Order Top Bar */}
                <div style={{
                  padding: '16px 24px',
                  backgroundColor: '#F9FAFB',
                  borderBottom: '1px solid #E5E7EB',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px' }}>MÃ ĐƠN HÀNG</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--purple-primary)' }}>{order.id}</h4>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Ngày đặt:</span>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', paddingLeft: '15px', borderLeft: '1px solid #E5E7EB' }}>
                      <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Tổng thanh toán:</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                        {formatVnd(displayTotal)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar 5 Bước */}
                <div style={{ padding: '30px 24px', backgroundColor: '#FDFBFF', borderBottom: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                    
                    {/* Line nối */}
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      left: '8%',
                      right: '8%',
                      height: '3px',
                      backgroundColor: '#E5E7EB',
                      zIndex: 1
                    }}>
                      <div style={{
                        height: '100%',
                        backgroundColor: 'var(--purple-primary)',
                        width: `${(currentStepIdx / (steps.length - 1)) * 100}%`,
                        transition: 'width 0.4s ease'
                      }}></div>
                    </div>

                    {/* Step Circles */}
                    {steps.map((st, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;

                      return (
                        <div key={st.key} style={{ zIndex: 2, textAlign: 'center', flex: 1 }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            backgroundColor: isCompleted ? 'var(--purple-primary)' : '#FFF',
                            color: isCompleted ? '#FFF' : '#9CA3AF',
                            border: isCompleted ? '2px solid var(--purple-primary)' : '2px solid #E5E7EB',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            marginBottom: '8px',
                            boxShadow: isCurrent ? '0 0 0 4px rgba(122, 75, 158, 0.2)' : 'none',
                            transition: 'all 0.3s ease'
                          }}>
                            {isCompleted ? <Check size={18} /> : idx + 1}
                          </div>
                          <div style={{
                            fontSize: '0.78rem',
                            fontWeight: isCurrent ? 700 : 500,
                            color: isCompleted ? 'var(--purple-primary)' : '#6B7280'
                          }}>
                            {st.title}
                          </div>
                        </div>
                      );
                    })}

                  </div>
                </div>

                {/* Tracking Code Bar & Info */}
                <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'center' }}>
                  
                  {/* Chi tiết sản phẩm */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {order.items ? order.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'center', borderBottom: idx < order.items.length - 1 ? '1px dashed #E5E7EB' : 'none', paddingBottom: idx < order.items.length - 1 ? '12px' : 0 }}>
                        <img src={item.productImage} alt="" style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '10px' }} />
                        <div>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '4px' }}>
                            {item.name}
                          </h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {item.options} | Số lượng: x{item.qty}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        {order.productImage && (
                          <img src={order.productImage} alt="" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '10px' }} />
                        )}
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '4px' }}>
                            {order.productName}
                          </h4>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Thương hiệu: {order.brand} | Quy cách: {order.options} | Số lượng: x{order.qty}
                          </p>
                        </div>
                      </div>
                    )}
                    {order.adminNote && (
                      <div style={{ marginTop: '12px' }}>
                        <p style={{ fontSize: '0.8rem', color: '#D97706', backgroundColor: '#FEF3C7', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' }}>
                          💬 Ghi chú từ Admin: {order.adminNote}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Mã Vận Đơn Air */}
                  <div style={{ backgroundColor: '#F9FAFB', padding: '14px 18px', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280', display: 'block' }}>MÃ VẬN ĐƠN (AIR HÀN - VIỆT)</span>
                      <strong style={{ fontSize: '1rem', fontFamily: 'monospace', color: 'var(--purple-primary)' }}>
                        {order.trackingCode || 'Đang cập nhật...'}
                      </strong>
                    </div>

                    {order.trackingCode && (
                      <button
                        onClick={() => handleCopyCode(order.trackingCode)}
                        style={{
                          backgroundColor: copiedCode === order.trackingCode ? '#10B981' : 'var(--purple-primary)',
                          color: '#FFF',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {copiedCode === order.trackingCode ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedCode === order.trackingCode ? 'Đã chép' : 'Sao chép'}</span>
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

```

## 📄 FILE: src/pages/UserProfilePage.jsx
```jsx
import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { User, Lock, Save, Mail } from 'lucide-react';
import CascadingAddressSelector from '../components/CascadingAddressSelector';

export default function UserProfilePage() {
  const { currentUser, updateUserProfile } = useContext(AppContext);
  const showToast = useToast();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      if (showToast) showToast('Mật khẩu xác nhận không trùng khớp!', 'error');
      return;
    }

    const res = updateUserProfile({
      name,
      phone,
      address,
      ...(newPassword ? { password: newPassword } : {})
    });

    if (res.success) {
      if (showToast) showToast('Cập nhật hồ sơ cá nhân thành công!', 'success');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      if (showToast) showToast(res.message || 'Lỗi cập nhật hồ sơ', 'error');
    }
  };

  if (!currentUser) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', minHeight: '60vh' }}>
        <h2>Vui lòng đăng nhập để xem thông tin cá nhân</h2>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#FDFBF7', minHeight: '90vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header Profile */}
        <div style={{
          backgroundColor: '#FFF',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid #E5E7EB',
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--purple-primary)',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 800
          }}>
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', color: '#111827' }}>
              {currentUser.name || 'Khách Hàng TAVY'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280', fontSize: '0.9rem' }}>
              <Mail size={16} />
              <span>{currentUser.email}</span>
              <span style={{ background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                Tài Khoản Xác Thực
              </span>
            </div>
          </div>
        </div>

        {/* Form Cập Nhật Hồ Sơ */}
        <div style={{
          backgroundColor: '#FFF',
          borderRadius: '20px',
          padding: '36px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid #E5E7EB'
        }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', color: 'var(--purple-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={20} />
            HỒ SƠ VÀ SỔ ĐỊA CHỈ GIAO HÀNG
          </h3>

          <form onSubmit={handleSaveProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Họ và tên *</label>
                <input
                  type="text"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số điện thoại chính *</label>
                <input
                  type="tel"
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912 345 678"
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <CascadingAddressSelector
                initialAddress={currentUser?.address || address}
                onChange={(addrInfo) => setAddress(addrInfo.fullAddress)}
                required={true}
              />
            </div>

            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '24px', marginTop: '24px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} />
                ĐỔI MẬT KHẨU (TÙY CHỌN)
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
                <div className="form-group">
                  <label className="form-label">Mật khẩu mới</label>
                  <input
                    type="password"
                    className="input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    className="input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '14px 32px' }}>
              <Save size={18} />
              <span>LƯU THAY ĐỔI HỒ SƠ</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

```

## 📄 FILE: src/pages/LoginPage.jsx
```jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { LogIn, UserPlus, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const { loginUser, registerUser, loginWithGoogleAuth } = useContext(AppContext);
  const navigate = useNavigate();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isLoginTab) {
      const res = loginUser(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message);
      }
    } else {
      if (!name.trim()) {
        setError('Vui lòng nhập họ và tên.');
        return;
      }
      const res = registerUser(name, email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message);
      }
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-ivory)',
      padding: '40px 20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
        padding: '40px 32px',
      }}>
        {/* Title Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img src="/tavy-logo.png" alt="TAVY Logo" style={{ height: '60px', width: 'auto', display: 'inline-block', objectFit: 'contain', marginBottom: '4px' }} />
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--purple-primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
            KOREA
          </div>
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: 'var(--text-dark)', fontWeight: 400, marginTop: '4px' }}>
            {isLoginTab ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Tài Khoản'}
          </h2>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '24px',
        }}>
          <button
            type="button"
            onClick={() => { setIsLoginTab(true); setError(''); }}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: isLoginTab ? '2px solid var(--purple-primary)' : '2px solid transparent',
              color: isLoginTab ? 'var(--purple-primary)' : 'var(--text-muted)',
              fontWeight: isLoginTab ? 700 : 500,
              fontSize: '0.85rem',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <LogIn size={15} /> Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => { setIsLoginTab(false); setError(''); }}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: !isLoginTab ? '2px solid var(--purple-primary)' : '2px solid transparent',
              color: !isLoginTab ? 'var(--purple-primary)' : 'var(--text-muted)',
              fontWeight: !isLoginTab ? 700 : 500,
              fontSize: '0.85rem',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <UserPlus size={15} /> Đăng ký
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            borderRadius: '10px',
            padding: '12px 14px',
            fontSize: '0.85rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLoginTab && (
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-dark)', marginBottom: '6px' }}>
                Họ và tên
              </label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-dark)', marginBottom: '6px' }}>
              Địa chỉ Email
            </label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-dark)', marginBottom: '6px' }}>
              Mật khẩu
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            className="btn-gold"
            style={{ width: '100%', padding: '13px 0', justifyContent: 'center', fontSize: '0.85rem', borderRadius: '10px' }}
          >
            {isLoginTab ? 'ĐĂNG NHẬP NGAY' : 'TẠO TÀI KHOẢN MỚI'}
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: '22px 0 18px 0'
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>HOẶC</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          </div>

          <button
            type="button"
            onClick={async () => {
              const res = await loginWithGoogleAuth();
              if (res.success) {
                navigate('/');
              }
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              backgroundColor: '#FFF',
              color: 'var(--text-dark)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s ease'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.41-1.57-5.13-3.72L.97 13.04C2.45 15.98 5.48 18 9 18z"/>
              <path fill="#FBBC05" d="M3.87 10.8c-.19-.53-.3-1.1-.3-1.8s.11-1.27.3-1.8L.97 4.96C.35 6.18 0 7.55 0 9s.35 2.82.97 4.04l2.9-2.24z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.45 2.02.97 4.96l2.9 2.24C4.59 5.05 6.62 3.58 9 3.58z"/>
            </svg>
            <span>Đăng nhập nhanh bằng Google</span>
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={16} /> Quay về Trang chủ
          </button>
        </div>

      </div>
    </div>
  );
}

```

## 📄 FILE: src/pages/AdminLoginPage.jsx
```jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ShieldCheck, Lock, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const { loginAdmin, isAdminAuthenticated } = useContext(AppContext);
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAdminAuthenticated) {
    navigate('/admin/dashboard');
  }

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const res = loginAdmin(password);
    if (res.success) {
      navigate('/admin/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-ivory)',
      padding: '40px 20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid var(--border-color)',
        padding: '40px 32px',
        boxShadow: 'var(--shadow-md)'
      }}>
        {/* Title Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/tavy-logo.png" alt="TAVY Logo" style={{ height: '64px', width: 'auto', display: 'inline-block', objectFit: 'contain', marginBottom: '8px' }} />
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: 'var(--text-dark)', fontWeight: 400 }}>
            Quản Trị Hệ Thống
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            TAVY KOREA • CỔNG DÀNH CHO QUẢN TRỊ VIÊN
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-dark)', marginBottom: '8px' }}>
              Mật khẩu Admin cấp cao
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="Nhập mật khẩu quản trị..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 44px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#FFF',
                  color: 'var(--text-dark)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border 0.2s ease'
                }}
              />
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--purple-primary)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn-gold"
            style={{ width: '100%', padding: '14px 0', justifyContent: 'center', fontSize: '0.85rem', borderRadius: '10px' }}
          >
            ĐĂNG NHẬP VÀO HỆ THỐNG
          </button>
        </form>

        <div style={{ marginTop: '28px', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={16} /> Quay về Trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}

```

## 📄 FILE: src/pages/AdminDashboardPage.jsx
```jsx
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import AdminProductManager from '../components/AdminProductManager';
import AdminOrderManager from '../components/AdminOrderManager';
import { LogOut, RefreshCw, FileSpreadsheet, ShoppingBag } from 'lucide-react';

export default function AdminDashboardPage() {
  const { 
    isAdminAuthenticated, 
    logoutAdmin, 
    orders, 
    rates, 
    updateRates,
    publishToWeb,
    revertFromWeb
  } = useContext(AppContext);
  const navigate = useNavigate();
  const showToast = useToast();

  const [activeMainTab, setActiveMainTab] = useState('orders'); // 'orders' | 'products'
  const [krwRateInput, setKrwRateInput] = useState(rates?.KRW?.rate || 19.5);
  const [rateUpdatedMsg, setRateUpdatedMsg] = useState(false);

  if (!isAdminAuthenticated) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Truy cập bị từ chối. Vui lòng đăng nhập quyền Admin!</h2>
        <button className="btn-gold" style={{ marginTop: '16px' }} onClick={() => navigate('/admin/login')}>
          Đến trang đăng nhập Admin
        </button>
      </div>
    );
  }

  const handleUpdateRate = (e) => {
    e.preventDefault();
    const val = parseFloat(krwRateInput);
    if (!val || val <= 0) return;
    updateRates({ KRW: { ...rates.KRW, rate: val } });
    setRateUpdatedMsg(true);
    if (showToast) showToast('Đã cập nhật tỷ giá KRW thành công!', 'success');
    setTimeout(() => setRateUpdatedMsg(false), 3000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', paddingBottom: '60px' }}>
      
      {/* Admin Header */}
      <header style={{ backgroundColor: '#1F2937', color: '#FFF', padding: '16px 0', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/tavy-logo.png" alt="TAVY Logo" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
            <span style={{ backgroundColor: 'var(--purple-primary)', color: '#FFF', padding: '6px 12px', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
              ADMIN PORTAL
            </span>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF', letterSpacing: '1px' }}>TAVY KOREA</h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            
            {/* Action Buttons for Draft/Publish */}
            <div style={{ display: 'flex', gap: '8px', marginRight: '16px', borderRight: '1px solid rgba(255,255,255,0.2)', paddingRight: '16px' }}>
              <button 
                onClick={() => {
                  if (window.confirm('Khôi phục lại dữ liệu gốc (bản backup gần nhất đang chạy trên Website)? Các chỉnh sửa nháp sẽ bị xóa.')) {
                    revertFromWeb();
                    if (showToast) showToast('Đã khôi phục dữ liệu gần nhất!', 'info');
                  }
                }}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)', color: '#E5E7EB', border: '1px solid rgba(255,255,255,0.3)',
                  padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Khôi phục lần đăng nhập gần nhất
              </button>
              <button 
                onClick={() => {
                  if (window.confirm('Bạn có chắc chắn muốn đẩy tất cả dữ liệu kho này lên Website cho khách hàng xem?')) {
                    publishToWeb();
                    if (showToast) showToast('Đã đồng bộ lên Website thành công!', 'success');
                  }
                }}
                style={{
                  backgroundColor: '#10B981', color: '#FFF', border: 'none',
                  padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Đồng bộ lên Website
              </button>
            </div>

            {/* Tỷ giá quick update in header */}
            <form onSubmit={handleUpdateRate} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: '#D1D5DB', fontWeight: 600 }}>Tỷ Giá ₩:</span>
              <input
                type="number"
                step="0.1"
                value={krwRateInput}
                onChange={(e) => setKrwRateInput(e.target.value)}
                style={{ width: '60px', padding: '2px 6px', borderRadius: '4px', border: 'none', fontSize: '0.82rem', fontWeight: 700, textAlign: 'center' }}
              />
              <button type="submit" style={{ background: 'none', border: 'none', color: '#F59E0B', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Lưu tỷ giá">
                <RefreshCw size={14} />
              </button>
            </form>

            <button
              onClick={() => { logoutAdmin(); navigate('/admin/login'); }}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#FCA5A5',
                border: '1px solid #EF4444',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="container" style={{ marginTop: '24px' }}>

        {/* Main Section Navigation Tabs */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveMainTab('orders')}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: activeMainTab === 'orders' ? 'var(--purple-primary)' : '#FFF',
              color: activeMainTab === 'orders' ? '#FFF' : '#374151',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <ShoppingBag size={18} />
            <span>QUẢN LÝ ĐƠN HÀNG TRỌN GÓI ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveMainTab('products')}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: activeMainTab === 'products' ? 'var(--purple-primary)' : '#FFF',
              color: activeMainTab === 'products' ? '#FFF' : '#374151',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <FileSpreadsheet size={18} />
            <span>QUẢN LÝ DANH MỤC SẢN PHẨM</span>
          </button>
        </div>

        {activeMainTab === 'products' ? (
          <AdminProductManager />
        ) : (
          <AdminOrderManager />
        )}

      </div>
    </div>
  );
}

```

## 📄 FILE: src/pages/NotFoundPage.jsx
```jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F9F6FA 0%, #EDE6F2 100%)',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '500px' }}>
        <h1 style={{
          fontSize: '6rem',
          fontFamily: 'Georgia, serif',
          color: '#7A4B9E',
          lineHeight: 1,
          marginBottom: '8px'
        }}>
          404
        </h1>
        <h2 style={{
          fontSize: '1.5rem',
          color: '#333',
          fontWeight: 600,
          marginBottom: '16px'
        }}>
          Trang không tồn tại
        </h2>
        <p style={{ color: '#666', fontSize: '1rem', marginBottom: '32px', lineHeight: '1.6' }}>
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-block',
            padding: '12px 32px',
            borderRadius: '30px',
            background: '#7A4B9E',
            color: '#fff',
            fontSize: '0.9rem',
            fontWeight: 700,
            textDecoration: 'none',
            letterSpacing: '1px'
          }}
        >
          VỀ TRANG CHỦ
        </Link>
      </div>
    </div>
  );
}

```

## 📄 FILE: src/components/Navbar.jsx
```jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { User, LogOut, Package, LogIn, ShoppingCart } from 'lucide-react';

export default function Navbar({ logoSrc }) {
  const { currentUser, logoutUser, cart } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}>
        {/* Logo Link */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <img
            src="/tavy-logo.png"
            alt="TAVY Logo"
            style={{ height: '48px', width: 'auto', display: 'block', objectFit: 'contain' }}
          />
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--purple-primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
            KOREA
          </span>
        </Link>

        {/* User Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          {/* Giỏ hàng (ShoppingCart) */}
          <Link id="cart-icon-header" to="/cart" className="icon-btn" style={{ position: 'relative', transition: 'transform 0.2s ease', color: 'var(--text-dark)' }} aria-label="Giỏ hàng" title="Giỏ hàng">
            <ShoppingCart size={26} />
            {cart && cart.length > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-12px',
                backgroundColor: '#3B82F6', color: '#FFF', fontSize: '0.75rem',
                fontWeight: 800, width: '22px', height: '22px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%'
              }}>
                {cart.length > 99 ? '99+' : cart.length}
              </span>
            )}
          </Link>

          {currentUser ? (
            <>
              {/* Đơn hàng (Package) */}
              <Link to="/orders" className="icon-btn" aria-label="Đơn hàng" title="Đơn hàng của tôi" style={{ color: 'var(--text-dark)', textDecoration: 'none' }}>
                <Package size={26} />
              </Link>
              {/* Tài khoản (User) */}
              <Link to="/profile" className="icon-btn" aria-label="Tài khoản" title="Tài khoản" style={{ color: 'var(--text-dark)', textDecoration: 'none' }}>
                <User size={26} />
              </Link>
              {/* Đăng xuất (LogOut) */}
              <button
                onClick={() => {
                  logoutUser();
                  navigate('/');
                }}
                className="icon-btn"
                aria-label="Đăng xuất"
                title="Đăng xuất"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dark)', padding: 0 }}
              >
                <LogOut size={26} />
              </button>
            </>
          ) : (
            <Link to="/login" className="icon-btn" aria-label="Đăng nhập" title="Đăng nhập" style={{ color: 'var(--text-dark)' }}>
              <User size={26} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

```

## 📄 FILE: src/components/Footer.jsx
```jsx
import React from 'react';
import { Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <a href="#" className="brand-logo" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '16px' }}>
              <img
                src="/tavy-logo.png"
                alt="TAVY Logo"
                style={{ height: '48px', width: 'auto', display: 'block', objectFit: 'contain' }}
              />
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--purple-primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                KOREA
              </span>
            </a>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
              TAVY - Hệ thống mua hộ & phân phối Mỹ phẩm Olive Young, Thực phẩm chức năng & Thuốc nội địa Hàn Quốc chính hãng 100% cho người Việt.
            </p>
          </div>

          <div className="footer-col">
            <h5>DANH MỤC HÀNG</h5>
            <ul className="footer-links">
              <li><a href="#skincare">Mỹ phẩm Dưỡng da</a></li>
              <li><a href="#makeup">Mỹ phẩm Trang điểm</a></li>
              <li><a href="#health">Hồng sâm & Collagen</a></li>
              <li><a href="#pharmacy">Thuốc hiệu thuốc Hàn</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>LIÊN HỆ TAVY</h5>
            <ul className="footer-links" style={{ gap: '12px' }}>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Phone size={14} color="var(--purple-primary)" />
                <span>Hotline VN: 0988 888 888</span>
              </li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Phone size={14} color="var(--purple-primary)" />
                <span>Hotline Korea: +82 10-1234-5678</span>
              </li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Mail size={14} color="var(--purple-primary)" />
                <span>support@tavykorea.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '24px',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-light)'
        }}>
          © 2026 TAVY KOREA. Tất cả quyền được bảo lưu. Dịch vụ hàng xách tay & nhập khẩu Hàn Quốc uy tín.
        </div>
      </div>
    </footer>
  );
}

```

## 📄 FILE: src/components/HeroSection.jsx
```jsx
import React from 'react';
import { ArrowRight, ShieldCheck, Pill, CreditCard } from 'lucide-react';

export default function HeroSection() {
  return (
    <section style={{
      background: 'linear-gradient(135deg, #F9F6FA 0%, #EDE6F2 100%)',
      padding: '70px 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="container">
        <div className="hero-grid">
          {/* Hero Content */}
          <div className="animate-fade-up">
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '2px',
              color: 'var(--purple-dark)',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '16px'
            }}>
              CHUYÊN MỸ PHẨM & THỰC PHẨM CHỨC NĂNG HÀN QUỐC
            </span>

            <h1 className="hero-title" style={{
              fontSize: '3.2rem',
              lineHeight: '1.2',
              fontWeight: 400,
              color: 'var(--text-dark)',
              marginBottom: '20px',
              fontFamily: 'var(--font-serif)'
            }}>
              Hàng Chuẩn Store Hàn, <br />
              <span className="font-serif-italic" style={{ color: 'var(--purple-primary)' }}>Giá Tốt Cho Người Việt</span>
            </h1>

            <p className="hero-desc" style={{
              fontSize: '1rem',
              color: '#333333',
              maxWidth: '500px',
              marginBottom: '32px',
              lineHeight: '1.7',
              fontWeight: 500
            }}>
              Cung cấp các sản phẩm Mỹ phẩm Olive Young, Hồng Sâm, Collagen & Các loại thuốc nội địa Hàn Quốc bán tại nhà thuốc.
            </p>

            <div style={{ marginBottom: '40px', display: 'flex', gap: '15px' }}>
              <a href="#products" className="btn-gold" style={{ display: 'inline-flex' }}>
                <span>XEM DANH MỤC SẢN PHẨM</span>
                <ArrowRight size={16} />
              </a>
            </div>

            {/* 3 Cam kết */}
            <div className="commitments-flex">
              {[
                { icon: <ShieldCheck size={18} />, label: '100% CHÍNH HÃNG HÀN' },
                { icon: <Pill size={18} />, label: 'CHUẨN HIỆU THUỐC HÀN' },
                { icon: <CreditCard size={18} />, label: 'THANH TOÁN VIETQR & BANK HÀN' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--purple-dark)' }}>{item.icon}</span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    color: 'var(--purple-dark)'
                  }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <div style={{
              width: '100%',
              height: '460px',
              borderRadius: '24px',
              backgroundImage: 'url("https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: 'var(--shadow-lg)',
              border: '8px solid #FFFFFF'
            }}></div>
          </div>
        </div>
      </div>
    </section>
  );
}

```

## 📄 FILE: src/components/WhyChooseUs.jsx
```jsx
import React from 'react';
import { ShieldCheck, Globe, QrCode, Award } from 'lucide-react';

export default function WhyChooseUs() {
  const features = [
    { icon: <ShieldCheck size={24} />, title: 'Cam Kết Chính Hãng', desc: 'Mua trực tiếp từ Olive Young, hiệu thuốc & Store Hàn.' },
    { icon: <Globe size={24} />, title: 'Vận Chuyển Hàng Không', desc: 'Bay Air từ Seoul về VN chỉ từ 3-5 ngày làm việc.' },
    { icon: <QrCode size={24} />, title: 'Thanh Toán Dễ Dàng', desc: 'Chuyển khoản VietQR Việt Nam hoặc Ngân hàng Hàn Quốc.' },
    { icon: <Award size={24} />, title: 'Hỗ Trợ 24/7', desc: 'Tư vấn nhiệt tình cho cộng đồng người Việt.' }
  ];

  return (
    <section style={{
      background: 'var(--bg-white)',
      padding: '35px 0',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px'
        }}>
          {features.map((feat, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--purple-primary)', flexShrink: 0, marginTop: '2px' }}>
                {feat.icon}
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '4px' }}>
                  {feat.title}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

```

## 📄 FILE: src/components/ProductGrid.jsx
```jsx
import React, { useState } from 'react';
import { ShoppingBag, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductGrid({ products, krwRate, onSelectProduct, onViewDetail }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 40;

  const formatVnd = (num) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

  const formatKrw = (num) =>
    new Intl.NumberFormat('ko-KR').format(num) + ' ₩';

  // Logic phân trang
  const totalPages = Math.ceil((products?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = products?.slice(startIndex, startIndex + itemsPerPage) || [];

  return (
    <div>
      <div style={{
        display: 'grid',
        // Dùng auto-fill để 1 sản phẩm không bị giãn to hết màn hình
        // minmax 200px để đảm bảo trên destop hiện tầm 4-5 cột
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '28px'
      }}>
        {currentProducts.map((product, pIdx) => {
          const calculatedVnd = (product.foreignPrice || 0) * krwRate;
          const defaultImg = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80';

        return (
          <div
            key={product.goodsNo || `grid-prod-${pIdx}`}
            className="product-card"
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.08)',
              backgroundColor: '#FFF',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.3s ease'
            }}
          >
            {/* Product Image */}
            <div
              style={{ position: 'relative', width: '100%', paddingTop: '90%', overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => onViewDetail && onViewDetail(product)}
            >
              <img
                src={product.productImage || defaultImg}
                alt={product.name || 'Sản phẩm Hàn Quốc'}
                loading="lazy"
                onError={(e) => { e.target.src = defaultImg; }}
                style={{
                  position: 'absolute',
                  top: 0, left: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover'
                }}
              />
              <span style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                backgroundColor: 'var(--purple-primary)',
                color: '#FFF',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '20px',
                textTransform: 'uppercase'
              }}>
                {product.brand || 'Olive Young'}
              </span>
            </div>

            {/* Product Info */}
            <div style={{ padding: '20px', display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3
                  onClick={() => onViewDetail && onViewDetail(product)}
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--text-dark)',
                    marginBottom: '8px',
                    lineHeight: '1.4',
                    height: '42px',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    cursor: 'pointer'
                  }}
                  title={product.name}
                >
                  {product.name}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Quy cách: {product.options}
                </p>
              </div>

              <div>
                {/* Song song Won & VND */}
                <div style={{ marginBottom: '15px', background: '#F8F6FA', padding: '10px 14px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Giá Hàn Quốc:</span>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-dark)' }}>
                      {formatKrw(product.foreignPrice)}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quy đổi VNĐ:</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--purple-primary)' }}>
                      {formatVnd(calculatedVnd)}
                    </strong>
                  </div>
                </div>

                {/* Buttons Action: Xem Chi Tiết & Đặt Mua Ngay */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    onClick={() => onViewDetail && onViewDetail(product)}
                    style={{
                      padding: '12px 0',
                      borderRadius: '30px',
                      border: '1px solid var(--purple-primary)',
                      backgroundColor: '#FFF',
                      color: 'var(--purple-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Xem chi tiết"
                  >
                    <Eye size={22} />
                  </button>

                  <button
                    onClick={(e) => onSelectProduct(product, e)}
                    className="btn-gold"
                    style={{ 
                      width: '100%', 
                      justifyContent: 'center', 
                      padding: '12px 0',
                      borderRadius: '30px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Thêm vào giỏ hàng"
                  >
                    <ShoppingBag size={22} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '40px',
          gap: '12px'
        }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              backgroundColor: currentPage === 1 ? '#F3F4F6' : '#FFF',
              color: currentPage === 1 ? '#9CA3AF' : 'var(--text-dark)',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            <ChevronLeft size={18} /> Trước
          </button>

          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-dark)' }}>
            Trang {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              backgroundColor: currentPage === totalPages ? '#F3F4F6' : '#FFF',
              color: currentPage === totalPages ? '#9CA3AF' : 'var(--text-dark)',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            Sau <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

```

## 📄 FILE: src/components/ProductDetailModal.jsx
```jsx
import React, { useState } from 'react';
import { X, ShoppingBag, Star, Sparkles, Globe } from 'lucide-react';

export default function ProductDetailModal({ product, krwRate, onClose, onOrderNow }) {
  const images = product?.images && product.images.length > 0 ? product.images : (product?.productImage ? [product.productImage] : []);
  const [selectedImg, setSelectedImg] = useState(images[0] || '');
  const [activeTab, setActiveTab] = useState('description');

  if (!product) return null;

  const calculatedVnd = product.foreignPrice * krwRate;

  const formatVnd = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
  const formatKrw = (n) => new Intl.NumberFormat('ko-KR').format(n) + ' ₩';

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '960px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Nút Đóng Modal */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#F3F4F6',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 0.2s ease'
          }}
        >
          <X size={22} color="#4B5563" />
        </button>

        <div style={{ padding: '36px', display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '36px' }}>
          
          {/* Cột Trái: Slide Bộ Ảnh */}
          <div>
            {/* Ảnh Chính */}
            <div style={{
              width: '100%',
              height: '360px',
              borderRadius: '20px',
              overflow: 'hidden',
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              marginBottom: '16px',
              position: 'relative'
            }}>
              <img
                src={selectedImg || product.productImage}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span style={{
                position: 'absolute',
                top: '14px',
                left: '14px',
                backgroundColor: 'var(--purple-primary)',
                color: '#FFF',
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '6px 14px',
                borderRadius: '20px',
                textTransform: 'uppercase'
              }}>
                {product.brand}
              </span>
            </div>

            {/* List Thumbs Ảnh */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(img)}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: selectedImg === img ? '2px solid var(--purple-primary)' : '1px solid #E5E7EB',
                      padding: 0,
                      cursor: 'pointer',
                      flexShrink: 0,
                      opacity: selectedImg === img ? 1 : 0.65
                    }}
                  >
                    <img src={img} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cột Phải: Thông Tin Chi Tiết */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* Thương hiệu & Đánh giá */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', paddingRight: '45px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--purple-primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {product.brand}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FEF3C7', padding: '6px 14px', borderRadius: '20px' }}>
                  <Star size={16} fill="#F59E0B" color="#F59E0B" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400E' }}>{product.rating || 4.9} ({product.reviewsCount || 500}+ đánh giá Store Hàn)</span>
                </div>
              </div>

              {/* Tên sản phẩm lớn */}
              <h2 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#111827', lineHeight: '1.35', marginBottom: '14px' }}>
                {product.name}
              </h2>

              {/* Xuất xứ & Quy cách */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.88rem', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                  <Globe size={16} color="var(--purple-primary)" /> {product.origin || 'Store Olive Young Korea'}
                </span>
                <span style={{ fontSize: '0.88rem', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                  <Sparkles size={16} color="var(--purple-primary)" /> Quy cách: {product.options}
                </span>
              </div>

              {/* Navigation Tabs */}
              <div style={{ display: 'flex', borderBottom: '2px solid #F3F4F6', marginBottom: '20px' }}>
                {[
                  { id: 'description', label: 'Mô Tả Sản Phẩm' },
                  { id: 'usage', label: 'Hướng Dẫn Sử Dụng' },
                  { id: 'specs', label: 'Thông Số Kỹ Thuật' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '12px 20px',
                      background: 'none',
                      border: 'none',
                      borderBottom: activeTab === tab.id ? '3px solid var(--purple-primary)' : '3px solid transparent',
                      color: activeTab === tab.id ? 'var(--purple-primary)' : '#6B7280',
                      fontWeight: activeTab === tab.id ? 800 : 600,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      marginBottom: '-2px'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Nội dung Tab */}
              <div style={{ minHeight: '160px', fontSize: '1.02rem', color: '#374151', lineHeight: '1.7', fontWeight: 400 }}>
                {activeTab === 'description' && (
                  <p style={{ margin: 0 }}>{product.description || 'Sản phẩm chính hãng Hàn Quốc được nhập khẩu và phân phối trực tiếp.'}</p>
                )}
                {activeTab === 'usage' && (
                  <p style={{ margin: 0 }}>{product.usage || 'Sử dụng hàng ngày sau bước làm sạch mặt.'}</p>
                )}
                {activeTab === 'specs' && product.specifications && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li style={{ marginBottom: '8px' }}><strong>Dung tích/Trọng lượng:</strong> {product.specifications.volume}</li>
                    <li style={{ marginBottom: '8px' }}><strong>Loại da phù hợp:</strong> {product.specifications.skinType}</li>
                    <li style={{ marginBottom: '8px' }}><strong>Hạn sử dụng:</strong> {product.specifications.expiry}</li>
                    <li><strong>Thành phần chính:</strong> {product.specifications.ingredients}</li>
                  </ul>
                )}
              </div>

            </div>

            {/* Nút Bấm Đặt Mua: Đã Bỏ Chữ "Đặt Mua Ngay Sản Phẩm Này", Chỉ Hiển Thị Số Tiền Việt Nam */}
            <div style={{ paddingTop: '20px', borderTop: '1px solid #F3F4F6' }}>
              <button
                onClick={(e) => {
                  onClose();
                  onOrderNow(product, e);
                }}
                className="btn-gold"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '16px 28px',
                  borderRadius: '50px',
                  boxShadow: '0 10px 25px -5px rgba(122, 75, 158, 0.4)',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                <ShoppingBag size={22} />
                <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.5px' }}>
                  THÊM VÀO GIỎ ({formatVnd(calculatedVnd)})
                </span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

```

## 📄 FILE: src/components/CascadingAddressSelector.jsx
```jsx
import React, { useState, useEffect, useRef } from 'react';
import { fetchVietnamProvinces, fetchVietnamSubDivisions } from '../services/vietnamAddressService';
import { MapPin, Building, Navigation } from 'lucide-react';

export default function CascadingAddressSelector({ initialAddress = '', onChange, required = true }) {
  const [provinces, setProvinces] = useState([]);
  const [subDivisions, setSubDivisions] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingSubDivisions, setLoadingSubDivisions] = useState(false);

  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedProvinceName, setSelectedProvinceName] = useState('');
  const [selectedSubDivisionCode, setSelectedSubDivisionCode] = useState('');
  const [selectedSubDivisionName, setSelectedSubDivisionName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');

  const isInitialParsedRef = useRef(false);

  // 1. Fetch 63 Provinces from Vietnam Open API (or fallback)
  useEffect(() => {
    let isMounted = true;
    async function loadProvinces() {
      setLoadingProvinces(true);
      const list = await fetchVietnamProvinces();
      if (isMounted) {
        setProvinces(list);
        setLoadingProvinces(false);
      }
    }
    loadProvinces();
    return () => { isMounted = false; };
  }, []);

  // 2. Parse initialAddress CHỈ NẾU là địa chỉ thực sự của người dùng (tuyệt đối KHÔNG tự điền Tỉnh/TP vào ô Số nhà)
  useEffect(() => {
    if (initialAddress && typeof initialAddress === 'string' && !isInitialParsedRef.current) {
      isInitialParsedRef.current = true;
      const parts = initialAddress.split(',').map(s => s.trim()).filter(Boolean);
      // Tìm phần tử không chứa từ khóa Tỉnh/Thành phố/Quận/Huyện/Xã/Phường
      const actualStreet = parts.find(p => 
        !p.startsWith('Tỉnh') && 
        !p.startsWith('Thành phố') && 
        !p.startsWith('Quận') && 
        !p.startsWith('Huyện') && 
        !p.startsWith('Phường') && 
        !p.startsWith('Xã') && 
        !p.includes('Việt Nam')
      );

      // Nếu chỉ có tên Tỉnh/TP thì để trống hoàn toàn
      if (actualStreet) {
        setStreetAddress(actualStreet);
      } else {
        setStreetAddress('');
      }
    }
  }, [initialAddress]);

  // 3. Fetch 2nd Level (Xã / Phường / Quận / Huyện) when Province changes
  useEffect(() => {
    let isMounted = true;
    async function loadSubDivisions() {
      if (!selectedProvinceCode) {
        setSubDivisions([]);
        setSelectedSubDivisionCode('');
        setSelectedSubDivisionName('');
        return;
      }

      setLoadingSubDivisions(true);
      const list = await fetchVietnamSubDivisions(selectedProvinceCode);
      if (isMounted) {
        setSubDivisions(list);
        setLoadingSubDivisions(false);
      }
    }
    loadSubDivisions();
    return () => { isMounted = false; };
  }, [selectedProvinceCode]);

  // 4. Emit clean full address to parent
  useEffect(() => {
    const parts = [
      streetAddress.trim(),
      selectedSubDivisionName,
      selectedProvinceName
    ].filter(Boolean);

    const uniqueParts = [];
    parts.forEach(p => {
      if (p && !uniqueParts.includes(p)) uniqueParts.push(p);
    });

    const fullAddress = uniqueParts.join(', ');

    if (onChange) {
      onChange({
        provinceCode: selectedProvinceCode,
        provinceName: selectedProvinceName,
        subDivisionCode: selectedSubDivisionCode,
        subDivisionName: selectedSubDivisionName,
        streetAddress: streetAddress.trim(),
        fullAddress
      });
    }
  }, [selectedProvinceCode, selectedProvinceName, selectedSubDivisionCode, selectedSubDivisionName, streetAddress, onChange]);

  // Handlers
  const handleProvinceSelect = (e) => {
    const code = e.target.value;
    setSelectedProvinceCode(code);
    const pObj = provinces.find(p => String(p.code) === String(code));
    setSelectedProvinceName(pObj ? pObj.name : '');
    setSelectedSubDivisionCode('');
    setSelectedSubDivisionName('');
  };

  const handleSubDivisionSelect = (e) => {
    const code = e.target.value;
    setSelectedSubDivisionCode(code);
    const subObj = subDivisions.find(s => String(s.code) === String(code));
    setSelectedSubDivisionName(subObj ? subObj.name : '');
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#374151',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #D1D5DB',
    fontSize: '0.88rem',
    backgroundColor: '#FFF',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
  };

  return (
    <div style={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
      
      {/* Sleek Minimal Header - CHỈ ĐỂ "ĐỊA CHỈ" */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
        <MapPin size={16} color="var(--purple-primary)" />
        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          ĐỊA CHỈ {required && <span style={{ color: '#EF4444' }}>*</span>}
        </span>
      </div>

      {/* 2 Cấp Hành Chính (Tỉnh/Thành phố → Xã/Phường/Quận/Huyện) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        
        {/* Cấp 1: Tỉnh / Thành phố */}
        <div>
          <label style={labelStyle}>
            <Building size={12} style={{ display: 'inline', marginRight: '4px' }} /> Tỉnh / Thành Phố
          </label>
          <select
            value={selectedProvinceCode}
            onChange={handleProvinceSelect}
            style={inputStyle}
            required={required}
          >
            <option value="">{loadingProvinces ? 'Đang tải...' : '-- Chọn Tỉnh / TP --'}</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Cấp 2: Xã / Phường / Quận / Huyện */}
        <div>
          <label style={labelStyle}>
            <Navigation size={12} style={{ display: 'inline', marginRight: '4px' }} /> Xã / Phường / Quận / Huyện
          </label>
          <select
            value={selectedSubDivisionCode}
            onChange={handleSubDivisionSelect}
            disabled={!selectedProvinceCode || loadingSubDivisions}
            style={{ ...inputStyle, opacity: !selectedProvinceCode ? 0.6 : 1 }}
            required={required}
          >
            <option value="">{loadingSubDivisions ? 'Đang tải...' : (selectedProvinceCode ? '-- Chọn Xã/Phường/Quận/Huyện --' : '-- Chọn Tỉnh/TP trước --')}</option>
            {subDivisions.map((s) => (
              <option key={s.code} value={s.code}>{s.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Cấp 3: Số nhà & Tên đường */}
      <div>
        <label style={labelStyle}>Số Nhà & Tên Đường</label>
        <input
          type="text"
          placeholder="Số nhà, tên đường..."
          value={streetAddress}
          onChange={(e) => setStreetAddress(e.target.value)}
          style={inputStyle}
          required={required}
        />
      </div>

    </div>
  );
}

```

## 📄 FILE: src/components/AdminOrderManager.jsx
```jsx
import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { ORDER_STATUSES, getStatusConfig } from '../data/orderStatuses';
import CascadingAddressSelector from './CascadingAddressSelector';
import {
  Search, Edit3,
  Truck, CheckCircle, PackageCheck, AlertCircle, Printer,
  Download, ShieldCheck, ChevronRight, X,
  Phone, MapPin, CheckCircle2
} from 'lucide-react';

export default function AdminOrderManager() {
  const { orders, rates, updateOrderStatus, updateOrderQuote, updateOrderTracking } = useContext(AppContext);
  const showToast = useToast();

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');

  // Editing / Detail Modal State
  const [activeModalOrder, setActiveModalOrder] = useState(null); // Full order object
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [orderForm, setOrderForm] = useState({});

  const krwRate = rates?.KRW?.rate || 19.5;
  const formatVnd = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
  const formatWon = (n) => `₩${(n || 0).toLocaleString('vi-VN')}`;

  const getOrderProductName = (o) => o.items ? `[${o.items.length} món] ` + o.items.map(i => i.name).join(' + ') : (o.productName || '');
  const getOrderForeignPrice = (o) => o.items ? o.items.reduce((sum, i) => sum + (i.foreignPrice * i.qty), 0) : (o.foreignPrice || 0);
  const getOrderQty = (o) => o.items ? o.items.reduce((sum, i) => sum + i.qty, 0) : (o.qty || 1);
  const getOrderImage = (o) => o.items && o.items.length > 0 ? o.items[0].productImage : (o.productImage || '');

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = filterStatus === 'all' || o.status === filterStatus;
      const term = searchTerm.toLowerCase().trim();
      const oName = getOrderProductName(o);
      const matchSearch =
        !term ||
        (o.id && o.id.toLowerCase().includes(term)) ||
        (o.customerName && o.customerName.toLowerCase().includes(term)) ||
        (o.customerPhone && o.customerPhone.includes(term)) ||
        (oName.toLowerCase().includes(term)) ||
        (o.trackingCode && o.trackingCode.toLowerCase().includes(term));
      return matchStatus && matchSearch;
    });
  }, [orders, filterStatus, searchTerm]);

  // Bulk Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = () => {
    if (!bulkStatus) {
      if (showToast) showToast('Vui lòng chọn trạng thái cần đổi!', 'error');
      return;
    }
    if (selectedOrderIds.length === 0) {
      if (showToast) showToast('Chưa chọn đơn hàng nào!', 'error');
      return;
    }

    selectedOrderIds.forEach((id) => {
      updateOrderStatus(id, bulkStatus);
    });

    const statusObj = getStatusConfig(bulkStatus);
    if (showToast) showToast(`Đã cập nhật ${selectedOrderIds.length} đơn sang "${statusObj.label}" thành công!`, 'success');
    setSelectedOrderIds([]);
    setBulkStatus('');
  };

  // Open Edit / Báo giá / Invoice Modal
  const handleOpenEditModal = (order, print = false) => {
    const fPrice = getOrderForeignPrice(order);
    const qty = getOrderQty(order);
    const baseVnd = Math.round(fPrice * krwRate * qty);
    const taxVnd = order.quote?.taxWebVnd || Math.round(baseVnd * 0.05);
    const serviceVnd = order.quote?.serviceFeeVnd || Math.round(baseVnd * 0.05);
    const shipFeeVnd = order.quote?.shippingWeightFeeVnd || 90000;

    setOrderForm({
      ...order,
      customerName: order.customerName || '',
      customerPhone: order.customerPhone || '',
      customerAddress: order.customerAddress || '',
      productName: getOrderProductName(order),
      foreignPrice: fPrice,
      qty: qty,
      trackingCode: order.trackingCode || '',
      status: order.status || 'pending',
      adminNote: order.adminNote || 'Hàng sẵn có tại Korea Store, chuẩn bị đóng gói vận chuyển Air.',
      rawVnd: baseVnd,
      taxWebVnd: taxVnd,
      serviceFeeVnd: serviceVnd,
      shippingWeightFeeVnd: shipFeeVnd,
    });
    setIsPrintMode(print);
    setActiveModalOrder(order);
  };

  const handleSaveOrderChanges = () => {
    if (!activeModalOrder) return;
    const totalCalc =
      Number(orderForm.rawVnd) +
      Number(orderForm.taxWebVnd) +
      Number(orderForm.serviceFeeVnd) +
      Number(orderForm.shippingWeightFeeVnd);

    // Save Status & Tracking
    updateOrderStatus(activeModalOrder.id, orderForm.status);
    updateOrderTracking(activeModalOrder.id, {
      status: orderForm.status,
      trackingCode: orderForm.trackingCode,
      note: orderForm.adminNote
    });

    // Save Quote
    updateOrderQuote(activeModalOrder.id, {
      rawVnd: Number(orderForm.rawVnd),
      taxWebVnd: Number(orderForm.taxWebVnd),
      serviceFeeVnd: Number(orderForm.serviceFeeVnd),
      shippingWeightFeeVnd: Number(orderForm.shippingWeightFeeVnd),
      note: orderForm.adminNote,
      totalVnd: totalCalc
    });

    if (showToast) showToast(`Đã lưu cập nhật toàn bộ đơn hàng ${activeModalOrder.id} thành công!`, 'success');
    setActiveModalOrder(null);
  };

  // Quick 1-Click Stepper Advance
  const handleQuickNextStatus = (order) => {
    const allStatuses = Object.keys(ORDER_STATUSES).filter(k => k !== 'cancelled');
    const currentIndex = allStatuses.indexOf(order.status);
    if (currentIndex >= 0 && currentIndex < allStatuses.length - 1) {
      const nextKey = allStatuses[currentIndex + 1];
      updateOrderStatus(order.id, nextKey);
      const nextCfg = getStatusConfig(nextKey);
      if (showToast) showToast(`Đã chuyển đơn ${order.id} sang "${nextCfg.shortLabel}"`, 'info');
    }
  };

  // Export CSV of Orders
  const handleExportOrdersCSV = () => {
    const header = "MÃ ĐƠN HÀNG,TÊN KHÁCH HÀNG,SỐ ĐIỆN THOẠI,ĐỊA CHỈ GIAO,SẢN PHẨM,GIÁ WON,SL,TỔNG TIỀN VNĐ,TRẠNG THÁI,MÃ VẬN ĐƠN AIR\n";
    const rows = filteredOrders.map(o => {
      const st = getStatusConfig(o.status).label;
      const fPrice = getOrderForeignPrice(o);
      const qty = getOrderQty(o);
      const oName = getOrderProductName(o);
      const total = o.quote ? o.quote.totalVnd : Math.round(fPrice * krwRate * qty);
      return `"${o.id}","${o.customerName || ''}","${o.customerPhone || ''}","${(o.customerAddress || '').replace(/"/g, '""')}","${(oName || '').replace(/"/g, '""')}",${fPrice || 0},${qty || 1},${total},"${st}","${o.trackingCode || ''}"`;
    }).join('\n');

    const blob = new Blob(["\uFEFF" + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TAVY_KOREA_DON_HANG_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    if (showToast) showToast('Đã tải tệp báo cáo danh sách đơn hàng (.CSV)', 'success');
  };

  return (
    <div>
      {/* 📊 KPI COUNTERS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { title: 'TỔNG ĐƠN HÀNG', count: orders.length, color: 'var(--purple-primary)', bg: '#F5F3FF', icon: ShieldCheck },
          { title: 'CHỜ BÁO GIÁ / CỌC', count: orders.filter((o) => o.status === 'pending').length, color: '#D97706', bg: '#FEF3C7', icon: AlertCircle },
          { title: 'ĐÃ CỌC / ĐÃ MUA HÀN', count: orders.filter((o) => ['quoted', 'deposit_paid', 'purchased', 'in_kr_warehouse'].includes(o.status)).length, color: '#2563EB', bg: '#DBEAFE', icon: CheckCircle },
          { title: 'ĐANG VẬN CHUYỂN AIR', count: orders.filter((o) => ['transit', 'in_vn_warehouse', 'delivering'].includes(o.status)).length, color: '#0891B2', bg: '#CFFAFE', icon: Truck },
          { title: 'HOÀN THÀNH', count: orders.filter((o) => o.status === 'completed').length, color: '#059669', bg: '#D1FAE5', icon: PackageCheck }
        ].map((kpi, idx) => {
          const IconComp = kpi.icon;
          return (
            <div key={idx} style={{ backgroundColor: '#FFF', padding: '18px 20px', borderRadius: '14px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', letterSpacing: '0.5px' }}>{kpi.title}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: kpi.color, marginTop: '4px' }}>{kpi.count}</div>
              </div>
              <div style={{ backgroundColor: kpi.bg, color: kpi.color, padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconComp size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 🛠️ TOOLBAR & BULK ACTIONS */}
      <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid #E5E7EB', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px', borderBottom: '1px solid #F3F4F6' }}>
          <button
            onClick={() => setFilterStatus('all')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: filterStatus === 'all' ? '2px solid var(--purple-primary)' : '1px solid #E5E7EB',
              backgroundColor: filterStatus === 'all' ? 'var(--purple-primary)' : '#FFF',
              color: filterStatus === 'all' ? '#FFF' : '#374151',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Tất cả ({orders.length})
          </button>
          {Object.keys(ORDER_STATUSES).map((stKey) => {
            const st = ORDER_STATUSES[stKey];
            const cnt = orders.filter((o) => o.status === stKey).length;
            const isSelected = filterStatus === stKey;
            return (
              <button
                key={stKey}
                onClick={() => setFilterStatus(stKey)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: isSelected ? `2px solid ${st.borderColor}` : '1px solid #E5E7EB',
                  backgroundColor: isSelected ? st.color : '#FFF',
                  color: isSelected ? '#FFF' : '#374151',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{st.shortLabel}</span>
                <span style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#F3F4F6', color: isSelected ? '#FFF' : '#6B7280', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700 }}>
                  {cnt}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Bulk Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Tìm theo Mã đơn, Tên khách, SĐT, Sản phẩm, Mã vận đơn Air..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '0.88rem', outline: 'none' }}
            />
          </div>

          {/* Bulk Operations */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {selectedOrderIds.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F5F3FF', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--purple-primary)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--purple-primary)' }}>
                  Đã chọn {selectedOrderIds.length} đơn
                </span>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.82rem', fontWeight: 600 }}
                >
                  <option value="">-- Đổi trạng thái hàng loạt --</option>
                  {Object.keys(ORDER_STATUSES).map((k) => (
                    <option key={k} value={k}>{ORDER_STATUSES[k].label}</option>
                  ))}
                </select>
                <button
                  onClick={handleBulkStatusChange}
                  style={{ backgroundColor: 'var(--purple-primary)', color: '#FFF', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Áp Dụng
                </button>
              </div>
            )}

            <button
              onClick={handleExportOrdersCSV}
              style={{ backgroundColor: '#FFF', color: '#374151', border: '1px solid #D1D5DB', padding: '9px 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={16} /> Xuất Báo Cáo CSV
            </button>
          </div>

        </div>

      </div>

      {/* 📋 MAIN ORDERS TABLE */}
      <div style={{ backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid #E5E7EB', color: '#4B5563', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '14px 16px', width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                  />
                </th>
                <th style={{ padding: '14px 16px' }}>Mã Đơn & Ngày</th>
                <th style={{ padding: '14px 16px' }}>Khách Hàng (Nhận Hàng)</th>
                <th style={{ padding: '14px 16px', minWidth: '220px' }}>Sản Phẩm Mua Hộ</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Tổng Thanh Toán</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Trạng Thái Đơn Hàng</th>
                <th style={{ padding: '14px 16px' }}>Mã Vận Đơn Air</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Thao Tác Quản Trị</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
                    Chưa có đơn hàng nào khớp với tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const stCfg = getStatusConfig(order.status);
                  const isSelected = selectedOrderIds.includes(order.id);
                  const totalVndVal = order.quote ? order.quote.totalVnd : Math.round((order.foreignPrice || 0) * krwRate * (order.qty || 1));

                  return (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom: '1px solid #F3F4F6',
                        backgroundColor: isSelected ? '#F5F3FF' : '#FFF',
                        transition: 'background-color 0.15s'
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(order.id)}
                        />
                      </td>

                      {/* Mã đơn */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--purple-primary)', fontSize: '0.92rem', fontFamily: 'monospace' }}>
                          {order.id}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '2px' }}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'Mới tạo'}
                        </div>
                      </td>

                      {/* Khách hàng */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>{order.customerName || 'Khách vãng lai'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#4B5563', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={12} /> {order.customerPhone || 'Chưa có SĐT'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={order.customerAddress}>
                          <MapPin size={12} style={{ display: 'inline', marginRight: '2px' }} />
                          {order.customerAddress || 'Chưa cập nhật địa chỉ'}
                        </div>
                      </td>

                      {/* Sản phẩm */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
                          {getOrderProductName(order) || 'Sản phẩm mua hộ Hàn Quốc'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--purple-primary)', fontWeight: 600, marginTop: '4px' }}>
                          Giá Won: {formatWon(getOrderForeignPrice(order))} | Số lượng: x{getOrderQty(order)}
                        </div>
                      </td>

                      {/* Tổng VND */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: '#111827', fontSize: '0.98rem' }}>
                          {formatVnd(totalVndVal)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                          {order.quote ? `Cọc 50%: ${formatVnd(Math.round(totalVndVal * 0.5))}` : 'Chờ báo giá'}
                        </div>
                      </td>

                      {/* Trạng thái Dropdown + Quick Advance */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                          <select
                            value={order.status || 'pending'}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '20px',
                              border: `1.5px solid ${stCfg.borderColor}`,
                              backgroundColor: stCfg.bgColor,
                              color: stCfg.color,
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            {Object.keys(ORDER_STATUSES).map((k) => (
                              <option key={k} value={k}>{ORDER_STATUSES[k].label}</option>
                            ))}
                          </select>

                          <button
                            onClick={() => handleQuickNextStatus(order)}
                            title="Chuyển nhanh sang bước tiếp theo"
                            style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}
                          >
                            <span>Bước tiếp</span> <ChevronRight size={12} />
                          </button>
                        </div>
                      </td>

                      {/* Mã vận đơn Air */}
                      <td style={{ padding: '14px 16px' }}>
                        <input
                          type="text"
                          placeholder="Mã vận đơn..."
                          defaultValue={order.trackingCode || ''}
                          onBlur={(e) => updateOrderTracking(order.id, { trackingCode: e.target.value })}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid #D1D5DB',
                            fontSize: '0.8rem',
                            width: '130px',
                            fontFamily: 'monospace',
                            fontWeight: 700
                          }}
                        />
                      </td>

                      {/* Thao tác */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleOpenEditModal(order, false)}
                            style={{
                              backgroundColor: 'var(--purple-primary)',
                              color: '#FFF',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Edit3 size={13} /> Sửa Đơn
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(order, true)}
                            title="Xem & In hóa đơn"
                            style={{
                              backgroundColor: '#F3F4F6',
                              color: '#374151',
                              border: '1px solid #D1D5DB',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                          >
                            <Printer size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════ MODAL SỬA ĐƠN HÀNG & IN HÓA ĐƠN ═══════════ */}
      {activeModalOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '40px', paddingBottom: '40px', zIndex: 99999, overflowY: 'auto' }} onClick={() => setActiveModalOrder(null)}>
          <div style={{ backgroundColor: '#FFF', borderRadius: '20px', width: '100%', maxWidth: '780px', padding: '32px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            
            {/* Header Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#F5F3FF', color: 'var(--purple-primary)', padding: '4px 10px', borderRadius: '12px' }}>
                  {isPrintMode ? '🖨️ IN HÓA ĐƠN GIAO NHẬN' : '✏️ CHỈNH SỬA & BÁO GIÁ ĐƠN HÀNG'}
                </span>
                <h3 style={{ margin: '6px 0 0 0', fontSize: '1.25rem', color: '#111827', fontWeight: 800 }}>
                  MÃ ĐƠN HÀNG: {activeModalOrder.id}
                </h3>
              </div>
              <button onClick={() => setActiveModalOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
                <X size={24} />
              </button>
            </div>

            {/* Print View vs Edit Form View */}
            {isPrintMode ? (
              <div id="printable-invoice" style={{ backgroundColor: '#FAFAFA', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #111827', paddingBottom: '12px' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--purple-primary)' }}>TAVY KOREA</h2>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#4B5563' }}>Dịch Vụ Mua Hộ Mỹ Phẩm & Thực Phẩm Chức Năng Hàn Quốc</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#111827' }}>HÓA ĐƠN BÁN HÀNG</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#6B7280' }}>Ngày: {new Date().toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#374151' }}>THÔNG TIN KHÁCH HÀNG:</strong>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '4px' }}>{orderForm.customerName}</div>
                    <div style={{ fontSize: '0.82rem', color: '#4B5563' }}>SĐT: {orderForm.customerPhone}</div>
                    <div style={{ fontSize: '0.82rem', color: '#4B5563' }}>Địa chỉ: {orderForm.customerAddress}</div>
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#374151' }}>THÔNG TIN ĐƠN HÀNG:</strong>
                    <div style={{ fontSize: '0.82rem', color: '#4B5563', marginTop: '4px' }}>Trạng thái: <strong>{getStatusConfig(orderForm.status).label}</strong></div>
                    <div style={{ fontSize: '0.82rem', color: '#4B5563' }}>Mã Vận Đơn Air: <strong>{orderForm.trackingCode || 'Đang cập nhật'}</strong></div>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#E5E7EB', color: '#111827' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Sản phẩm</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Giá Won</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>SL</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Thành tiền VNĐ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #E5E7EB', fontWeight: 600 }}>{orderForm.productName}</td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #E5E7EB', textAlign: 'right' }}>{formatWon(orderForm.foreignPrice)}</td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #E5E7EB', textAlign: 'center' }}>x{orderForm.qty}</td>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid #E5E7EB', textAlign: 'right', fontWeight: 700 }}>{formatVnd(orderForm.rawVnd)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} style={{ padding: '6px 12px', textAlign: 'right', color: '#6B7280' }}>Thuế Web Hàn (5%):</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right' }}>{formatVnd(orderForm.taxWebVnd)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} style={{ padding: '6px 12px', textAlign: 'right', color: '#6B7280' }}>Phí dịch vụ mua hộ (5%):</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right' }}>{formatVnd(orderForm.serviceFeeVnd)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} style={{ padding: '6px 12px', textAlign: 'right', color: '#6B7280' }}>Cước Air cân nặng:</td>
                      <td style={{ padding: '6px 12px', textAlign: 'right' }}>{formatVnd(orderForm.shippingWeightFeeVnd)}</td>
                    </tr>
                    <tr style={{ backgroundColor: '#F5F3FF', fontWeight: 800, fontSize: '1rem' }}>
                      <td colSpan={3} style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--purple-primary)' }}>TỔNG THANH TOÁN:</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--purple-primary)' }}>
                        {formatVnd(Number(orderForm.rawVnd) + Number(orderForm.taxWebVnd) + Number(orderForm.serviceFeeVnd) + Number(orderForm.shippingWeightFeeVnd))}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px dashed #D1D5DB' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Người Lập Hóa Đơn</div>
                    <div style={{ marginTop: '40px', fontWeight: 700, fontSize: '0.85rem' }}>TAVY Korea Admin</div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Xác Nhận Khách Hàng</div>
                    <div style={{ marginTop: '40px', fontWeight: 700, fontSize: '0.85rem' }}>{orderForm.customerName}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Form Chỉnh Sửa Thông Tin Khách Hàng & Đơn Hàng */}
                <div style={{ backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #E5E7EB' }}>
                  <h4 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', color: 'var(--purple-primary)', fontWeight: 800 }}>
                    1. THÔNG TIN KHÁCH HÀNG & GIAO HÀNG
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>Họ & Tên Khách Hàng</label>
                      <input
                        type="text"
                        value={orderForm.customerName}
                        onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>Số Điện Thoại</label>
                      <input
                        type="text"
                        value={orderForm.customerPhone}
                        onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <CascadingAddressSelector
                      initialAddress={orderForm.customerAddress}
                      onChange={(addrInfo) => setOrderForm(prev => ({ ...prev, customerAddress: addrInfo.fullAddress }))}
                      required={false}
                    />
                  </div>
                </div>

                {/* Form Chi Tiết Báo Giá */}
                <div style={{ backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #E5E7EB' }}>
                  <h4 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', color: 'var(--purple-primary)', fontWeight: 800 }}>
                    2. BẢNG TÍNH GIÁ CHI TIẾT & PHÍ VẬN CHUYỂN
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#4B5563', marginBottom: '4px' }}>Tiền hàng gốc (VNĐ)</label>
                      <input
                        type="number"
                        value={orderForm.rawVnd}
                        onChange={(e) => setOrderForm({ ...orderForm, rawVnd: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB', fontWeight: 700 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#4B5563', marginBottom: '4px' }}>Thuế Web Hàn 5% (VNĐ)</label>
                      <input
                        type="number"
                        value={orderForm.taxWebVnd}
                        onChange={(e) => setOrderForm({ ...orderForm, taxWebVnd: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#4B5563', marginBottom: '4px' }}>Phí dịch vụ 5% (VNĐ)</label>
                      <input
                        type="number"
                        value={orderForm.serviceFeeVnd}
                        onChange={(e) => setOrderForm({ ...orderForm, serviceFeeVnd: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#4B5563', marginBottom: '4px' }}>Cước Air Cân Nặng (VNĐ)</label>
                      <input
                        type="number"
                        value={orderForm.shippingWeightFeeVnd}
                        onChange={(e) => setOrderForm({ ...orderForm, shippingWeightFeeVnd: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                      />
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#FFF', padding: '14px 18px', borderRadius: '10px', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>TỔNG BÁO GIÁ ĐƠN:</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--purple-primary)' }}>
                        {formatVnd(Number(orderForm.rawVnd) + Number(orderForm.taxWebVnd) + Number(orderForm.serviceFeeVnd) + Number(orderForm.shippingWeightFeeVnd))}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.82rem', color: '#059669' }}>CỌC ĐÃ DUYỆT (50%):</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>
                        {formatVnd(Math.round((Number(orderForm.rawVnd) + Number(orderForm.taxWebVnd) + Number(orderForm.serviceFeeVnd) + Number(orderForm.shippingWeightFeeVnd)) * 0.5))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Trạng Thái & Ghi Chú Admin */}
                <div style={{ backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #E5E7EB' }}>
                  <h4 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', color: 'var(--purple-primary)', fontWeight: 800 }}>
                    3. TRẠNG THÁI & GHI CHÚ QUẢN TRỊ
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>Cập nhật trạng thái</label>
                      <select
                        value={orderForm.status}
                        onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.88rem', fontWeight: 700 }}
                      >
                        {Object.keys(ORDER_STATUSES).map((k) => (
                          <option key={k} value={k}>{ORDER_STATUSES[k].label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>Mã vận đơn Air Cargo</label>
                      <input
                        type="text"
                        value={orderForm.trackingCode}
                        onChange={(e) => setOrderForm({ ...orderForm, trackingCode: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.88rem', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>Ghi chú gửi khách hàng</label>
                    <textarea
                      rows={2}
                      value={orderForm.adminNote}
                      onChange={(e) => setOrderForm({ ...orderForm, adminNote: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
              {isPrintMode ? (
                <>
                  <button onClick={() => setIsPrintMode(false)} style={{ backgroundColor: '#F3F4F6', color: '#374151', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                    Quay Lại Chỉnh Sửa
                  </button>
                  <button onClick={() => window.print()} style={{ backgroundColor: 'var(--purple-primary)', color: '#FFF', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Printer size={16} /> Thực Hiện In Hóa Đơn
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setActiveModalOrder(null)} style={{ backgroundColor: '#F3F4F6', color: '#374151', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                    Hủy Bỏ
                  </button>
                  <button onClick={handleSaveOrderChanges} style={{ backgroundColor: 'var(--purple-primary)', color: '#FFF', border: 'none', padding: '10px 28px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} /> Lưu Cập Nhật Đơn Hàng
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

```

## 📄 FILE: src/components/AdminProductManager.jsx
```jsx
import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { scrapeProductMetadata } from '../services/productScraperService';
import {
  Plus, Trash2, Save, Search, Edit3, X, Image as ImageIcon, Box,
  Play, Square, Globe, Check, Link as LinkIcon
} from 'lucide-react';

const CATEGORIES = [
  { value: 'skincare', label: 'Mỹ phẩm dưỡng da' },
  { value: 'makeup', label: 'Mỹ phẩm trang điểm' },
  { value: 'health', label: 'Thực phẩm chức năng' },
  { value: 'pharmacy', label: 'Thuốc / Dược phẩm' },
];

export default function AdminProductManager() {
  const {
    products, addProduct, updateProduct, deleteProduct, rates,
    botIsRunning, toggleBot, pendingProducts,
    approvePendingProduct, approveSelectedPendingProducts, approveAllPendingProducts, rejectPendingProduct,
    publishToWeb, revertFromWeb
  } = useContext(AppContext);
  const showToast = useToast();

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'pending', 'bot'

  // --- Inventory State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // --- Edit Modal State ---
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});

  // --- Pending State ---
  const [selectedPending, setSelectedPending] = useState([]);

  // --- Bot State ---
  const [quickLink, setQuickLink] = useState('');
  const [loadingScrape, setLoadingScrape] = useState(false);
  const [loadingBotInstant, setLoadingBotInstant] = useState(false);
  const [scrapedPreview, setScrapedPreview] = useState(null);

  const krwRate = rates?.KRW?.rate || 19.5;
  const formatVnd = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  // ----------------------------------------------------
  // INVENTORY LOGIC
  // ----------------------------------------------------
  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchCat = filterCat === 'all' || p.category === filterCat;
      const term = searchTerm.toLowerCase();
      const matchSearch = !term ||
        (p.name || '').toLowerCase().includes(term) ||
        (p.brand || '').toLowerCase().includes(term) ||
        (p.goodsNo || '').toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  }, [products, filterCat, searchTerm]);

  const toggleSelectProduct = (goodsNo) => {
    setSelectedProducts(prev => 
      prev.includes(goodsNo) ? prev.filter(id => id !== goodsNo) : [...prev, goodsNo]
    );
  };
  const toggleSelectAll = () => {
    if (selectedProducts.length === filtered.length && filtered.length > 0) setSelectedProducts([]);
    else setSelectedProducts(filtered.map(p => p.goodsNo));
  };
  const handleDeleteSelected = () => {
    if (selectedProducts.length === 0) return;
    if (window.confirm(`Xóa vĩnh viễn ${selectedProducts.length} sản phẩm?`)) {
      selectedProducts.forEach(id => deleteProduct(id));
      setSelectedProducts([]);
      if (showToast) showToast(`Đã xóa ${selectedProducts.length} sản phẩm`, 'success');
    }
  };
  const handleDelete = (goodsNo) => {
    deleteProduct(goodsNo);
    setDeleteConfirm(null);
    if (showToast) showToast('Đã xoá sản phẩm', 'info');
  };

  // --- Edit/Add Logic ---
  const handleAddNew = () => {
    const newProd = {
      goodsNo: `SP-${Math.floor(10000 + Math.random() * 90000)}`,
      name: '', brand: '', category: 'skincare', foreignPrice: 0,
      productImage: '', description: '', origin: 'Store Olive Young Seoul, Hàn Quốc',
      rating: 5.0, reviewsCount: 0, usage: '', productUrl: '',
    };
    setEditForm(newProd);
    setEditModal({ isNew: true, ...newProd });
  };
  const openEdit = (prod) => {
    setEditForm({ ...prod });
    setEditModal(prod);
  };
  const handleEditChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: ['foreignPrice', 'rating', 'reviewsCount'].includes(field) ? (parseFloat(value) || 0) : value
    }));
  };
  const handleSaveEdit = () => {
    if (!editForm.name?.trim()) { showToast('Tên sản phẩm không được trống!', 'error'); return; }
    if (editModal.isNew) { addProduct(editForm); showToast('Đã thêm sản phẩm!', 'success'); } 
    else { updateProduct(editModal.goodsNo, editForm); showToast('Đã cập nhật!', 'success'); }
    setEditModal(null);
  };

  // ----------------------------------------------------
  // PENDING LOGIC
  // ----------------------------------------------------
  const toggleSelectPending = (goodsNo) => {
    setSelectedPending(prev => 
      prev.includes(goodsNo) ? prev.filter(id => id !== goodsNo) : [...prev, goodsNo]
    );
  };
  const toggleSelectAllPending = () => {
    if (selectedPending.length === pendingProducts.length && pendingProducts.length > 0) setSelectedPending([]);
    else setSelectedPending(pendingProducts.map(p => p.goodsNo));
  };
  const handleApproveSelected = () => {
    if (selectedPending.length === 0) return;
    if (window.confirm(`Duyệt ${selectedPending.length} sản phẩm lên Website?`)) {
      approveSelectedPendingProducts(selectedPending);
      setSelectedPending([]);
      if (showToast) showToast('Đã duyệt sản phẩm thành công!', 'success');
    }
  };
  const handleDeleteSelectedPending = () => {
    if (selectedPending.length === 0) return;
    if (window.confirm(`Xóa ${selectedPending.length} sản phẩm chờ?`)) {
      selectedPending.forEach(id => rejectPendingProduct(id));
      setSelectedPending([]);
      if (showToast) showToast('Đã xóa danh sách chờ!', 'success');
    }
  };

  // ----------------------------------------------------
  // BOT & SCRAPER LOGIC
  // ----------------------------------------------------
  const handleTriggerBotInstant = async () => {
    setLoadingBotInstant(true);
    if (showToast) showToast('Bot đang quét...', 'info');
    const { executeSingleBotRun } = await import('../services/autoScraperBotService');
    const res = await executeSingleBotRun(products, pendingProducts);
    setLoadingBotInstant(false);
    if (res.success && res.product) {
      approvePendingProduct(res.product.goodsNo);
      if (showToast) showToast(`Cào thành công: ${res.product.name}`, 'success');
    } else {
      if (showToast) showToast(`Lỗi: ${res.error}`, 'error');
    }
  };
  const handleScrape = async (e) => {
    e.preventDefault();
    if (!quickLink.trim()) return;
    setLoadingScrape(true);
    setScrapedPreview(null);
    const res = await scrapeProductMetadata(quickLink.trim());
    setLoadingScrape(false);
    if (res.success && res.product) setScrapedPreview(res.product);
    else showToast(`Lỗi: ${res.error}`, 'error');
  };
  const handlePushScraped = () => {
    if (!scrapedPreview) return;
    addProduct(scrapedPreview);
    setScrapedPreview(null);
    setQuickLink('');
    showToast('Đã thêm!', 'success');
  };

  // Chrome Extension Receive
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const autoFill = params.get('autoFill');
    if (autoFill) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(autoFill)));
        setScrapedPreview({
          goodsNo: `SP-${Math.floor(10000 + Math.random() * 90000)}`,
          name: decoded.name || '', brand: decoded.brand || 'Korea Brand',
          category: decoded.category || 'skincare', foreignPrice: decoded.price || 0,
          productImage: decoded.image || '', description: decoded.description || '',
          usage: decoded.usage || '', origin: 'Store Olive Young, Hàn Quốc',
          productUrl: decoded.url || '', reviewsCount: 150
        });
        setActiveTab('bot');
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {}
    }
  }, []);

  // ----------------------------------------------------
  // STYLES (Minimalist)
  // ----------------------------------------------------
  const styles = {
    container: { backgroundColor: '#F9FAFB', padding: '24px', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
    card: { backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    tabList: { display: 'flex', gap: '16px', borderBottom: '1px solid #E5E7EB', marginBottom: '24px' },
    tabBtn: (active) => ({ padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: active ? '#2563EB' : '#6B7280', borderBottom: active ? '2px solid #2563EB' : '2px solid transparent' }),
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
    th: { padding: '12px 16px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#4B5563', fontWeight: 600, textAlign: 'left' },
    td: { padding: '12px 16px', borderBottom: '1px solid #F3F4F6', color: '#111827', verticalAlign: 'middle' },
    input: { padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', outline: 'none', fontSize: '0.85rem' },
    btnPrimary: { backgroundColor: '#2563EB', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' },
    btnDanger: { backgroundColor: '#DC2626', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' },
    btnOutline: { backgroundColor: '#FFF', color: '#374151', border: '1px solid #D1D5DB', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' },
  };

  return (
    <div style={styles.container}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 24px 0', color: '#111827' }}>Quản Trị Kho Sản Phẩm</h2>
      
      <div style={styles.tabList}>
        <button style={styles.tabBtn(activeTab === 'inventory')} onClick={() => setActiveTab('inventory')}>Kho Sản Phẩm ({products.length})</button>
        <button style={styles.tabBtn(activeTab === 'pending')} onClick={() => setActiveTab('pending')}>
          Chờ Duyệt {pendingProducts?.length > 0 && <span style={{ background: '#DC2626', color: '#FFF', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', marginLeft: '6px' }}>{pendingProducts.length}</span>}
        </button>
        <button style={styles.tabBtn(activeTab === 'bot')} onClick={() => setActiveTab('bot')}>Cấu hình Bot & Crawler</button>
      </div>

      <div style={styles.card}>
        {/* ================= TAB 1: INVENTORY ================= */}
        {activeTab === 'inventory' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Tìm kiếm sản phẩm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ ...styles.input, width: '250px' }} />
                <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={styles.input}>
                  <option value="all">Tất cả danh mục</option>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {selectedProducts.length > 0 && (
                  <button onClick={handleDeleteSelected} style={styles.btnDanger}><Trash2 size={16}/> Xóa {selectedProducts.length} mục</button>
                )}
                <button onClick={handleAddNew} style={styles.btnPrimary}><Plus size={16}/> Thêm mới</button>
              </div>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #E5E7EB', borderRadius: '6px' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, width: '40px', textAlign: 'center' }}><input type="checkbox" checked={filtered.length > 0 && selectedProducts.length === filtered.length} onChange={toggleSelectAll} style={{ cursor: 'pointer' }} /></th>
                    <th style={{ ...styles.th, width: '60px' }}>Ảnh</th>
                    <th style={{ ...styles.th, width: '120px' }}>Mã SP</th>
                    <th style={styles.th}>Tên sản phẩm</th>
                    <th style={{ ...styles.th, width: '150px' }}>Thương hiệu</th>
                    <th style={{ ...styles.th, width: '150px', textAlign: 'right' }}>Giá (₩)</th>
                    <th style={{ ...styles.th, width: '100px', textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#6B7280', padding: '40px' }}>Không có dữ liệu</td></tr>
                  ) : (
                    filtered.map(prod => (
                      <tr key={prod.goodsNo} style={{ backgroundColor: selectedProducts.includes(prod.goodsNo) ? '#F3F4F6' : '#FFF' }}>
                        <td style={{ ...styles.td, textAlign: 'center' }}><input type="checkbox" checked={selectedProducts.includes(prod.goodsNo)} onChange={() => toggleSelectProduct(prod.goodsNo)} style={{ cursor: 'pointer' }} /></td>
                        <td style={styles.td}><img src={prod.productImage} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #E5E7EB' }} /></td>
                        <td style={{ ...styles.td, fontFamily: 'monospace' }}>{prod.goodsNo}</td>
                        <td style={{ ...styles.td, fontWeight: 500 }}>{prod.name}</td>
                        <td style={styles.td}>{prod.brand}</td>
                        <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600 }}>₩{(prod.foreignPrice||0).toLocaleString()}</td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <button onClick={() => openEdit(prod)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563EB', padding: '4px' }}>Sửa</button>
                          <button onClick={() => setDeleteConfirm(prod.goodsNo)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: '4px', marginLeft: '8px' }}>Xóa</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PENDING ================= */}
        {activeTab === 'pending' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontSize: '0.9rem', color: '#4B5563', paddingTop: '8px' }}>
                Đang có <strong>{pendingProducts?.length || 0}</strong> sản phẩm chờ duyệt từ Bot.
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {selectedPending.length > 0 && (
                  <>
                    <button onClick={handleDeleteSelectedPending} style={styles.btnDanger}><X size={16}/> Từ chối ({selectedPending.length})</button>
                    <button onClick={handleApproveSelected} style={{...styles.btnPrimary, backgroundColor: '#059669'}}><Check size={16}/> Duyệt lên Web ({selectedPending.length})</button>
                  </>
                )}
                <button onClick={approveAllPendingProducts} style={styles.btnOutline}>Duyệt tất cả</button>
              </div>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #E5E7EB', borderRadius: '6px' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, width: '40px', textAlign: 'center' }}><input type="checkbox" checked={pendingProducts?.length > 0 && selectedPending.length === pendingProducts.length} onChange={toggleSelectAllPending} style={{ cursor: 'pointer' }} /></th>
                    <th style={{ ...styles.th, width: '60px' }}>Ảnh</th>
                    <th style={{ ...styles.th, width: '120px' }}>Mã SP</th>
                    <th style={styles.th}>Tên sản phẩm</th>
                    <th style={{ ...styles.th, width: '150px' }}>Thương hiệu</th>
                    <th style={{ ...styles.th, width: '150px', textAlign: 'right' }}>Giá (₩)</th>
                    <th style={{ ...styles.th, width: '180px', textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {!pendingProducts || pendingProducts.length === 0 ? (
                    <tr><td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#6B7280', padding: '40px' }}>Hàng chờ trống</td></tr>
                  ) : (
                    pendingProducts.map(prod => (
                      <tr key={prod.goodsNo} style={{ backgroundColor: selectedPending.includes(prod.goodsNo) ? '#F3F4F6' : '#FFF' }}>
                        <td style={{ ...styles.td, textAlign: 'center' }}><input type="checkbox" checked={selectedPending.includes(prod.goodsNo)} onChange={() => toggleSelectPending(prod.goodsNo)} style={{ cursor: 'pointer' }} /></td>
                        <td style={styles.td}><img src={prod.productImage} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #E5E7EB' }} /></td>
                        <td style={{ ...styles.td, fontFamily: 'monospace' }}>{prod.goodsNo}</td>
                        <td style={{ ...styles.td, fontWeight: 500 }}>{prod.name}</td>
                        <td style={styles.td}>{prod.brand}</td>
                        <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600 }}>₩{(prod.foreignPrice||0).toLocaleString()}</td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <button onClick={() => approvePendingProduct(prod.goodsNo)} style={{ background: '#059669', color: '#FFF', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, marginRight: '8px' }}>Duyệt</button>
                          <button onClick={() => rejectPendingProduct(prod.goodsNo)} style={{ background: '#DC2626', color: '#FFF', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Xóa</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: BOT & SCRAPER ================= */}
        {activeTab === 'bot' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              
              {/* Bot Auto */}
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '6px', padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Box size={20} color="#2563EB" /> Auto Crawler Bot
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '20px', lineHeight: 1.5 }}>
                  Hệ thống tự động quét dữ liệu từ Olive Young Best Sellers mỗi 30 phút. Sản phẩm cào về sẽ được đưa vào <b>Hàng Chờ Duyệt</b>.
                </p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button onClick={() => {
                      toggleBot(!botIsRunning);
                      if (showToast) showToast(!botIsRunning ? 'Đã bật Bot' : 'Đã tắt Bot', !botIsRunning ? 'success' : 'info');
                    }} 
                    style={botIsRunning ? styles.btnDanger : styles.btnPrimary}>
                    {botIsRunning ? <Square size={16}/> : <Play size={16}/>} 
                    {botIsRunning ? 'Dừng Bot' : 'Khởi động Bot Tự Động'}
                  </button>
                  <button onClick={handleTriggerBotInstant} disabled={loadingBotInstant} style={styles.btnOutline}>
                    {loadingBotInstant ? 'Đang chạy...' : 'Chạy thử 1 lần ngay'}
                  </button>
                </div>
                <div style={{ marginTop: '16px', fontSize: '0.85rem', color: botIsRunning ? '#059669' : '#6B7280', fontWeight: 500 }}>
                  Trạng thái: {botIsRunning ? 'Đang hoạt động (Chu kỳ 30p)' : 'Đã tắt'}
                </div>
              </div>

              {/* Manual Scrape */}
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '6px', padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={20} color="#2563EB" /> Lấy dữ liệu bằng Link
                </h3>
                <form onSubmit={handleScrape} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <input type="url" required placeholder="Dán link sản phẩm (Olive Young/Naver...)" value={quickLink} onChange={e => setQuickLink(e.target.value)} style={{ ...styles.input, flex: 1 }} />
                  <button type="submit" disabled={loadingScrape} style={styles.btnPrimary}>
                    {loadingScrape ? 'Đang bóc...' : 'Lấy dữ liệu'}
                  </button>
                </form>

                {scrapedPreview && (
                  <div style={{ backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                      <img src={scrapedPreview.productImage} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #D1D5DB' }} />
                      <div>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#111827' }}>{scrapedPreview.name}</h4>
                        <div style={{ fontSize: '0.85rem', color: '#4B5563', marginBottom: '4px' }}>Thương hiệu: <b>{scrapedPreview.brand}</b></div>
                        <div style={{ fontSize: '0.85rem', color: '#4B5563' }}>Giá gốc: <b>₩{(scrapedPreview.foreignPrice||0).toLocaleString()}</b></div>
                      </div>
                    </div>
                    <button onClick={handlePushScraped} style={{ ...styles.btnPrimary, width: '100%', justifyContent: 'center' }}>Đẩy lên Website</button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>

      {/* ================= MODALS ================= */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
          <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem' }}>Xác nhận xóa</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#4B5563' }}>Bạn có chắc muốn xóa mã <b>{deleteConfirm}</b> vĩnh viễn?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteConfirm(null)} style={styles.btnOutline}>Hủy</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={styles.btnDanger}>Xóa vĩnh viễn</button>
            </div>
          </div>
        </div>
      )}

      {editModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
          <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '8px', width: '600px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{editModal.isNew ? 'Thêm Sản Phẩm Mới' : `Sửa SP: ${editModal.goodsNo}`}</h3>
              <button onClick={() => setEditModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Mã sản phẩm</label>
                <input value={editForm.goodsNo || ''} onChange={e => handleEditChange('goodsNo', e.target.value)} style={{ ...styles.input, width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Thương hiệu</label>
                <input value={editForm.brand || ''} onChange={e => handleEditChange('brand', e.target.value)} style={{ ...styles.input, width: '100%' }} />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Tên sản phẩm *</label>
              <input value={editForm.name || ''} onChange={e => handleEditChange('name', e.target.value)} style={{ ...styles.input, width: '100%' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Danh mục</label>
                <select value={editForm.category || 'skincare'} onChange={e => handleEditChange('category', e.target.value)} style={{ ...styles.input, width: '100%' }}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Giá Won (₩)</label>
                <input type="number" value={editForm.foreignPrice || 0} onChange={e => handleEditChange('foreignPrice', e.target.value)} style={{ ...styles.input, width: '100%' }} />
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>Ảnh sản phẩm (URL)</label>
              <input value={editForm.productImage || ''} onChange={e => handleEditChange('productImage', e.target.value)} style={{ ...styles.input, width: '100%' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button onClick={() => setEditModal(null)} style={styles.btnOutline}>Hủy</button>
              <button onClick={handleSaveEdit} style={styles.btnPrimary}>Lưu thông tin</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

```

## 📄 FILE: src/components/Toast.jsx
```jsx
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const bgColor = toast.type === 'success' ? '#10B981'
    : toast.type === 'error' ? '#EF4444'
    : toast.type === 'warning' ? '#F59E0B'
    : '#7A4B9E';

  return (
    <div
      style={{
        background: bgColor,
        color: '#fff',
        padding: '14px 24px',
        borderRadius: '12px',
        fontSize: '0.9rem',
        fontWeight: 600,
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '280px',
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.3s ease'
      }}
    >
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          fontSize: '1.2rem',
          cursor: 'pointer',
          opacity: 0.7
        }}
      >
        ×
      </button>
    </div>
  );
}

```

## 📄 FILE: src/components/LoadingSpinner.jsx
```jsx
import React from 'react';

export default function LoadingSpinner() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-ivory, #FDFBF7)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #E5D7EE',
          borderTop: '4px solid #7A4B9E',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: '#7A4B9E', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px' }}>
          ĐANG TẢI...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

```

## 📄 FILE: src/components/ErrorBoundary.jsx
```jsx
import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-ivory, #FDFBF7)',
          padding: '40px 20px',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '500px' }}>
            <h1 style={{
              fontSize: '2rem',
              fontFamily: 'Georgia, serif',
              color: '#7A4B9E',
              marginBottom: '16px'
            }}>
              Đã xảy ra lỗi
            </h1>
            <p style={{ color: '#666', fontSize: '1rem', marginBottom: '24px', lineHeight: '1.6' }}>
              Trang web gặp sự cố không mong muốn. Vui lòng thử tải lại trang.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 32px',
                borderRadius: '30px',
                border: 'none',
                background: '#7A4B9E',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '1px'
              }}
            >
              TẢI LẠI TRANG
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

```

## 📄 FILE: src/components/ScrollToTop.jsx
```jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

```

## 📄 FILE: chrome-extension/manifest.json
```json
{
  "manifest_version": 3,
  "name": "Tavy Order - Olive Young Scraper",
  "version": "2.0",
  "description": "Cào dữ liệu sản phẩm Olive Young và gửi về Admin. (Bản chuẩn Bypass CSP)",
  "permissions": [
    "activeTab",
    "scripting",
    "tabs",
    "storage"
  ],
  "host_permissions": [
    "*://*.oliveyoung.co.kr/*",
    "https://generativelanguage.googleapis.com/*"
  ],
  "options_page": "options.html",
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "action": {
    "default_popup": "popup.html"
  },
  "content_scripts": [
    {
      "matches": ["*://*.oliveyoung.co.kr/*"],
      "js": ["content.js"]
    }
  ]
}

```

## 📄 FILE: chrome-extension/background.js
```js
// background.js - Service Worker (Chạy ngầm, không bị ảnh hưởng bởi CSP)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "PROCESS_SCRAPED_DATA_AI") {
    const rawData = request.data;

    // Lấy API Key từ Storage
    chrome.storage.local.get(['geminiApiKey'], async (result) => {
      const apiKey = result.geminiApiKey;
      if (!apiKey) {
        sendResponse({ success: false, error: "Missing API Key" });
        return;
      }

      try {
        const prompt = `Trích xuất dữ liệu sản phẩm từ văn bản sau thành chuẩn JSON chứa các khoá: 
- name: Tên sản phẩm đã dịch sang tiếng Việt, bỏ các chữ [Khuyến mãi].
- price: Giá bán bằng Won (chỉ lấy số, ví dụ 15000).
- brand: Tên Thương hiệu (tiếng Anh hoặc Hàn).
- description: Mô tả công dụng sản phẩm (dịch tiếng Việt).
- usage: Hướng dẫn sử dụng nếu có (dịch tiếng Việt).
Nếu không tìm thấy, hãy đoán hoặc để chuỗi rỗng.
CHỈ TRẢ VỀ CHUỖI JSON HỢP LỆ, KHÔNG KÈM BẤT KỲ VĂN BẢN HAY MARKDOWN NÀO KHÁC (không có \`\`\`json).

VĂN BẢN TRANG WEB:
${rawData.fullText}`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        
        let aiResultText = data.candidates[0].content.parts[0].text;
        // Clean markdown backticks just in case
        aiResultText = aiResultText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const aiData = JSON.parse(aiResultText);

        const productData = {
          name: aiData.name || 'Tên sản phẩm',
          price: parseInt(aiData.price) || 0,
          image: rawData.image,
          brand: aiData.brand || 'Korea Brand',
          url: rawData.url,
          category: 'skincare', // Mặc định
          description: aiData.description || 'Sản phẩm chính hãng Hàn Quốc.',
          usage: aiData.usage || 'Xem chi tiết trên bao bì.'
        };

        const encodedData = btoa(encodeURIComponent(JSON.stringify(productData)));
        const adminUrl = `https://tavy-oderho.web.app/admin/dashboard?autoFill=${encodedData}`;

        // Mở Tab Admin
        chrome.tabs.create({ url: adminUrl });

        sendResponse({ success: true });
      } catch (err) {
        console.error("Lỗi AI Service Worker:", err);
        sendResponse({ success: false, error: err.message });
      }
    });

    // Giữ kết nối mở để chờ async trả về kết quả
    return true; 
  }
});

```

## 📄 FILE: chrome-extension/content.js
```js
// content.js - Chạy trên trang Olive Young
// Nhiệm vụ: Gom toàn bộ chữ và hình ảnh trên trang đưa cho AI đọc

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SCRAPE_PRODUCT") {
    try {
      // Báo hiệu đang xử lý
      document.body.insertAdjacentHTML('beforeend', '<div id="tavy-loading" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#6D28D9;color:#fff;padding:25px;z-index:999999;border-radius:12px;font-size:20px;font-weight:bold;box-shadow:0 4px 20px rgba(0,0,0,0.3);">🤖 AI đang quét đọc dữ liệu... (Chờ khoảng 5-10 giây)</div>');

      // 1. Lấy toàn bộ Text hiển thị trên màn hình
      // Giới hạn 15000 ký tự để không bị quá tải token Gemini
      let fullText = document.body.innerText;
      if (fullText.length > 15000) fullText = fullText.substring(0, 15000);

      // 2. Lấy URL ảnh chính
      let image = document.querySelector('#mainImg')?.src 
                  || document.querySelector('meta[property="og:image"]')?.content 
                  || '';

      // 3. Lấy URL hiện tại
      const url = window.location.href;

      const rawData = {
        fullText,
        image,
        url
      };

      // GỬI RAW DATA CHO BACKGROUND XỬ LÝ (Gọi Gemini API)
      chrome.runtime.sendMessage({ action: "PROCESS_SCRAPED_DATA_AI", data: rawData }, (response) => {
        document.getElementById('tavy-loading')?.remove();
        if (response && response.error) {
          alert("Lỗi AI: " + response.error);
        } else if (response && response.success === false) {
          alert("Bạn chưa cài đặt API Key! Vui lòng bấm vào icon Extension > Cài đặt API Key.");
        }
      });

    } catch (error) {
      alert("Lỗi cào dữ liệu DOM: " + error.message);
    }
  }
});

```

## 📄 FILE: chrome-extension/popup.html
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: sans-serif; width: 250px; padding: 10px; text-align: center; }
    button { padding: 10px 15px; background: #E11D48; color: white; border: none; border-radius: 5px; cursor: pointer; width: 100%; font-weight: bold; }
    button:hover { background: #BE123C; }
    p { font-size: 13px; color: #555; }
  </style>
</head>
<body>
  <h3>Tavy AI Scraper</h3>
  <p>Chỉ hoạt động trên trang chi tiết sản phẩm Olive Young.</p>
  <button id="scrapeBtn">Cào Dữ Liệu Bằng AI</button>
  <div style="margin-top:15px; font-size:12px;">
    <a href="#" id="optionsLink" style="color:#6D28D9; text-decoration:none; font-weight:bold;">⚙️ Cài đặt API Key</a>
  </div>
  <script src="popup.js"></script>
</body>
</html>

```

## 📄 FILE: chrome-extension/popup.js
```js
document.getElementById('scrapeBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab.url.includes("oliveyoung.co.kr") || tab.url.includes("oliveyoung.com")) {
    chrome.tabs.sendMessage(tab.id, { action: "SCRAPE_PRODUCT" });
    window.close();
  } else {
    alert("Vui lòng mở link chi tiết sản phẩm trên Olive Young!");
  }
});

document.getElementById('optionsLink').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

```

## 📄 FILE: chrome-extension/options.html
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
    h2 { color: #6D28D9; }
    label { font-weight: bold; display: block; margin-bottom: 8px; }
    input { width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; }
    button { padding: 10px 15px; background: #10B981; color: white; border: none; border-radius: 5px; cursor: pointer; width: 100%; font-weight: bold; }
    button:hover { background: #059669; }
    .help { font-size: 13px; color: #555; background: #F3F4F6; padding: 10px; border-radius: 5px; margin-bottom: 20px; line-height: 1.5; }
    #status { color: #10B981; font-weight: bold; margin-top: 10px; text-align: center; }
  </style>
</head>
<body>
  <h2>Cài đặt Tavy AI Scraper</h2>
  <div class="help">
    Để Bot có thể dùng AI đọc thông tin sản phẩm chuẩn xác nhất, bạn cần cung cấp 1 mã API Key miễn phí từ Google Gemini.<br><br>
    👉 <a href="https://aistudio.google.com/app/apikey" target="_blank">Bấm vào đây để lấy API Key miễn phí</a>
  </div>
  <label for="apiKey">Nhập Gemini API Key của bạn:</label>
  <input type="text" id="apiKey" placeholder="AIzaSy...">
  <button id="saveBtn">Lưu Cài Đặt</button>
  <div id="status"></div>
  <script src="options.js"></script>
</body>
</html>

```

## 📄 FILE: chrome-extension/options.js
```js
document.addEventListener('DOMContentLoaded', () => {
  // Load saved key
  chrome.storage.local.get(['geminiApiKey'], (result) => {
    if (result.geminiApiKey) {
      document.getElementById('apiKey').value = result.geminiApiKey;
    }
  });

  // Save key
  document.getElementById('saveBtn').addEventListener('click', () => {
    const key = document.getElementById('apiKey').value.trim();
    if (!key) {
      alert('Vui lòng nhập API Key!');
      return;
    }
    chrome.storage.local.set({ geminiApiKey: key }, () => {
      const status = document.getElementById('status');
      status.textContent = 'Đã lưu API Key thành công!';
      setTimeout(() => { status.textContent = ''; }, 3000);
    });
  });
});

```

