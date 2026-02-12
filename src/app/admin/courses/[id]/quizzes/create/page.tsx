// src/app/admin/courses/[id]/quizzes/create/page.tsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import QuizBuilder from '@/components/admin/quiz/QuizBuilder';
import { ArrowLeft, BookOpen, ListChecks, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';

export default function CreateQuizPage() {
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

    const backUrl = `/admin/courses/${courseId}/quizzes${courseSlug ? `?slug=${courseSlug}&name=${courseName}` : ''}`;
    const courseEditUrl = courseSlug ? `/courses/${courseSlug}/edit` : `/admin/courses`;

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
                            href: courseEditUrl,
                        },
                        {
                            label: 'Quizzes',
                            href: backUrl,
                            icon: <ListChecks size={16} strokeWidth={2.5} />
                        },
                        {
                            label: 'Create Quiz',
                            icon: <Plus size={16} strokeWidth={2.5} />
                        },
                    ]}
                />

                <div className="bg-sija-surface border-2 border-sija-primary shadow-hard p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-sija-text uppercase tracking-tight">
                                Create New Quiz
                            </h1>
                            <p className="mt-2 text-sija-text/70 font-medium">
                                Build an engaging quiz for your course
                            </p>
                        </div>
                        <button
                            onClick={() => router.push(backUrl)}
                            className="group flex items-center gap-2 px-4 py-2 bg-white border-2 border-sija-text text-sija-text font-bold uppercase tracking-wide hover:bg-sija-light transition-all shadow-hard hover:shadow-harder hover:-translate-y-0.5"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" strokeWidth={2.5} />
                            Back
                        </button>
                    </div>
                </div>

                <QuizBuilder courseId={courseId} mode="create" />
            </div>
        </div>
    );
}