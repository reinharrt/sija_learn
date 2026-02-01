// ============================================
// src/app/(auth)/reset-password/page.tsx
// Reset Password - Step 3: Enter New Password
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { Lock } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center px-4 bg-sija-surface">
            <div className="max-w-md w-full bg-white p-8 border-2 border-sija-primary shadow-hard">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-sija-primary text-white mb-4 border-2 border-sija-primary shadow-hard-sm">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-3xl font-display font-black text-sija-primary uppercase tracking-tight">
                        Reset Password
                    </h1>
                    <p className="text-sija-text/70 font-medium mt-2">
                        Masukkan password baru Anda
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-2 border-red-500 text-red-700 px-4 py-3 mb-6 font-bold shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border-2 border-green-500 text-green-700 px-4 py-3 mb-6 font-bold shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
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

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                        size="lg"
                    >
                        {loading ? 'Mengubah Password...' : 'Ubah Password'}
                    </Button>
                </form>

                <p className="text-center mt-8 text-sija-text font-medium text-sm">
                    <Link href="/login" className="text-sija-primary hover:bg-sija-primary hover:text-white transition-all px-1 font-bold uppercase underline decoration-2 underline-offset-2">
                        Kembali ke Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
