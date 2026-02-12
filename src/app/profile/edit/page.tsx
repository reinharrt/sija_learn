'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Mail, User, AlertCircle, CheckCircle, Lock, KeyRound, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

export default function EditProfilePage() {
    const { user, loading, logout, updateUser } = useAuth();
    const router = useRouter();

    // Profile update states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Password change states
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [otpCountdown, setOtpCountdown] = useState(0);
    const [logoutCountdown, setLogoutCountdown] = useState(0);

    // Refs to track if countdowns were actually started
    const otpCountdownStarted = useRef(false);
    const logoutCountdownStarted = useRef(false);

    useEffect(() => {
        // Don't redirect while still loading auth state
        if (loading) return;

        if (!user) {
            router.push('/login');
            return;
        }
        setName(user.name);
        setEmail(user.email);
    }, [user, loading, router]);

    // OTP countdown timer (10 minutes = 600 seconds)
    useEffect(() => {
        if (otpCountdown > 0) {
            otpCountdownStarted.current = true;
            const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (otpCountdown === 0 && otpSent && otpCountdownStarted.current) {
            setOtpSent(false);
            setPasswordError('OTP telah kadaluarsa. Silakan minta OTP baru.');
            otpCountdownStarted.current = false;
        }
    }, [otpCountdown, otpSent]);

    // Logout countdown timer (5 seconds)
    useEffect(() => {
        if (logoutCountdown > 0) {
            logoutCountdownStarted.current = true;
            const timer = setTimeout(() => setLogoutCountdown(logoutCountdown - 1), 1000);
            return () => clearTimeout(timer);
        }
        // Only logout when countdown reaches exactly 0 from 1 (not initial 0)
        if (logoutCountdown === 0 && logoutCountdownStarted.current) {
            handleLogoutAfterPasswordChange();
            logoutCountdownStarted.current = false;
        }
    }, [logoutCountdown]);

    const handleLogoutAfterPasswordChange = async () => {
        await logout();
        router.push('/login?message=password_changed');
    };

    const handleRequestOTP = async () => {
        setIsPasswordLoading(true);
        setPasswordError('');
        setPasswordSuccess('');

        try {
            const res = await fetch('/api/auth/change-password/request-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user?.email })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Gagal mengirim OTP');
            }

            setOtpSent(true);
            setOtpCountdown(600); // 10 minutes
            setPasswordSuccess('OTP telah dikirim ke email Anda. Berlaku selama 10 menit.');
        } catch (err: any) {
            setPasswordError(err.message);
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPasswordLoading(true);
        setPasswordError('');
        setPasswordSuccess('');

        // Validation
        if (!otp || otp.length !== 6) {
            setPasswordError('Kode OTP harus 6 digit');
            setIsPasswordLoading(false);
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError('Password baru minimal 8 karakter');
            setIsPasswordLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Password baru dan konfirmasi tidak cocok');
            setIsPasswordLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/change-password/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user?.email,
                    otp,
                    newPassword
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Gagal mengubah password');
            }

            setPasswordSuccess('Password berhasil diubah! Anda akan logout dalam 5 detik...');
            setLogoutCountdown(5);

            setOtp('');
            setNewPassword('');
            setConfirmPassword('');
            setOtpSent(false);
            setOtpCountdown(0);
        } catch (err: any) {
            setPasswordError(err.message);
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/profile/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, email })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            setSuccessMessage(data.message);

            if (data.requiresReLogin) {
                setTimeout(async () => {
                    await logout();
                    router.push('/login?message=email_updated');
                }, 3000);
            } else {
                updateUser({ name });
                // No reload needed
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-grid-pattern flex items-center justify-center">
                <Loader2 size={48} className="animate-spin text-sija-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-grid-pattern pt-24 pb-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-sija-surface text-sija-text border-2 border-sija-primary shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold"
                >
                    <ArrowLeft size={20} />
                    Back to Home
                </Link>

                {/* Profile Update Card */}
                <div className="bg-sija-surface border-4 border-sija-primary shadow-hard p-8 mb-6">
                    <h1 className="text-4xl font-black text-sija-text mb-2 uppercase">
                        Edit Profile
                    </h1>
                    <p className="text-sija-text/70 mb-8 font-medium">
                        Update your account information
                    </p>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-100 border-3 border-red-600 p-4 mb-6 flex items-start gap-3">
                            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="text-red-900 font-bold text-sm">Error</p>
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                        <div className="bg-green-100 border-3 border-green-600 p-4 mb-6 flex items-start gap-3">
                            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="text-green-900 font-bold text-sm">Success</p>
                                <p className="text-green-800 text-sm">{successMessage}</p>
                                {successMessage.includes('email') && (
                                    <p className="text-green-800 text-sm font-bold mt-1">
                                        Redirecting to login...
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Field */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-black text-sija-text mb-2 uppercase tracking-wide">
                                <User size={18} />
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-sija-surface text-sija-text border-3 border-sija-primary focus:border-sija-dark outline-none font-medium shadow-hard-sm focus:shadow-hard transition-all"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-black text-sija-text mb-2 uppercase tracking-wide">
                                <Mail size={18} />
                                Email Address
                            </label>
                            <div className="bg-yellow-50 border-2 border-yellow-600 p-3 mb-2">
                                <p className="text-yellow-900 text-xs font-bold flex items-center gap-2">
                                    <AlertCircle size={14} />
                                    Changing email requires re-verification.
                                </p>
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-sija-surface text-sija-text border-3 border-sija-primary focus:border-sija-dark outline-none font-medium shadow-hard-sm focus:shadow-hard transition-all"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 px-6 py-3 bg-sija-surface text-sija-text border-3 border-sija-text/30 shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-black uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-6 py-3 bg-sija-primary text-white border-3 border-sija-dark shadow-hard hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all font-black uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                disabled={isLoading}
                            >
                                {isLoading && <Loader2 size={20} className="animate-spin" />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>

                {/* Password Change Card */}
                <div className="bg-sija-surface border-4 border-sija-primary shadow-hard p-8 mb-6">
                    <button
                        type="button"
                        onClick={() => setShowPasswordSection(!showPasswordSection)}
                        className="w-full flex items-center justify-between mb-4"
                    >
                        <div className="flex items-center gap-3">
                            <Shield className="text-sija-primary" size={32} />
                            <div className="text-left">
                                <h2 className="text-2xl font-black text-sija-text uppercase">
                                    Change Password
                                </h2>
                                <p className="text-sija-text/70 text-sm font-medium">
                                    Update your password using OTP verification
                                </p>
                            </div>
                        </div>
                        {showPasswordSection ? (
                            <ChevronUp className="text-sija-primary" size={24} />
                        ) : (
                            <ChevronDown className="text-sija-primary" size={24} />
                        )}
                    </button>

                    {showPasswordSection && (
                        <div className="pt-4 border-t-3 border-sija-primary/20">
                            {/* Password Error Message */}
                            {passwordError && (
                                <div className="bg-red-100 border-3 border-red-600 p-4 mb-6 flex items-start gap-3">
                                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <p className="text-red-900 font-bold text-sm">Error</p>
                                        <p className="text-red-800 text-sm">{passwordError}</p>
                                    </div>
                                </div>
                            )}

                            {/* Password Success Message */}
                            {passwordSuccess && (
                                <div className="bg-green-100 border-3 border-green-600 p-4 mb-6 flex items-start gap-3">
                                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <p className="text-green-900 font-bold text-sm">Success</p>
                                        <p className="text-green-800 text-sm">{passwordSuccess}</p>
                                        {logoutCountdown > 0 && (
                                            <p className="text-green-800 text-sm font-bold mt-1">
                                                Logout dalam {logoutCountdown} detik...
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 1: Request OTP */}
                            {!otpSent && (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 border-2 border-blue-600 p-4">
                                        <p className="text-blue-900 text-sm font-bold flex items-center gap-2">
                                            <Mail size={16} />
                                            OTP akan dikirim ke: {user?.email}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRequestOTP}
                                        disabled={isPasswordLoading}
                                        className="w-full px-6 py-3 bg-sija-primary text-white border-3 border-sija-dark shadow-hard hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all font-black uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isPasswordLoading && <Loader2 size={20} className="animate-spin" />}
                                        <KeyRound size={20} />
                                        Kirim OTP ke Email
                                    </button>
                                </div>
                            )}

                            {/* Step 2: Verify OTP and Change Password */}
                            {otpSent && (
                                <form onSubmit={handleChangePassword} className="space-y-6">
                                    {/* OTP Countdown */}
                                    <div className="bg-yellow-50 border-2 border-yellow-600 p-4">
                                        <p className="text-yellow-900 text-sm font-bold flex items-center gap-2">
                                            <AlertCircle size={16} />
                                            OTP berlaku selama: {formatTime(otpCountdown)}
                                        </p>
                                    </div>

                                    {/* OTP Input */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-black text-sija-text mb-2 uppercase tracking-wide">
                                            <KeyRound size={18} />
                                            Kode OTP (6 Digit)
                                        </label>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="123456"
                                            maxLength={6}
                                            className="w-full px-4 py-3 bg-sija-surface text-sija-text border-3 border-sija-primary focus:border-sija-dark outline-none font-medium shadow-hard-sm focus:shadow-hard transition-all text-center text-2xl tracking-widest"
                                            required
                                            disabled={isPasswordLoading}
                                        />
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-black text-sija-text mb-2 uppercase tracking-wide">
                                            <Lock size={18} />
                                            Password Baru
                                        </label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Minimal 8 karakter"
                                            className="w-full px-4 py-3 bg-sija-surface text-sija-text border-3 border-sija-primary focus:border-sija-dark outline-none font-medium shadow-hard-sm focus:shadow-hard transition-all"
                                            required
                                            disabled={isPasswordLoading}
                                        />
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-black text-sija-text mb-2 uppercase tracking-wide">
                                            <Lock size={18} />
                                            Konfirmasi Password
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Ulangi password baru"
                                            className="w-full px-4 py-3 bg-sija-surface text-sija-text border-3 border-sija-primary focus:border-sija-dark outline-none font-medium shadow-hard-sm focus:shadow-hard transition-all"
                                            required
                                            disabled={isPasswordLoading}
                                        />
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOtpSent(false);
                                                setOtp('');
                                                setNewPassword('');
                                                setConfirmPassword('');
                                                setOtpCountdown(0);
                                                setPasswordError('');
                                                setPasswordSuccess('');
                                            }}
                                            className="flex-1 px-6 py-3 bg-sija-surface text-sija-text border-3 border-sija-text/30 shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-black uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={isPasswordLoading}
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-6 py-3 bg-sija-primary text-white border-3 border-sija-dark shadow-hard hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all font-black uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            disabled={isPasswordLoading}
                                        >
                                            {isPasswordLoading && <Loader2 size={20} className="animate-spin" />}
                                            Ubah Password
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>

                {/* Info Box */}
                <div className="bg-sija-light border-3 border-sija-primary p-6">
                    <h3 className="font-black text-sija-text mb-2 uppercase">Important Notes</h3>
                    <ul className="space-y-2 text-sm text-sija-text/80 font-medium">
                        <li className="flex items-start gap-2">
                            <span className="text-sija-primary font-black">•</span>
                            <span>Changing your name will update it across all your content</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-sija-primary font-black">•</span>
                            <span>Email changes require verification and you'll be logged out</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-sija-primary font-black">•</span>
                            <span>Password changes require OTP verification sent to your email</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-sija-primary font-black">•</span>
                            <span>You'll be automatically logged out after changing your password</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
