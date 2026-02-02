// ============================================
// src/app/(auth)/verify/page.tsx
// Verify Page - Neobrutalist Split Layout
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2, Sparkles, ArrowRight } from 'lucide-react';

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
            Account <br />
            <span className="text-sija-primary relative">
              Verification
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-400 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>
          <p className="text-xl text-sija-text/70 font-medium max-w-md">
            Memastikan keamanan dan keaslian akun Anda di platform kami.
          </p>
        </div>

        <div className="z-10 relative">
          <p className="text-sm font-medium text-sija-text/50">© 2024 Sija Learn. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Content */}
      <div className="w-full lg:w-1/2 flex flex-col items-center p-6 lg:p-24 pt-32 overflow-y-auto">
        <div className="w-full max-w-md text-center">

          {status === 'loading' && (
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 border-2 border-blue-500 rounded-full mb-8 animate-pulse">
                <Loader2 size={48} className="text-blue-600 animate-spin" />
              </div>
              <h1 className="text-3xl font-display font-black text-sija-text uppercase tracking-tight mb-4">Memverifikasi...</h1>
              <p className="text-sija-text/70 font-medium text-lg">Mohon tunggu sebentar, kami sedang memvalidasi token Anda.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 border-2 border-green-700 mb-8 shadow-hard">
                <CheckCircle size={48} className="text-white" />
              </div>
              <h1 className="text-3xl font-display font-black text-sija-text uppercase tracking-tight mb-4 items-center justify-center gap-2">
                Verifikasi Berhasil!
              </h1>
              <div className="bg-green-50 border-2 border-green-500 p-4 text-green-800 shadow-hard-sm mb-8 text-left">
                <p className="font-bold mb-1">Status: Terverifikasi</p>
                <p>{message}</p>
              </div>

              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center px-8 py-4 bg-sija-primary text-white font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider gap-2"
              >
                Login Sekarang <ArrowRight size={20} />
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-red-500 border-2 border-red-700 mb-8 shadow-hard">
                <XCircle size={48} className="text-white" />
              </div>
              <h1 className="text-3xl font-display font-black text-sija-text uppercase tracking-tight mb-4">Verifikasi Gagal</h1>
              <div className="bg-red-50 border-2 border-red-500 p-4 text-red-800 shadow-hard-sm mb-8 text-left">
                <p className="font-bold mb-1">Error Occurred</p>
                <p>{message}</p>
              </div>

              <Link
                href="/register"
                className="w-full inline-flex items-center justify-center px-8 py-4 bg-sija-primary text-white font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider gap-2"
              >
                Daftar Ulang <ArrowRight size={20} />
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
