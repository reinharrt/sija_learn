// ============================================
// src/components/admin/quiz/QuizAssignment.tsx
// Quiz Assignment Component - Assign quizzes to articles or as final quiz
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { Quiz, QuizType } from '@/types';
import { getAuthHeaders } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Article {
    _id: string;
    title: string;
    slug: string;
    quizId: string | null;
}

interface QuizAssignmentProps {
    quiz: Quiz;
    courseId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function QuizAssignment({ quiz, courseId, onClose, onSuccess }: QuizAssignmentProps) {
    const { showConfirm } = useNotification();
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedArticleId, setSelectedArticleId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [mode, setMode] = useState<'article' | 'final'>(
        quiz.type === QuizType.FINAL_QUIZ ? 'final' : 'article'
    );

    useEffect(() => {
        loadArticles();
    }, []);

    const loadArticles = async () => {
        try {
            const response = await fetch(`/api/admin/courses/${courseId}/articles`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load articles');
            }

            setArticles(data.articles || []);

            // Pre-select the article if quiz is already assigned
            if (quiz.articleId) {
                setSelectedArticleId(quiz.articleId.toString());
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const body = mode === 'article'
                ? { assignType: 'article', articleId: selectedArticleId, courseId }
                : { assignType: 'final', courseId };

            const response = await fetch(`/api/admin/quizzes/${quiz._id}/assign`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to assign quiz');
            }

            setSuccess(data.message || 'Quiz assigned successfully');
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUnassign = async () => {
        const confirmed = await showConfirm({
            title: 'Unassign Quiz',
            message: 'Are you sure you want to unassign this quiz?',
            confirmText: 'Unassign',
            cancelText: 'Cancel',
            type: 'warning',
        });

        if (!confirmed) return;

        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const body = quiz.type === QuizType.ARTICLE_QUIZ
                ? { assignType: 'article', articleId: quiz.articleId?.toString(), courseId }
                : { assignType: 'final', courseId };

            const response = await fetch(`/api/admin/quizzes/${quiz._id}/assign`, {
                method: 'DELETE',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to unassign quiz');
            }

            setSuccess(data.message || 'Quiz unassigned successfully');
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const isAssigned = quiz.type === QuizType.ARTICLE_QUIZ ? !!quiz.articleId : !!courseId; // Wait, if type is FINAL, it is assigned by definition?
    // Actually, we should check if currently assigned.
    // If we switch modes, 'isAssigned' refers to the quiz's *current* state before changes
    // But we might want to unassign based on the MODE?
    // No, unassign removes the CURRENT assignment.

    // For "Assign", we use "canAssign".
    const canAssign = mode === 'article' ? !!selectedArticleId : true;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Assign Quiz
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Quiz Info */}
                    <div className="mb-6">
                        <h3 className="font-medium text-gray-900 mb-1">{quiz.title}</h3>
                        {quiz.description && (
                            <p className="text-sm text-gray-600">{quiz.description}</p>
                        )}
                    </div>

                    {/* Mode Toggle */}
                    <div className="bg-gray-100 p-1 rounded-lg flex mb-6">
                        <button
                            onClick={() => setMode('article')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === 'article'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Assign to Article
                        </button>
                        <button
                            onClick={() => setMode('final')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${mode === 'final'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Set as Final Quiz
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <>
                            {/* Article Quiz Assignment */}
                            {mode === 'article' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Article
                                    </label>
                                    <select
                                        value={selectedArticleId}
                                        onChange={(e) => setSelectedArticleId(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={submitting}
                                    >
                                        <option value="">-- Select an article --</option>
                                        {articles.map((article) => (
                                            <option key={article._id} value={article._id}>
                                                {article.title}
                                                {article.quizId && article.quizId !== quiz._id?.toString() && ' (Has quiz)'}
                                            </option>
                                        ))}
                                    </select>
                                    {articles.length === 0 && (
                                        <p className="text-sm text-gray-500 mt-2">
                                            No articles found in this course. Please add articles first.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Final Quiz Assignment */}
                            {mode === 'final' && (
                                <div className="mb-6">
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                        <h4 className="text-sm font-medium text-amber-900 mb-1">Final Course Assessment</h4>
                                        <p className="text-sm text-amber-700">
                                            This quiz will be set as the final assessment for the entire course.
                                            Students will need to complete it after finishing all course articles.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Success Message */}
                            {success && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-green-700">{success}</p>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    {/* Unassign button matches current quiz type logic, not selected mode */}
                    {isAssigned && (
                        <button
                            onClick={handleUnassign}
                            disabled={submitting || loading}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Unassigning...' : 'Unassign Current'}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={submitting || loading || !canAssign}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {submitting ? 'Assigning...' : 'Assign Quiz'}
                    </button>
                </div>
            </div>
        </div>
    );
}
