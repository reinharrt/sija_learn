// ============================================
// src/app/(auth)/login/page.tsx
// Login Page - User login interface
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { SquareAsterisk } from 'lucide-react';

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

  // Show loading state while checking auth
  if (authLoading) {
    return null;
  }

  // Don't render if user is logged in (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-sija-surface">
      <div className="max-w-md w-full bg-white p-8 border-2 border-sija-primary shadow-hard">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sija-primary text-white mb-4 border-2 border-sija-primary shadow-hard-sm">
            <SquareAsterisk size={32} />
          </div>
          <h1 className="text-3xl font-display font-black text-sija-primary uppercase tracking-tight">
            Login
          </h1>
          <p className="text-sija-text/70 font-medium mt-2">
            Welcome back, engineer.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-500 text-red-700 px-4 py-3 mb-6 font-bold shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
            required
            className="mb-4"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Authenticating...' : 'Login'}
          </Button>
        </form>

        <p className="text-center mt-4 text-sija-text/70 font-medium text-sm">
          <Link href="/forgot-password" className="text-sija-primary hover:underline font-bold">
            Lupa Password?
          </Link>
        </p>

        <p className="text-center mt-8 text-sija-text font-medium text-sm">
          Belum punya akun?{' '}
          <Link href="/register" className="text-sija-primary hover:bg-sija-primary hover:text-white transition-all px-1 font-bold uppercase underline decoration-2 underline-offset-2">
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
