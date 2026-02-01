// ============================================
// src/app/(auth)/verify-otp/page.tsx
// Verify OTP - Step 2: Enter OTP Code
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { Shield } from 'lucide-react';

export default function VerifyOTPPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (!emailParam) {
            router.push('/forgot-password');
        } else {
            setEmail(emailParam);
        }
    }, [searchParams, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Just verify OTP is correct, don't change password yet
            const response = await fetch('/api/auth/change-password/verify-otp-only', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Kode OTP salah');
            }

            // Redirect to reset password page with email and OTP
            router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-sija-surface">
            <div className="max-w-md w-full bg-white p-8 border-2 border-sija-primary shadow-hard">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-sija-primary text-white mb-4 border-2 border-sija-primary shadow-hard-sm">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-3xl font-display font-black text-sija-primary uppercase tracking-tight">
                        Verifikasi OTP
                    </h1>
                    <p className="text-sija-text/70 font-medium mt-2">
                        Masukkan kode OTP yang dikirim ke email
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-2 border-red-500 text-red-700 px-4 py-3 mb-6 font-bold shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-blue-50 border-2 border-blue-500 text-blue-700 px-4 py-3 mb-4 font-medium text-sm">
                        <p>Kode OTP telah dikirim ke: <strong>{email}</strong></p>
                        <p className="text-xs mt-1">Kode berlaku selama 10 menit</p>
                    </div>

                    <Input
                        label="Kode OTP"
                        type="text"
                        name="otp"
                        value={otp}
                        onChange={(e) => {
                            setOtp(e.target.value);
                            setError('');
                        }}
                        placeholder="123456"
                        required
                    />

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                        size="lg"
                    >
                        {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
                    </Button>
                </form>

                <p className="text-center mt-8 text-sija-text font-medium text-sm">
                    <Link href="/forgot-password" className="text-sija-primary hover:bg-sija-primary hover:text-white transition-all px-1 font-bold uppercase underline decoration-2 underline-offset-2">
                        Kembali
                    </Link>
                </p>
            </div>
        </div>
    );
}
