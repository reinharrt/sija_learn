// ============================================
// src/app/quiz/[id]/page.tsx
// Student Page - Take Quiz
// ============================================

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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return <QuizTaker quizId={quizId} />;
}
