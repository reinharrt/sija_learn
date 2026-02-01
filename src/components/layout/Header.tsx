// ============================================
// src/components/layout/Header.tsx
// Header Component - Neobrutalist Navigation
// ============================================

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Menu, X, Moon, Sun, UserCog } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-sija-surface/90 backdrop-blur-sm border-b-2 border-sija-primary transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 lg:gap-3 group cursor-pointer">
            <div className="w-16 h-16 lg:w-[80px] lg:h-[80px] relative transition-transform group-hover:scale-105">
              <Image
                src="/assets/logo/logo.png"
                alt="SIJA.ID Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link href="/articles" className="font-display text-sm font-bold text-sija-text hover:text-sija-primary uppercase tracking-wide transition-colors">
              Articles
            </Link>
            <Link href="/courses" className="font-display text-sm font-bold text-sija-text hover:text-sija-primary uppercase tracking-wide transition-colors">
              Courses
            </Link>
            <Link href="/leaderboard" className="font-display text-sm font-bold text-sija-text hover:text-sija-primary uppercase tracking-wide transition-colors">
              Leaderboard
            </Link>

            {user && (
              <Link href="/my-courses" className="font-display text-sm font-bold text-sija-text hover:text-sija-primary uppercase tracking-wide transition-colors">
                My Courses
              </Link>
            )}

            {/* Admin Panel - Only show for Admin users */}
            {user && user.role === UserRole.ADMIN && (
              <Link href="/admin" className="px-3 py-2 font-display font-bold text-sm bg-purple-600 text-white border-2 border-purple-600 shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase">
                Admin
              </Link>
            )}

            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 text-sija-text hover:text-sija-primary transition-colors" aria-label="Toggle theme">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-sija-text hidden lg:inline">{user.name}</span>
                <Link
                  href="/profile/edit"
                  className="p-2 bg-blue-100 text-blue-600 border-2 border-blue-600 shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  aria-label="Edit Profile"
                  title="Edit Profile"
                >
                  <UserCog size={20} />
                </Link>
                <button onClick={handleLogout} className="px-4 py-2 font-display font-bold text-sm bg-red-500 text-white border-2 border-red-500 shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase">
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="px-5 py-2 font-display font-bold text-sm bg-sija-surface text-sija-primary border-2 border-sija-primary shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <button onClick={toggleTheme} className="p-2 text-sija-primary">
              {isDark ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <button className="text-sija-primary p-2 border-2 border-transparent hover:border-sija-primary" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-sija-surface border-b-2 border-sija-primary transition-colors duration-300">
          <div className="px-6 py-4 space-y-3">
            <Link href="/articles" className="block font-display text-base font-bold text-sija-text hover:text-sija-primary hover:pl-2 transition-all" onClick={() => setIsOpen(false)}>
              Articles
            </Link>
            <Link href="/courses" className="block font-display text-base font-bold text-sija-text hover:text-sija-primary hover:pl-2 transition-all" onClick={() => setIsOpen(false)}>
              Courses
            </Link>
            <Link href="/leaderboard" className="block font-display text-base font-bold text-sija-text hover:text-sija-primary hover:pl-2 transition-all" onClick={() => setIsOpen(false)}>
              Leaderboard
            </Link>

            {user && (
              <Link href="/my-courses" className="block font-display text-base font-bold text-sija-text hover:text-sija-primary hover:pl-2 transition-all" onClick={() => setIsOpen(false)}>
                My Courses
              </Link>
            )}

            {user && user.role === UserRole.ADMIN && (
              <Link href="/admin" className="block font-display text-base font-bold text-purple-600 hover:text-purple-700 hover:pl-2 transition-all" onClick={() => setIsOpen(false)}>
                Admin Panel
              </Link>
            )}

            {user ? (
              <div className="pt-3 border-t-2 border-sija-text/10 space-y-3">
                <p className="text-sm font-bold text-sija-text">Logged in as: {user.name}</p>
                <Link
                  href="/profile/edit"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-4 py-3 font-bold bg-blue-100 text-blue-600 border-2 border-blue-600 shadow-hard-sm active:shadow-none active:translate-x-[2px] active:translate-y-[2px] uppercase"
                >
                  Edit Profile
                </Link>
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-center px-4 py-3 font-bold bg-red-500 text-white border-2 border-red-500 shadow-hard-sm active:shadow-none active:translate-x-[2px] active:translate-y-[2px] uppercase">
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="block w-full text-center mt-4 px-4 py-3 font-bold bg-sija-primary text-white border-2 border-sija-primary shadow-hard-sm active:shadow-none active:translate-x-[2px] active:translate-y-[2px] uppercase" onClick={() => setIsOpen(false)}>
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}