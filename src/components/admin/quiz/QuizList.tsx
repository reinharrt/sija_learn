// ============================================
// src/components/admin/quiz/QuizList.tsx
// Quiz List Component - Display quizzes for a course
// ============================================

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Quiz, QuizType } from '@/types';
import { getAuthHeaders } from '@/contexts/AuthContext';
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
        if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
            return;
        }

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
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-600">Loading quizzes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
            </div>
        );
    }

    if (quizzes.length === 0) {
        return (
            <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No quizzes created yet</p>
                <Link
                    href={`/admin/courses/${courseId}/quizzes/create`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    Create Your First Quiz
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {quizzes.map((quiz) => (
                <div
                    key={quiz._id?.toString()}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-semibold text-gray-900">{quiz.title}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${quiz.type === QuizType.FINAL_QUIZ
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {quiz.type === QuizType.FINAL_QUIZ ? 'Final Quiz' : 'Article Quiz'}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${quiz.published
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {quiz.published ? 'Published' : 'Draft'}
                                </span>
                                {/* Assignment Status */}
                                {quiz.type === QuizType.ARTICLE_QUIZ && quiz.articleId && (
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 flex items-center gap-1">
                                        <Link2 className="w-3 h-3" />
                                        {getArticleName(quiz.articleId.toString())}
                                    </span>
                                )}
                                {quiz.type === QuizType.FINAL_QUIZ && (
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 flex items-center gap-1">
                                        <Award className="w-3 h-3" />
                                        Final Quiz
                                    </span>
                                )}
                                {!quiz.articleId && quiz.type === QuizType.ARTICLE_QUIZ && (
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                        Not Assigned
                                    </span>
                                )}
                            </div>
                            {quiz.description && (
                                <p className="text-gray-600 mb-3">{quiz.description}</p>
                            )}
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <FileText className="w-4 h-4" />
                                    <span>{quiz.questions.length} questions</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Target className="w-4 h-4" />
                                    <span>{quiz.passingScore}% to pass</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Award className="w-4 h-4" />
                                    <span>{quiz.xpReward} XP</span>
                                </div>
                                {quiz.timeLimit && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{quiz.timeLimit} min</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setAssigningQuiz(quiz)}
                                className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Assign Quiz"
                            >
                                <Link2 className="w-5 h-5" />
                            </button>
                            <Link
                                href={`/admin/quizzes/${quiz._id}/analytics`}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Analytics"
                            >
                                <BarChart3 className="w-5 h-5" />
                            </Link>
                            <Link
                                href={`/admin/quizzes/${quiz._id}/edit`}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Quiz"
                            >
                                <Edit className="w-5 h-5" />
                            </Link>
                            <button
                                onClick={() => handleDelete(quiz._id!.toString())}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
