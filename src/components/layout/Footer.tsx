'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset states
    setError('');
    setSuccess(false);

    // Basic validation
    if (!email.trim()) {
      setError('Email wajib diisi');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Format email tidak valid');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal berlangganan');
      }

      setSuccess(true);
      setEmail('');

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer
      className="bg-white dark:bg-gray-900 text-black dark:text-white border-t-4 border-black dark:border-white pt-16 pb-8 px-6 transition-colors"
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto" suppressHydrationWarning>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

          {/* Brand Section */}
          <div className="md:col-span-5">
            <div className="inline-block border-2 border-black dark:border-white px-3 py-1 bg-yellow-400 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              <h3 className="text-2xl font-black tracking-tighter text-black">SIJA.ID</h3>
            </div>
            <p className="font-bold text-lg leading-tight mb-6 max-w-xs">
              Platform belajar anak SIJA SMKN 1 Cimahi. <br />
              Simple, lugas, dan terarah.
            </p>
            {/* Social Media - Cleaner Version */}
            <div className="flex gap-3">
              {['IG', 'GH', 'YT'].map((item) => (
                <button
                  key={item}
                  className="h-10 w-10 border-2 border-black dark:border-white flex items-center justify-center font-bold hover:bg-yellow-400 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] bg-white dark:bg-gray-900"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Navigasi */}
          <div className="md:col-span-3">
            <h4 className="font-black uppercase mb-6 text-sm tracking-widest">Materi</h4>
            <ul className="space-y-3 font-bold text-gray-700 dark:text-gray-300">
              <li><Link href="/courses" className="hover:text-black dark:hover:text-white hover:underline decoration-2">Semua Kursus</Link></li>
              <li><Link href="/articles" className="hover:text-black dark:hover:text-white hover:underline decoration-2">Artikel Terbaru</Link></li>

            </ul>
          </div>

          {/* Newsletter / Info */}
          <div className="md:col-span-4">
            <h4 className="font-black uppercase mb-6 text-sm tracking-widest">Stay Updated</h4>

            {success ? (
              <div className="border-2 border-black dark:border-white bg-green-400 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                <p className="font-black text-black text-sm">
                  ✓ Berhasil! Cek email kamu.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe}>
                <div className="flex border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  <input
                    type="email"
                    placeholder="Email kamu..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full p-2 font-bold outline-none bg-white dark:bg-gray-800 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-yellow-400 border-l-2 border-black dark:border-white px-4 font-black uppercase text-xs text-black hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '...' : 'Sub'}
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-sm font-bold text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t-2 border-black dark:border-white flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-bold text-sm italic">
            &copy; {new Date().getFullYear()} Kelompok 5 SIJA.
          </p>
          <div className="flex gap-4 font-black text-[10px] uppercase tracking-widest">
            <span className="bg-black dark:bg-white text-white dark:text-black px-2 py-0.5">SMKN 1 Cimahi</span>
            <span className="border-2 border-black dark:border-white px-2 py-0.5">V.1.0-2024</span>
          </div>
        </div>
      </div>
    </footer>
  );
}