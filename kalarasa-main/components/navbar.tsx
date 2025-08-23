'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface User {
  email: string;
  first_name?: string;
  last_name?: string;
  [key: string]: string | undefined;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Get user info from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData) as User);
    }
  }, []);

  const handleLogoClick = () => {
    router.push('/home');
  };

  const handleCreateClick = () => {
    router.push('/post');
  };

  const handleMapsClick = () => {
    router.push('/maps');
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('google_user');
    
    // Redirect to login
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button 
              onClick={handleLogoClick}
              className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-md"
            >
              <Image
                src="/logo.svg"
                alt="Kalarasa"
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </button>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* User greeting */}
            {user && (
              <span className="text-gray-700 text-sm">
                Hello, {user.email?.split('@')[0] || 'User'}
              </span>
            )}

            {/* Maps Button */}
            <button
              onClick={handleMapsClick}
              className="flex items-center p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 group"
              title="Find Museums"
            >
              <svg 
                className="w-6 h-6 text-gray-700 group-hover:text-red-500 transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
            </button>

            {/* Create Button */}
            <button
              onClick={handleCreateClick}
              className="flex items-center px-4 py-2 border-2 border-black rounded-full text-black font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              + Create
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <Image
                  src="/profile.svg"
                  alt="Profile"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <button
                    onClick={() => {
                      handleProfileClick();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    View Profile
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </nav>
  );
}
