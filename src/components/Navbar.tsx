import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { logout } from '../firebase';
import { LogOut, User as UserIcon, Menu, X, LayoutDashboard, UserCircle } from 'lucide-react';
import { clsx } from 'clsx';

export default function Navbar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  const isAdmin = profile?.role === 'admin' || profile?.role === 'manager';
  const isCreator = profile?.role === 'creator';

  const navLinks = [
    ...(isAdmin ? [
      { name: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
      { name: 'Creator View', href: '/creator', icon: UserCircle },
    ] : []),
    ...(isCreator ? [
      { name: 'My Content', href: '/creator', icon: UserCircle },
    ] : []),
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link to={isAdmin ? '/admin' : '/creator'} className="text-xl font-bold text-indigo-600 flex items-center gap-2">
              <span className="hidden sm:inline">CreatorHub</span>
              <span className="sm:hidden text-2xl">CH</span>
            </Link>
            
            {/* Desktop Links */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={clsx(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname.startsWith(link.href)
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User Info (Desktop) */}
            <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-gray-200">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{profile?.displayName || user.email}</div>
                <div className="text-xs text-gray-500 capitalize">{profile?.role}</div>
              </div>
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="" referrerPolicy="no-referrer" />
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
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium",
                  location.pathname.startsWith(link.href)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.name}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-gray-100">
              <div className="px-3 py-2 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt="" />
                  ) : (
                    <UserIcon className="h-6 w-6 text-indigo-600" />
                  )}
                </div>
                <div>
                  <div className="text-base font-medium text-gray-800">{profile?.displayName || user.email?.split('@')[0]}</div>
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
