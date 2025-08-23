'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Get user info from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogoClick = () => {
    router.push('/home');
  };

  const handleCreateClick = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setIsNavigating(true);
    router.push('/post');
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

            {/* Create Button */}
            <button
              onClick={handleCreateClick}
              disabled={isNavigating}
              className="flex items-center px-4 py-2 border-2 border-black rounded-full text-black font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isNavigating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                '+ Create'
              )}
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