// src/app/quiz/[id]/page.tsx

'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import QuizTaker from '@/components/quiz/QuizTaker';

export default function QuizPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading } = useAuth();
    const quizId = params.id as string;

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-sija-background flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-sija-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-display font-bold text-xl text-sija-primary uppercase tracking-widest animate-pulse">Loading System...</p>
                </div>
            </div>
        );
    }

    return <QuizTaker quizId={quizId} />;
}
