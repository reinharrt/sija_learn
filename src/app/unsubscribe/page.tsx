'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Token tidak valid');
            setLoading(false);
            return;
        }

        const handleUnsubscribe = async () => {
            try {
                const response = await fetch('/api/unsubscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Gagal berhenti berlangganan');
                }

                setSuccess(true);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
            } finally {
                setLoading(false);
            }
        };

        handleUnsubscribe();
    }, [token]);

    return (
        <div className="min-h-screen bg-grid-pattern flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-gray-900 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-8">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-block border-2 border-black dark:border-white px-3 py-1 bg-yellow-400 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                            <h1 className="text-2xl font-black tracking-tighter text-black">SIJA.ID</h1>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block h-12 w-12 border-4 border-black dark:border-white border-t-transparent dark:border-t-transparent animate-spin mb-4"></div>
                            <p className="font-bold text-lg">Memproses...</p>
                        </div>
                    ) : success ? (
                        <div>
                            <div className="bg-green-400 border-2 border-black dark:border-white p-6 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                                <p className="font-black text-black text-center text-xl mb-2 flex items-center justify-center gap-2">
                                    <CheckCircle className="w-6 h-6" />
                                    Berhasil!
                                </p>
                                <p className="font-bold text-black text-center">
                                    Kamu sudah berhenti berlangganan newsletter SIJA.ID
                                </p>
                            </div>

                            <p className="font-bold text-center mb-6 text-gray-700 dark:text-gray-300">
                                Kamu tidak akan menerima email notifikasi lagi dari kami.
                            </p>

                            <Link
                                href="/"
                                className="block w-full bg-yellow-400 border-2 border-black dark:border-white px-6 py-3 font-black uppercase text-center text-black hover:bg-yellow-300 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
                            >
                                Kembali ke Beranda
                            </Link>
                        </div>
                    ) : (
                        <div>
                            <div className="bg-red-400 border-2 border-black dark:border-white p-6 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                                <p className="font-black text-black text-center text-xl mb-2 flex items-center justify-center gap-2">
                                    <XCircle className="w-6 h-6" />
                                    Gagal
                                </p>
                                <p className="font-bold text-black text-center">
                                    {error}
                                </p>
                            </div>

                            <Link
                                href="/"
                                className="block w-full bg-yellow-400 border-2 border-black dark:border-white px-6 py-3 font-black uppercase text-center text-black hover:bg-yellow-300 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
                            >
                                Kembali ke Beranda
                            </Link>
                        </div>
                    )}
                </div>

                {success && (
                    <div className="mt-6 text-center">
                        <p className="font-bold text-sm text-gray-600 dark:text-gray-400">
                            Berubah pikiran? Kamu bisa berlangganan lagi kapan saja di footer website.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function UnsubscribePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-grid-pattern flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white dark:bg-gray-900 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-8 text-center">
                    <div className="inline-block h-12 w-12 border-4 border-black dark:border-white border-t-transparent dark:border-t-transparent animate-spin mb-4"></div>
                    <p className="font-bold text-lg">Memuat...</p>
                </div>
            </div>
        }>
            <UnsubscribeContent />
        </Suspense>
    );
}
