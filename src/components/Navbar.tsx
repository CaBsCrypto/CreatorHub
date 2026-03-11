import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { logout } from '../firebase';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600">
                CreatorHub
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {(profile?.role === 'admin' || profile?.role === 'manager') && (
                <>
                  <Link to="/admin" className="inline-flex items-center border-b-2 border-indigo-500 px-1 pt-1 text-sm font-medium text-gray-900">
                    Admin Dashboard
                  </Link>
                  <Link to="/creator" className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                    Creator View
                  </Link>
                </>
              )}
              {profile?.role === 'creator' && (
                <>
                  <Link to="/creator" className="inline-flex items-center border-b-2 border-indigo-500 px-1 pt-1 text-sm font-medium text-gray-900">
                    My Content
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="relative ml-3 flex items-center gap-4">
              <div className="flex items-center gap-2">
                {profile?.photoURL ? (
                  <img className="h-8 w-8 rounded-full" src={profile.photoURL} alt="" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                    <UserIcon className="h-5 w-5 text-gray-500" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">{profile?.displayName || user.email}</span>
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 capitalize">
                  {profile?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-md bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="sr-only">Log out</span>
                <LogOut className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
