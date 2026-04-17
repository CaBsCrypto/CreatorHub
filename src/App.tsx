/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'admin' | 'creator' | 'client' }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Verificando sesión..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'admin' && profile?.role !== 'admin' && profile?.role !== 'manager') {
    return <Navigate to="/" replace />;
  }

  if (role === 'creator' && profile?.role !== 'creator' && profile?.role !== 'admin' && profile?.role !== 'manager') {
    return <Navigate to="/" replace />;
  }

  if (role === 'client' && profile?.role !== 'client' && profile?.role !== 'admin' && profile?.role !== 'manager') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const HomeRedirect = () => {
  const { profile, loading } = useAuth();
  
  if (loading) return <LoadingSpinner message="Iniciando..." />;
  
  if (profile?.role === 'admin' || profile?.role === 'manager') {
    return <Navigate to="/admin" replace />;
  } else if (profile?.role === 'creator') {
    return <Navigate to="/creator" replace />;
  } else if (profile?.role === 'client') {
    return <Navigate to="/client" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-white">
            <AppContent />
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

function AppContent() {
  const { pathname } = window.location;
  const isPublicRoute = pathname === '/' || pathname.startsWith('/review/') || pathname.startsWith('/v/') || pathname === '/login';

  return (
    <>
      {!isPublicRoute && <Navbar />}
      <main className={!isPublicRoute ? "mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-6 pb-10" : ""}>
        <React.Suspense fallback={<LoadingSpinner message="Cargando panel..." />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Landing />} />
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
