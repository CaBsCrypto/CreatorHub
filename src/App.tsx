/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import CreatorDashboard from './pages/CreatorDashboard';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'admin' | 'creator' }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
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

  return <>{children}</>;
};

const HomeRedirect = () => {
  const { profile, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  
  if (profile?.role === 'admin' || profile?.role === 'manager') {
    return <Navigate to="/admin" replace />;
  } else if (profile?.role === 'creator') {
    return <Navigate to="/creator" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<HomeRedirect />} />
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
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
