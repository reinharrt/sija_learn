// src/app/admin/quizzes/[id]/edit/page.tsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import QuizBuilder from '@/components/admin/quiz/QuizBuilder';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function EditQuizPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading } = useAuth();
    const quizId = params.id as string;
    const [quiz, setQuiz] = useState<any>(null);
    const [loadingQuiz, setLoadingQuiz] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }

        if (!loading && user && user.role !== UserRole.ADMIN && user.role !== UserRole.COURSE_ADMIN) {
            router.push('/');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            loadQuiz();
        }
    }, [user, quizId]);

    const loadQuiz = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/quizzes/${quizId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setQuiz(data.quiz);
            }
        } catch (error) {
            console.error('Error loading quiz:', error);
        } finally {
            setLoadingQuiz(false);
        }
    };

    if (loading || loadingQuiz || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Quiz not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Quiz</h1>

                <QuizBuilder
                    initialQuiz={quiz}
                    courseId={quiz.courseId.toString()}
                    mode="edit"
                    onSuccess={() => router.back()}
                />
            </div>
        </div>
    );
}
