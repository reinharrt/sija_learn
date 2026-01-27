// ============================================
// src/app/(auth)/register/page.tsx
// Register Page - User registration interface
// ============================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

export default function RegisterPage() {
  const router = useRouter();
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-4">Registrasi Berhasil!</h1>
          
          {requiresVerification ? (
            <>
              <p className="text-gray-600 mb-6">
                Silakan cek email Anda untuk verifikasi akun.
              </p>
              <Link 
                href="/login"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Ke Halaman Login
              </Link>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                Akun Anda sudah aktif. Silakan login untuk melanjutkan.
              </p>
              <Link 
                href="/login"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Register</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nama lengkap"
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

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Loading...' : 'Daftar'}
          </Button>
        </form>

        <p className="text-center mt-4 text-gray-600 text-sm">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}