// src/components/admin/quiz/QuizList.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Quiz, QuizType } from '@/types';
import { getAuthHeaders } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { Edit, Trash2, BarChart3, FileText, Award, Clock, Target, Link2 } from 'lucide-react';
import QuizAssignment from './QuizAssignment';

interface Article {
    _id: string;
    title: string;
    slug: string;
    quizId: string | null;
}

interface QuizListProps {
    courseId: string;
}

export default function QuizList({ courseId }: QuizListProps) {
    const { showToast, showConfirm } = useNotification();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [assigningQuiz, setAssigningQuiz] = useState<Quiz | null>(null);

    useEffect(() => {
        loadQuizzes();
        loadArticles();
    }, [courseId]);

    const loadQuizzes = async () => {
        try {
            const response = await fetch(`/api/admin/courses/${courseId}/quizzes`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load quizzes');
            }

            setQuizzes(data.quizzes || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadArticles = async () => {
        try {
            const response = await fetch(`/api/admin/courses/${courseId}/articles`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();

            if (response.ok) {
                setArticles(data.articles || []);
            }
        } catch (err: any) {
            console.error('Error loading articles:', err);
        }
    };

    const getArticleName = (articleId: string | undefined) => {
        if (!articleId) return null;
        const article = articles.find(a => a._id === articleId.toString());
        return article?.title || 'Unknown Article';
    };

    const handleDelete = async (quizId: string) => {
        const confirmed = await showConfirm({
            title: 'Delete Quiz',
            message: 'Are you sure you want to delete this quiz? This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger',
        });

        if (!confirmed) return;

        try {
            const response = await fetch(`/api/admin/quizzes/${quizId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete quiz');
            }

            setQuizzes(quizzes.filter(q => q._id?.toString() !== quizId));
        } catch (err: any) {
            showToast('error', err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-sija-text/70 font-medium">Loading quizzes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 shadow-hard-sm text-red-700 dark:text-red-400">
                <p className="font-bold uppercase text-sm mb-1">Error</p>
                <p>{error}</p>
            </div>
        );
    }

    if (quizzes.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="inline-block p-6 bg-sija-light border-2 border-sija-primary/20 mb-6">
                    <FileText className="w-16 h-16 text-sija-primary/40 mx-auto" />
                </div>
                <p className="text-sija-text/70 font-medium mb-6 text-lg">No quizzes created yet</p>
                <Link
                    href={`/admin/courses/${courseId}/quizzes/create`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-sija-primary text-white border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-wider"
                >
                    Create Your First Quiz
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {quizzes.map((quiz) => (
                <div
                    key={quiz._id?.toString()}
                    className="bg-sija-surface border-2 border-sija-primary shadow-hard hover:shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all p-6"
                >
                    <div className="flex items-start justify-between mb-4 pb-4 border-b-2 border-sija-primary/10">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <h3 className="text-xl font-display font-black text-sija-text uppercase tracking-wide">{quiz.title}</h3>
                                <span className={`px-3 py-1 border-2 text-xs font-bold uppercase ${quiz.type === QuizType.FINAL_QUIZ
                                    ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-600 text-purple-700 dark:text-purple-400'
                                    : 'bg-blue-100 dark:bg-blue-900/30 border-blue-600 text-blue-700 dark:text-blue-400'
                                    }`}>
                                    {quiz.type === QuizType.FINAL_QUIZ ? 'Final Quiz' : 'Article Quiz'}
                                </span>
                                <span className={`px-3 py-1 border-2 text-xs font-bold uppercase ${quiz.published
                                    ? 'bg-green-100 dark:bg-green-900/30 border-green-600 text-green-700 dark:text-green-400'
                                    : 'bg-gray-100 dark:bg-gray-800 border-gray-600 text-gray-700 dark:text-gray-400'
                                    }`}>
                                    {quiz.published ? 'Published' : 'Draft'}
                                </span>
                                {/* Assignment Status */}
                                {quiz.type === QuizType.ARTICLE_QUIZ && quiz.articleId && (
                                    <span className="px-3 py-1 border-2 text-xs font-bold uppercase bg-indigo-100 dark:bg-indigo-900/30 border-indigo-600 text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                                        <Link2 className="w-3 h-3" />
                                        {getArticleName(quiz.articleId.toString())}
                                    </span>
                                )}
                                {quiz.type === QuizType.FINAL_QUIZ && (
                                    <span className="px-3 py-1 border-2 text-xs font-bold uppercase bg-amber-100 dark:bg-amber-900/30 border-amber-600 text-amber-700 dark:text-amber-400 flex items-center gap-1">
                                        <Award className="w-3 h-3" />
                                        Final Quiz
                                    </span>
                                )}
                                {!quiz.articleId && quiz.type === QuizType.ARTICLE_QUIZ && (
                                    <span className="px-3 py-1 border-2 text-xs font-bold uppercase bg-gray-100 dark:bg-gray-800 border-gray-500 text-gray-600 dark:text-gray-400">
                                        Not Assigned
                                    </span>
                                )}
                            </div>
                            {quiz.description && (
                                <p className="text-sija-text/70 mb-4 font-medium">{quiz.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm flex-wrap">
                                <div className="flex items-center gap-2 bg-sija-light px-3 py-2 border-2 border-sija-primary/20">
                                    <FileText className="w-4 h-4 text-sija-primary" />
                                    <span className="font-bold text-sija-text">{quiz.questions.length} questions</span>
                                </div>
                                <div className="flex items-center gap-2 bg-sija-light px-3 py-2 border-2 border-sija-primary/20">
                                    <Target className="w-4 h-4 text-sija-primary" />
                                    <span className="font-bold text-sija-text">{quiz.passingScore}% pass</span>
                                </div>
                                <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-2 border-2 border-yellow-600">
                                    <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                    <span className="font-bold text-yellow-700 dark:text-yellow-400">{quiz.xpReward} XP</span>
                                </div>
                                {quiz.timeLimit && (
                                    <div className="flex items-center gap-2 bg-sija-light px-3 py-2 border-2 border-sija-primary/20">
                                        <Clock className="w-4 h-4 text-sija-primary" />
                                        <span className="font-bold text-sija-text">{quiz.timeLimit} min</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            <button
                                onClick={() => setAssigningQuiz(quiz)}
                                className="p-2 text-sija-text border-2 border-sija-text/20 bg-sija-surface hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                title="Assign Quiz"
                            >
                                <Link2 className="w-5 h-5" />
                            </button>
                            <Link
                                href={`/admin/quizzes/${quiz._id}/analytics`}
                                className="p-2 text-sija-text border-2 border-sija-text/20 bg-sija-surface hover:border-sija-primary hover:text-sija-primary hover:bg-sija-light transition-colors"
                                title="View Analytics"
                            >
                                <BarChart3 className="w-5 h-5" />
                            </Link>
                            <Link
                                href={`/admin/quizzes/${quiz._id}/edit`}
                                className="p-2 text-sija-text border-2 border-sija-text/20 bg-sija-surface hover:border-sija-primary hover:text-sija-primary hover:bg-sija-light transition-colors"
                                title="Edit Quiz"
                            >
                                <Edit className="w-5 h-5" />
                            </Link>
                            <button
                                onClick={() => handleDelete(quiz._id!.toString())}
                                className="p-2 text-sija-text border-2 border-sija-text/20 bg-sija-surface hover:border-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Delete Quiz"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Assignment Modal */}
            {assigningQuiz && (
                <QuizAssignment
                    quiz={assigningQuiz}
                    courseId={courseId}
                    onClose={() => setAssigningQuiz(null)}
                    onSuccess={() => {
                        loadQuizzes();
                        loadArticles();
                    }}
                />
            )}
        </div>
    );
}
