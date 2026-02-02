// ============================================
// src/app/(auth)/reset-password/page.tsx
// Reset Password - Neobrutalist Split Layout
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const emailParam = searchParams.get('email');
        const otpParam = searchParams.get('otp');

        if (!emailParam || !otpParam) {
            router.push('/forgot-password');
        } else {
            setEmail(emailParam);
            setOtp(otpParam);
        }
    }, [searchParams, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setError('Password baru dan konfirmasi password tidak cocok');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/change-password/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    otp,
                    newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal mengubah password');
            }

            setSuccess(data.message);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push('/login');
            }, 2000);
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
                        New <br />
                        <span className="text-sija-primary relative">
                            Credentials
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-400 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                            </svg>
                        </span>
                    </h1>
                    <p className="text-xl text-sija-text/70 font-medium max-w-md">
                        Buat password baru yang kuat untuk melindungi akun Anda.
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
                        <h1 className="text-3xl font-display font-black text-sija-primary uppercase tracking-tight">Reset Password</h1>
                        <p className="text-sija-text/60 font-medium text-sm">Create a new password.</p>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-sija-text tracking-tight hidden lg:block">New Password</h2>
                        <p className="text-sija-text/60 font-medium hidden lg:block">Please enter your new password below.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-2 border-red-500 text-red-700 px-4 py-3 font-bold shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] flex items-start gap-2">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border-2 border-green-500 text-green-700 px-4 py-3 font-bold shadow-[4px_4px_0px_0px_rgba(34,197,94,1)] flex items-start gap-2">
                            <span>✓</span>
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 gap-5">
                            <Input
                                label="Password Baru"
                                type="password"
                                name="newPassword"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    setError('');
                                }}
                                placeholder="••••••••"
                                required
                            />

                            <Input
                                label="Konfirmasi Password Baru"
                                type="password"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setError('');
                                }}
                                placeholder="••••••••"
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
                                <span className="flex items-center gap-2 justify-center">Mengubah Password...</span>
                            ) : (
                                <span className="flex items-center gap-2 justify-center">
                                    Ubah Password <ArrowRight size={18} />
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
                        <Link href="/login" className="text-sija-primary hover:underline decoration-2 underline-offset-2 font-bold">
                            Kembali ke Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
