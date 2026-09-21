import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { logout } from '../AuthContext';
import { LogOut, User as UserIcon, Menu, X, LayoutDashboard, UserCircle, Globe } from 'lucide-react';
import { clsx } from 'clsx';

import { useTenant, TenantType } from '../context/TenantContext';

export default function Navbar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { tenant, setTenant, config, availableTenants } = useTenant();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  const isAdminPath = location.pathname.startsWith('/admin');

  const isAdmin = profile?.role === 'admin' || profile?.role === 'manager';
  const isCreator = profile?.role === 'creator';
  const isClient = profile?.role === 'client';

  const navLinks = [
    ...(isAdmin ? [
      { name: 'Página Pública', href: config.publicUrl, icon: Globe },
      { name: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
      { name: 'Creator View', href: '/creator', icon: UserCircle },
    ] : []),
    ...(isCreator ? [
      { name: 'My Content', href: '/creator', icon: UserCircle },
    ] : []),
    ...(isClient ? [
      { name: 'My Campaigns', href: '/client', icon: LayoutDashboard },
    ] : []),
  ];

  return (
    <nav className={clsx(
      "bg-white shadow-sm sticky top-0 z-50",
      isAdminPath && "hidden lg:block" // Hide on mobile if it's admin path
    )}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="text-xl font-black tracking-tight text-slate-900">
                Creator<span className="text-indigo-600">Hub</span>
              </span>
            </Link>

            {/* Tenant Selector Pill */}
            {availableTenants.length > 1 && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-[11px] font-black uppercase tracking-wider">
                {availableTenants.map((t) => {
                  const isActive = tenant === t;
                  const label = t === 'umbra' ? 'Umbra' : 'Tellus';
                  return (
                    <button
                      key={t}
                      onClick={() => setTenant(t as TenantType)}
                      className={clsx(
                        "px-2.5 py-1 rounded-lg transition-all duration-200",
                        isActive
                          ? t === 'umbra' 
                            ? "bg-rose-600 text-white shadow-sm" 
                            : "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
            
            {/* Desktop Links */}
            <div className="hidden sm:ml-4 sm:flex sm:space-x-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target={link.name === 'Página Pública' ? "_blank" : undefined}
                  rel={link.name === 'Página Pública' ? "noopener noreferrer" : undefined}
                  className={clsx(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname.startsWith(link.href) && link.href !== '/'
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User Info (Desktop) */}
            <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-gray-200">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{profile?.display_name || user.email}</div>
                <div className="text-xs text-gray-500 capitalize">{profile?.role}</div>
              </div>
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                {profile?.photo_url ? (
                  <img src={profile.photo_url} alt="" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon className="h-4 w-4 text-indigo-600" />
                )}
              </div>
            </div>

            {/* Logout (Desktop) */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Cerrar Sessión"
            >
              <LogOut className="h-5 w-5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top-4 duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target={link.name === 'Página Pública' ? "_blank" : undefined}
                rel={link.name === 'Página Pública' ? "noopener noreferrer" : undefined}
                onClick={() => setIsMenuOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium",
                  location.pathname.startsWith(link.href) && link.href !== '/'
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.name}
              </a>
            ))}
            <div className="pt-4 mt-4 border-t border-gray-100">
              <div className="px-3 py-2 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                  {profile?.photo_url ? (
                    <img src={profile.photo_url} alt="" />
                  ) : (
                    <UserIcon className="h-6 w-6 text-indigo-600" />
                  )}
                </div>
                <div>
                  <div className="text-base font-medium text-gray-800">{profile?.display_name || user.email?.split('@')[0]}</div>
                  <div className="text-sm text-gray-500 capitalize">{profile?.role}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 mt-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="h-5 w-5" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
