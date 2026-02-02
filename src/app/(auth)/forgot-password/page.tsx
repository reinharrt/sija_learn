// ============================================
// src/app/(auth)/forgot-password/page.tsx
// Forgot Password - Neobrutalist Split Layout
// ============================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { KeyRound, Mail, Sparkles, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/change-password/request-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal mengirim OTP');
            }

            // Redirect to verify OTP page with email in URL
            router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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
                        Reset <br />
                        <span className="text-sija-primary relative">
                            Access
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-400 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                            </svg>
                        </span>
                    </h1>
                    <p className="text-xl text-sija-text/70 font-medium max-w-md">
                        Jangan khawatir. Kami akan membantu Anda mendapatkan kembali akses ke akun Anda.
                    </p>
                </div>

                <div className="z-10 relative">
                    <p className="text-sm font-medium text-sija-text/50">© 2024 Sija Learn. All rights reserved.</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center p-6 lg:p-24 pt-32 overflow-y-auto">
                <div className="w-full max-w-md space-y-8">
                    <div className="lg:hidden text-center mb-8">
                        <h1 className="text-3xl font-display font-black text-sija-primary uppercase tracking-tight">Lupa Password</h1>
                        <p className="text-sija-text/60 font-medium text-sm">Recover your account.</p>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-sija-text tracking-tight hidden lg:block">Recovery</h2>
                        <p className="text-sija-text/60 font-medium hidden lg:block">Enter your email to receive recovery instructions.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-2 border-red-500 text-red-700 px-4 py-3 font-bold shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] flex items-start gap-2">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-blue-50 border-2 border-blue-500 text-blue-900 px-4 py-3 mb-6 font-medium text-sm shadow-hard-sm">
                            <div className="flex items-start gap-3">
                                <Mail size={20} className="mt-0.5 flex-shrink-0 text-blue-600" />
                                <div>
                                    <p className="font-bold mb-1 uppercase tracking-wider text-blue-800">Instruksi</p>
                                    <p>Kode OTP akan dikirim ke email. Pastikan email aktif.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError('');
                                }}
                                placeholder="email@example.com"
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
                                <span className="flex items-center gap-2 justify-center">Mengirim OTP...</span>
                            ) : (
                                <span className="flex items-center gap-2 justify-center">
                                    Kirim Kode OTP <ArrowRight size={18} />
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
                        Ingat password Anda?{' '}
                        <Link href="/login" className="text-sija-primary hover:underline decoration-2 underline-offset-2 font-bold">
                            Kembali ke Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
