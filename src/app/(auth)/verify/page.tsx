// ============================================
// src/app/(auth)/verify/page.tsx
// Verify Page - Email verification interface
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token verifikasi tidak ditemukan');
      return;
    }

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setStatus('error');
          setMessage(data.error);
        } else {
          setStatus('success');
          setMessage(data.message);
        }
      })
      .catch(err => {
        setStatus('error');
        setMessage('Terjadi kesalahan saat verifikasi');
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        {status === 'loading' && (
          <>
            <div className="text-blue-600 text-5xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold mb-4">Memverifikasi...</h1>
            <p className="text-gray-600">Mohon tunggu sebentar</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold mb-4">Verifikasi Berhasil!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link 
              href="/login"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Login Sekarang
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-600 text-5xl mb-4">✗</div>
            <h1 className="text-2xl font-bold mb-4">Verifikasi Gagal</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link 
              href="/register"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Daftar Ulang
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
