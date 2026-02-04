// ============================================
// src/components/article/ArticleAccessLoader.tsx
// Article Access Loader - Progress tracking overlay
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { getAuthHeaders } from '@/contexts/AuthContext';

interface ArticleAccessLoaderProps {
    courseId: string;
    articleId: string;
    onComplete: () => void;
}

export default function ArticleAccessLoader({
    courseId,
    articleId,
    onComplete
}: ArticleAccessLoaderProps) {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Memverifikasi progres...');

    useEffect(() => {
        let mounted = true;
        let timeoutId: NodeJS.Timeout;

        const trackProgress = async () => {
            try {
                console.log('📤 Tracking progress — courseId:', courseId, '| articleId:', articleId);

                const res = await fetch(`/api/enrollments/${courseId}/progress`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        articleId,
                        wordCount: 0,
                    }),
                });

                const data = await res.json();
                console.log('📥 Progress response — status:', res.status, '| body:', data);

                if (!mounted) return;

                if (res.ok) {
                    setStatus('success');
                    setMessage('Progres tercatat!');

                    timeoutId = setTimeout(() => {
                        if (mounted) {
                            onComplete();
                        }
                    }, 1000);
                } else {
                    console.error('❌ Tracking failed —', res.status, data.error);
                    setStatus('error');
                    setMessage(data.error || 'Gagal memverifikasi progres. Silakan coba lagi.');
                }
            } catch (error) {
                console.error('❌ Tracking error:', error);
                if (mounted) {
                    setStatus('error');
                    setMessage('Terjadi kesalahan koneksi.');
                }
            }
        };

        trackProgress();

        return () => {
            mounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [courseId, articleId, onComplete]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-sija-surface/90 backdrop-blur-sm">
            <div className="bg-sija-surface border-4 border-sija-border shadow-hard p-8 max-w-sm w-full mx-4 text-center transition-colors duration-300">
                {status === 'loading' && (
                    <>
                        <Loader2 className="w-12 h-12 text-sija-primary animate-spin mx-auto mb-4" />
                        <h3 className="font-display font-black text-xl text-sija-text uppercase mb-2 transition-colors duration-300">
                            Mohon Tunggu
                        </h3>
                        <p className="text-sija-text/70 font-medium animate-pulse transition-colors duration-300">
                            {message}
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h3 className="font-display font-black text-xl text-sija-text uppercase mb-2 transition-colors duration-300">
                            Berhasil!
                        </h3>
                        <p className="text-sija-text/70 font-medium transition-colors duration-300">
                            {message}
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-950/30 border-2 border-red-500 dark:border-red-400 flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                            <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
                        </div>
                        <h3 className="font-display font-black text-xl text-red-500 dark:text-red-400 uppercase mb-2 transition-colors duration-300">
                            Gagal
                        </h3>
                        <p className="text-sija-text/70 font-medium mb-6 transition-colors duration-300">
                            {message}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full inline-flex items-center justify-center gap-2 bg-sija-primary text-white font-bold py-3 border-4 border-sija-border shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Coba Lagi
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}