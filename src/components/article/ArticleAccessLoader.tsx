'use client';

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
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
                const res = await fetch(`/api/enrollments/${courseId}/progress`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        articleId,
                        wordCount: 0 // Initial access doesn't need precise word count for tracking
                    }),
                });

                if (!mounted) return;

                if (res.ok) {
                    setStatus('success');
                    setMessage('Progres tercatat!');

                    // Delay briefly to show success state before unlocking
                    timeoutId = setTimeout(() => {
                        if (mounted) {
                            onComplete();
                        }
                    }, 1000); // 1 second delay for smooth UX
                } else {
                    console.error('Tracking failed');
                    // If tracking fails but we reached the server, we might still want to let them read?
                    // For now, let's treat it as success for UX but log error, 
                    // OR show error and retry. Let's start with safe fail -> unlock
                    // But user requirement says "Only after progress tracking... should article content be unlocked"
                    // So on error, we should probably allow retry or just unlock if it's a non-critical error?
                    // Let's stick to "Only after... completed". So if it fails, maybe we show error.
                    setStatus('error');
                    setMessage('Gagal memverifikasi progres. Silakan coba lagi.');
                }
            } catch (error) {
                console.error('Tracking error:', error);
                if (mounted) {
                    setStatus('error');
                    setMessage('Terjadi kesalahan koneksi.');
                }
            }
        };

        // Small delay before starting to ensure user sees the "loading" intent? 
        // No, immediate is better for perceived performance.
        trackProgress();

        return () => {
            mounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [courseId, articleId, onComplete]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-sija-surface/90 backdrop-blur-sm">
            <div className="bg-white border-4 border-sija-text shadow-hard p-8 max-w-sm w-full mx-4 text-center">
                {status === 'loading' && (
                    <>
                        <Loader2 className="w-12 h-12 text-sija-primary animate-spin mx-auto mb-4" />
                        <h3 className="font-display font-black text-xl text-sija-text uppercase mb-2">
                            Mohon Tunggu
                        </h3>
                        <p className="text-sija-text font-medium animate-pulse">
                            {message}
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h3 className="font-display font-black text-xl text-sija-text uppercase mb-2">
                            Berhasil!
                        </h3>
                        <p className="text-sija-text font-medium">
                            {message}
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-500">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <h3 className="font-display font-black text-xl text-red-500 uppercase mb-2">
                            Gagal
                        </h3>
                        <p className="text-sija-text font-medium mb-6">
                            {message}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-sija-primary text-white font-bold py-3 border-4 border-sija-text shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider"
                        >
                            Coba Lagi
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
