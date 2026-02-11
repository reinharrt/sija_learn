// src/app/admin/courses/[id]/quizzes/create/page.tsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import QuizBuilder from '@/components/admin/quiz/QuizBuilder';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function CreateQuizPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading } = useAuth();
    const courseId = params.id as string;

    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const courseSlug = searchParams.get('slug');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }

        if (!loading && user && user.role !== UserRole.ADMIN && user.role !== UserRole.COURSE_ADMIN) {
            router.push('/');
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

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => router.push(`/admin/courses/${courseId}/quizzes${courseSlug ? `?slug=${courseSlug}` : ''}`)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Quizzes
                </button>

                <QuizBuilder courseId={courseId} mode="create" />
            </div>
        </div>
    );
}
