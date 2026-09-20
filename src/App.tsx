/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import { ToastProvider } from './context/ToastContext';

// Lazy load the heavy dashboards to speed up initial JS bundle size and login page rendering
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const CreatorDashboard = React.lazy(() => import('./pages/CreatorDashboard'));
const ClientDashboard = React.lazy(() => import('./pages/ClientDashboard'));
const PublicReview = React.lazy(() => import('./pages/PublicReview'));
const Landing = React.lazy(() => import('./pages/Landing'));
const CreatorHubLanding = React.lazy(() => import('./pages/CreatorHubLanding'));
const TellusPortal = React.lazy(() => import('./pages/TellusPortal'));

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'admin' | 'creator' | 'client' }) => {
  const { user, profile, loading } = useAuth();
  const hasAuthTokens = typeof window !== 'undefined' && (
    window.location.hash.includes('access_token') || 
    window.location.search.includes('code=')
  );

  // If there are tokens currently being exchanged in URL, show spinner briefly
  if (hasAuthTokens && !user) {
    return <LoadingSpinner message="Verificando permisos..." />;
  }

  // If initial auth is actively loading on cold start and no user found yet
  if (loading && !user) {
    return <LoadingSpinner message="Verificando permisos..." />;
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated! Main admin always has access
  const isSuperAdmin = user.email === 'cabscryptocontacto@gmail.com';
  const effectiveRole = isSuperAdmin ? 'admin' : (profile?.role || 'creator');

  if (role === 'admin' && effectiveRole !== 'admin' && effectiveRole !== 'manager') {
    return <Navigate to="/" replace />;
  }

  if (role === 'creator' && effectiveRole !== 'creator' && effectiveRole !== 'admin' && effectiveRole !== 'manager') {
    return <Navigate to="/" replace />;
  }

  if (role === 'client' && effectiveRole !== 'client' && effectiveRole !== 'admin' && effectiveRole !== 'manager') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const HomeRedirect = () => {
  const { user, profile, loading } = useAuth();
  const hasAuthTokens = typeof window !== 'undefined' && (
    window.location.hash.includes('access_token') || 
    window.location.search.includes('code=')
  );
  
  if (hasAuthTokens && !user) {
    return <LoadingSpinner message="Autenticando en Browns Stats..." />;
  }
  
  if (loading && !user) {
    return <LoadingSpinner message="Autenticando en Browns Stats..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isSuperAdmin = user.email === 'cabscryptocontacto@gmail.com';
  const effectiveRole = isSuperAdmin ? 'admin' : (profile?.role || 'creator');

  if (effectiveRole === 'admin' || effectiveRole === 'manager') {
    return <Navigate to="/admin" replace />;
  } else if (effectiveRole === 'client') {
    return <Navigate to="/client" replace />;
  } else {
    return <Navigate to="/creator" replace />;
  }
};

import { TenantProvider } from './context/TenantContext';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <TenantProvider>
          <Router>
            <div className="min-h-screen bg-white">
              <AppContent />
            </div>
          </Router>
        </TenantProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const pathname = location.pathname;
  const isPublicRoute = pathname === '/' || pathname === '/umbra' || pathname === '/tellus' || pathname.startsWith('/review/') || pathname.startsWith('/v/') || pathname.startsWith('/login');
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <>
      {!isPublicRoute && <Navbar />}
      <main className={!isPublicRoute && !isAdminRoute ? "mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-6 pb-10" : ""}>
        <React.Suspense fallback={<LoadingSpinner message="Cargando panel..." />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<CreatorHubLanding />} />
            <Route path="/umbra" element={<Landing />} />
            <Route path="/tellus" element={<TellusPortal />} />
            <Route path="/dashboard" element={<HomeRedirect />} />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/creator/*" 
              element={
                <ProtectedRoute role="creator">
                  <CreatorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/client/*" 
              element={
                <ProtectedRoute role="client">
                  <ClientDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/review/:token" element={<PublicReview />} />
            <Route path="/v/:token" element={<PublicReview />} />
          </Routes>
        </React.Suspense>
      </main>
    </>
  );
}
