// ============================================
// src/app/(auth)/verify-otp/page.tsx
// Verify OTP - Neobrutalist Split Layout with Dark Mode
// ============================================

'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/common/Button';
import { Shield, Sparkles, ArrowRight } from 'lucide-react';

function VerifyOTPContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (!emailParam) {
            router.push('/forgot-password');
        } else {
            setEmail(emailParam);
        }
    }, [searchParams, router]);

    const handleChange = (index: number, value: string) => {
        // Only allow numbers
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only take the last character
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);
        
        // Focus the next empty input or the last one
        const nextIndex = Math.min(pastedData.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join('');
        
        if (otpString.length !== 6) {
            setError('Masukkan kode OTP 6 digit');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Just verify OTP is correct, don't change password yet
            const response = await fetch('/api/auth/change-password/verify-otp-only', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp: otpString }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Kode OTP salah');
            }

            // Redirect to reset password page with email and OTP
            router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${otpString}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-sija-background transition-colors duration-300">
            {/* Left Side - Hero / Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-sija-surface bg-grid-pattern border-r-2 border-sija-border flex-col justify-between p-12 relative overflow-hidden transition-colors duration-300">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 p-32 bg-sija-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 p-24 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-300"></div>

                <div className="z-10 relative">
                    <div className="inline-flex items-center gap-2 bg-sija-background px-4 py-2 border-2 border-sija-primary shadow-hard-sm mb-8 transition-colors duration-300">
                        <Sparkles size={18} className="text-sija-primary fill-sija-primary" />
                        <span className="font-bold uppercase tracking-wider text-xs text-sija-text">Sija Learn Platform</span>
                    </div>

                    <h1 className="text-6xl font-display font-black text-sija-text leading-tight mb-6 uppercase transition-colors duration-300">
                        Secure <br />
                        <span className="text-sija-primary relative">
                            Verify
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-400 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                            </svg>
                        </span>
                    </h1>
                    <p className="text-xl text-sija-text/70 font-medium max-w-md transition-colors duration-300">
                        Keamanan akun Anda adalah prioritas kami. Verifikasi identitas Anda untuk melanjutkan.
                    </p>
                </div>

                <div className="z-10 relative">
                    <p className="text-sm font-medium text-sija-text/50 transition-colors duration-300">© 2024 Sija Learn. All rights reserved.</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center p-6 lg:p-24 pt-32 overflow-y-auto bg-sija-background transition-colors duration-300">
                <div className="w-full max-w-md space-y-8">
                    <div className="lg:hidden text-center mb-8">
                        <h1 className="text-3xl font-display font-black text-sija-primary uppercase tracking-tight">Verifikasi OTP</h1>
                        <p className="text-sija-text/60 font-medium text-sm transition-colors duration-300">Verify your identity.</p>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-sija-text tracking-tight hidden lg:block transition-colors duration-300">Verifikasi Kode</h2>
                        <p className="text-sija-text/60 font-medium hidden lg:block transition-colors duration-300">Masukkan kode OTP yang telah dikirim.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-500 text-red-700 dark:text-red-400 px-4 py-3 font-bold shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] flex items-start gap-2 transition-colors duration-300">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-500 text-blue-900 dark:text-blue-300 px-4 py-3 mb-4 font-medium text-sm shadow-hard-sm transition-colors duration-300">
                            <p>Kode OTP telah dikirim ke: <strong>{email}</strong></p>
                            <p className="text-xs mt-1 text-blue-800 dark:text-blue-400">Kode berlaku selama 10 menit</p>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-sija-text uppercase tracking-wider transition-colors duration-300">
                                Kode OTP
                            </label>
                            <div className="flex gap-2 justify-between">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={index === 0 ? handlePaste : undefined}
                                        className="w-full aspect-square text-center text-2xl font-bold border-2 border-sija-border bg-sija-background text-sija-text focus:border-sija-primary focus:outline-none shadow-hard-sm focus:shadow-hard transition-all duration-200"
                                        required
                                    />
                                ))}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                            size="lg"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2 justify-center">Memverifikasi...</span>
                            ) : (
                                <span className="flex items-center gap-2 justify-center">
                                    Verifikasi OTP <ArrowRight size={18} />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t-2 border-sija-border transition-colors duration-300" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-sija-background px-2 text-sija-text/50 font-bold tracking-wider transition-colors duration-300">Atau</span>
                        </div>
                    </div>

                    <p className="text-center font-medium text-sija-text transition-colors duration-300">
                        Salah email?{' '}
                        <Link href="/forgot-password" className="text-sija-primary hover:underline decoration-2 underline-offset-2 font-bold">
                            Kembali
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen w-full flex items-center justify-center bg-sija-background transition-colors duration-300">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-sija-primary border-t-transparent"></div>
            </div>
        }>
            <VerifyOTPContent />
        </Suspense>
    );
}