'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

export default function Header() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-blue-600">
              SIJA Learn
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link href="/articles" className="text-gray-700 hover:text-blue-600">
                Artikel
              </Link>
              <Link href="/courses" className="text-gray-700 hover:text-blue-600">
                Course
              </Link>
              {user && (
                <Link href="/my-courses" className="text-gray-700 hover:text-blue-600">
                  Course Saya
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600 hidden md:block">
                  {user.name}
                </span>
                
                {/* Writer Menu */}
                {(user.role === UserRole.WRITER || user.role === UserRole.COURSE_ADMIN || user.role === UserRole.ADMIN) && (
                  <div className="hidden lg:flex items-center space-x-3">
                    <Link 
                      href="/articles/create"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Buat Artikel
                    </Link>
                    <Link 
                      href="/my-articles"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Artikel Saya
                    </Link>
                  </div>
                )}

                {/* Course Admin Menu */}
                {(user.role === UserRole.COURSE_ADMIN || user.role === UserRole.ADMIN) && (
                  <Link 
                    href="/courses/create"
                    className="text-sm text-blue-600 hover:text-blue-800 hidden lg:block"
                  >
                    Buat Course
                  </Link>
                )}

                {/* Admin Menu */}
                {user.role === UserRole.ADMIN && (
                  <Link 
                    href="/admin"
                    className="text-sm bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700"
                  >
                    Admin
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="text-sm bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="text-sm text-gray-700 hover:text-blue-600"
                >
                  Login
                </Link>
                <Link 
                  href="/register"
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}