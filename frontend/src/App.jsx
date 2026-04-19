import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Sidebar from './components/Sidebar';
import { lazy, Suspense, useState, useEffect } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import { dashboardAPI } from './services/api';

// Lazy-loaded pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Customers = lazy(() => import('./pages/Customers'));
const Rentals = lazy(() => import('./pages/Rentals'));
const NewRental = lazy(() => import('./pages/NewRental'));
const RentalDetail = lazy(() => import('./pages/RentalDetail'));
const ReturnItems = lazy(() => import('./pages/ReturnItems'));
const Settings = lazy(() => import('./pages/Settings'));

function ProtectedRoute({ children, ownerOnly = false }) {
  const { isAuthenticated, loading, isOwner } = useAuth();
  if (loading) return <LoadingSpinner size="page" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (ownerOnly && !isOwner()) return <Navigate to="/rentals" replace />;
  return children;
}

function AppLayout() {
  const { isOwner } = useAuth();
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    // Only fetch dashboard stats if OWNER (WORKER gets 403)
    if (isOwner()) {
      dashboardAPI.getStats()
        .then(res => setOverdueCount(res.data?.overdueRentals || 0))
        .catch(() => {});
    }
  }, []);

  return (
    <div className="app-layout">
      <Sidebar overdueCount={overdueCount} />
      <main className="main-content">
        <Suspense fallback={<LoadingSpinner size="page" />}>
          <Routes>
            {/* Owner-only routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute ownerOnly>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute ownerOnly>
                <Settings />
              </ProtectedRoute>
            } />

            {/* Shared routes */}
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/rentals" element={<Rentals />} />
            <Route path="/rentals/new" element={<NewRental />} />
            <Route path="/rentals/:id" element={<RentalDetail />} />
            <Route path="/rentals/:id/return" element={<ReturnItems />} />

            {/* Default redirect */}
            <Route path="*" element={<Navigate to={isOwner() ? '/dashboard' : '/rentals'} replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<LoadingSpinner size="page" />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
