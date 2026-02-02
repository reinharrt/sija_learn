// ============================================
// src/app/(auth)/login/page.tsx
// Login Page - Neobrutalist Split Layout
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { SquareAsterisk, Sparkles, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;
  if (user) return null;

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* Left Side - Hero / Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sija-surface bg-grid-pattern border-r-2 border-sija-primary flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-32 bg-sija-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 p-24 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="z-10 relative">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 border-2 border-sija-primary shadow-hard-sm mb-8">
            <Sparkles size={18} className="text-sija-primary fill-sija-primary" />
            <span className="font-bold uppercase tracking-wider text-xs">Sija Learn Platform</span>
          </div>

          <h1 className="text-6xl font-display font-black text-sija-text leading-tight mb-6 uppercase">
            Welcome <br />
            <span className="text-sija-primary relative">
              Back
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-400 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>
          <p className="text-xl text-sija-text/70 font-medium max-w-md">
            Lanjutkan progres belajarmu. Akses materi, kerjakan kuis, dan bangun portofoliomu.
          </p>
        </div>

        <div className="z-10 relative">
          <div className="flex gap-4 mb-4">
            <div className="p-4 bg-white border-2 border-sija-primary shadow-hard-sm rounded-none w-1/2">
              <div className="text-3xl font-black text-sija-primary mb-1">5k+</div>
              <div className="text-xs font-bold uppercase text-sija-text/60">Students</div>
            </div>
            <div className="p-4 bg-white border-2 border-sija-primary shadow-hard-sm rounded-none w-1/2">
              <div className="text-3xl font-black text-blue-600 mb-1">24/7</div>
              <div className="text-xs font-bold uppercase text-sija-text/60">Access</div>
            </div>
          </div>
          <p className="text-sm font-medium text-sija-text/50">© 2024 Sija Learn. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center p-6 lg:p-24 pt-32 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-display font-black text-sija-primary uppercase tracking-tight">Login</h1>
            <p className="text-sija-text/60 font-medium text-sm">Sign in to your account.</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-sija-text tracking-tight hidden lg:block">Login Account</h2>
            <p className="text-sija-text/60 font-medium hidden lg:block">Enter your credentials to access your account.</p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-500 text-red-700 px-4 py-3 font-bold shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] flex items-start gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5">
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
              />
              <div>
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                <div className="flex justify-end mt-2">
                  <Link href="/forgot-password" className="text-sm font-bold text-sija-primary hover:underline">
                    Lupa Password?
                  </Link>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">Authenticating...</span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  Login <ArrowRight size={18} />
                </span>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t-2 border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500 font-bold tracking-wider">Atau</span>
            </div>
          </div>

          <p className="text-center font-medium text-sija-text">
            Belum punya akun?{' '}
            <Link href="/register" className="text-sija-primary hover:underline decoration-2 underline-offset-2 font-bold">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
