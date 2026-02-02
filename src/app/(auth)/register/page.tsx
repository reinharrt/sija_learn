// ============================================
// src/app/(auth)/register/page.tsx
// Register Page - Neobrutalist Split Layout
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { UserPlus, Sparkles, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);

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

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(true);
      setRequiresVerification(data.requiresVerification);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;
  if (user) return null;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-sija-surface bg-grid-pattern">
        <div className="max-w-md w-full bg-white p-8 border-2 border-sija-primary shadow-hard text-center">
          <div className="w-20 h-20 bg-green-500 border-2 border-green-700 flex items-center justify-center mx-auto mb-6 shadow-hard-sm">
            <div className="text-white text-5xl font-black">✓</div>
          </div>
          <h1 className="text-3xl font-display font-black text-sija-text uppercase mb-4 tracking-tight">
            Registrasi Berhasil!
          </h1>
          {requiresVerification ? (
            <>
              <p className="text-sija-text/70 font-medium mb-8">
                Silakan cek email Anda untuk verifikasi akun.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-3 bg-sija-primary text-white font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider"
              >
                Ke Halaman Login
              </Link>
            </>
          ) : (
            <>
              <p className="text-sija-text/70 font-medium mb-8">
                Akun Anda sudah aktif. Silakan login untuk melanjutkan.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-3 bg-sija-primary text-white font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider"
              >
                Login Sekarang
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

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
            Start Your <br />
            <span className="text-sija-primary relative">
              Journey
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-400 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>
          <p className="text-xl text-sija-text/70 font-medium max-w-md">
            Bergabunglah dengan komunitas pembelajar SIJA. Tingkatkan skill kodingmu ke level berikutnya.
          </p>
        </div>

        <div className="z-10 relative">
          <div className="flex gap-4 mb-4">
            <div className="p-4 bg-white border-2 border-sija-primary shadow-hard-sm rounded-none w-1/2">
              <div className="text-3xl font-black text-sija-primary mb-1">100+</div>
              <div className="text-xs font-bold uppercase text-sija-text/60">Modul Pembelajaran</div>
            </div>
            <div className="p-4 bg-white border-2 border-sija-primary shadow-hard-sm rounded-none w-1/2">
              <div className="text-3xl font-black text-blue-600 mb-1">Active</div>
              <div className="text-xs font-bold uppercase text-sija-text/60">Community</div>
            </div>
          </div>
          <p className="text-sm font-medium text-sija-text/50">© 2024 Sija Learn. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center p-6 lg:p-24 pt-32 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-display font-black text-sija-primary uppercase tracking-tight">Join Sija</h1>
            <p className="text-sija-text/60 font-medium text-sm">Create your account to get started.</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-sija-text tracking-tight hidden lg:block">Create Account</h2>
            <p className="text-sija-text/60 font-medium hidden lg:block">Enter your details to register.</p>
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
                label="Nama Lengkap"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
              />
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimal 8 karakter"
                required
              />
              <Input
                label="Konfirmasi Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Ulangi password"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">Loading...</span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  Daftar Sekarang <ArrowRight size={18} />
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
            Sudah punya akun?{' '}
            <Link href="/login" className="text-sija-primary hover:underline decoration-2 underline-offset-2 font-bold">
              Login disini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}