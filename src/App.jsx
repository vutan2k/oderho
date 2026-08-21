import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppProvider';
import { ToastProvider } from './components/Toast';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import LoadingSpinner from './components/LoadingSpinner';
import Navbar from './components/Navbar';
import VersionBadge from './components/VersionBadge';
import ChatWidget from './components/ChatWidget/ChatWidget';

// Lazy load pages for code-splitting
const KROrderHomePage = lazy(() => import('./pages/KROrderHomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const PolicyPage = lazy(() => import('./pages/PolicyPage'));

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ToastProvider>
          <HelmetProvider>
            <BrowserRouter>
            <ScrollToTop />
            <VersionBadge position="bottom-right" />
            <ChatWidget />
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<KROrderHomePage />} />
                <Route path="/cart" element={<><Navbar /><CartPage /></>} />
                <Route path="/login" element={<><Navbar /><LoginPage /></>} />
                <Route path="/orders" element={<><Navbar /><OrdersPage /></>} />
                <Route path="/profile" element={<><Navbar /><UserProfilePage /></>} />
                <Route path="/payment/:orderId" element={<><Navbar /><PaymentPage /></>} />
                <Route path="/policy" element={<><Navbar /><PolicyPage /></>} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          </HelmetProvider>
        </ToastProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}
