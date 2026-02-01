// ============================================
// src/app/(auth)/forgot-password/page.tsx
// Forgot Password - Step 1: Enter Email
// ============================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { KeyRound, Mail } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center px-4 bg-sija-surface">
            <div className="max-w-md w-full bg-white p-8 border-2 border-sija-primary shadow-hard">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-sija-primary text-white mb-4 border-2 border-sija-primary shadow-hard-sm">
                        <KeyRound size={32} />
                    </div>
                    <h1 className="text-3xl font-display font-black text-sija-primary uppercase tracking-tight">
                        Lupa Password
                    </h1>
                    <p className="text-sija-text/70 font-medium mt-2">
                        Masukkan email untuk menerima kode OTP
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-2 border-red-500 text-red-700 px-4 py-3 mb-6 font-bold shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-blue-50 border-2 border-blue-500 text-blue-700 px-4 py-3 mb-6 font-medium text-sm">
                        <div className="flex items-start gap-2">
                            <Mail size={20} className="mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-bold mb-1">Masukkan email Anda</p>
                                <p>Kode OTP akan dikirim ke email yang terdaftar.</p>
                            </div>
                        </div>
                    </div>

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

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                        size="lg"
                    >
                        {loading ? 'Mengirim OTP...' : 'Kirim Kode OTP'}
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
