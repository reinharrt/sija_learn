// src/app/admin/courses/[id]/quizzes/page.tsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import QuizList from '@/components/admin/quiz/QuizList';
import { ArrowLeft, Plus, BookOpen, ListChecks } from 'lucide-react';
import { useEffect, useState } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';

export default function CourseQuizzesPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading } = useAuth();
    const courseId = params.id as string;

    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const courseSlug = searchParams.get('slug');
    const courseName = searchParams.get('name') || 'Course';

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
        if (!loading && user && user.role !== UserRole.ADMIN && user.role !== UserRole.COURSE_ADMIN) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading || !user || !isClient) {
        return (
            <div className="min-h-screen bg-sija-light flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-sija-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="font-bold text-sija-text uppercase tracking-wider">Loading...</p>
                </div>
            </div>
        );
    }

    const backUrl = courseSlug ? `/courses/${courseSlug}/edit` : `/admin/courses`;
    const createQuizUrl = `/admin/courses/${courseId}/quizzes/create${courseSlug ? `?slug=${courseSlug}` : ''}`;

    return (
        <div className="min-h-screen bg-sija-light py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Breadcrumb
                    items={[
                        {
                            label: 'Admin',
                            href: '/admin',
                            icon: <BookOpen size={16} strokeWidth={2.5} />
                        },
                        {
                            label: 'Courses',
                            href: '/admin/courses',
                        },
                        {
                            label: courseName,
                            href: backUrl,
                        },
                        {
                            label: 'Quizzes',
                            icon: <ListChecks size={16} strokeWidth={2.5} />
                        },
                    ]}
                />

                <div className="bg-sija-surface border-2 border-sija-primary shadow-hard p-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-sija-primary border-2 border-sija-primary">
                                    <ListChecks className="w-6 h-6 text-white" strokeWidth={2.5} />
                                </div>
                                <h1 className="font-display text-3xl md:text-4xl font-black text-sija-text uppercase">
                                    Manage Quizzes
                                </h1>
                            </div>
                            <p className="text-sija-text/60 font-medium ml-14">
                                Kelola kuis untuk course: <span className="font-bold text-sija-primary">{courseName}</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                                onClick={() => router.push(backUrl)}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-sija-surface text-sija-text font-bold border-2 border-sija-primary shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider text-sm flex-1 sm:flex-initial"
                            >
                                <ArrowLeft size={18} strokeWidth={2.5} />
                                Back
                            </button>

                            <button
                                onClick={() => router.push(createQuizUrl)}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-sija-primary text-white font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all uppercase tracking-wider text-sm flex-1 sm:flex-initial"
                            >
                                <Plus size={18} strokeWidth={2.5} />
                                Create Quiz
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-sija-surface border-2 border-sija-primary shadow-hard p-6">
                    <QuizList courseId={courseId} />
                </div>
            </div>
        </div>
    );
}