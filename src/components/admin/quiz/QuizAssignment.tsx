// src/components/admin/quiz/QuizAssignment.tsx

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
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-sija-surface border-4 border-sija-primary shadow-hard-lg max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b-4 border-sija-primary/10">
                    <h2 className="text-xl font-display font-black text-sija-text uppercase tracking-wide">
                        Assign Quiz
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-sija-text border-2 border-transparent hover:border-sija-border hover:text-sija-primary transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Quiz Info */}
                    <div className="mb-6 p-4 bg-sija-light border-2 border-sija-primary/20">
                        <h3 className="font-bold text-sija-text mb-1 uppercase tracking-wide text-sm">{quiz.title}</h3>
                        {quiz.description && (
                            <p className="text-sm text-sija-text/70 font-medium">{quiz.description}</p>
                        )}
                    </div>

                    {/* Mode Toggle */}
                    <div className="bg-sija-light p-1 border-2 border-sija-primary/20 flex mb-6">
                        <button
                            onClick={() => setMode('article')}
                            className={`flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wide transition-all ${mode === 'article'
                                ? 'bg-sija-primary text-white border-2 border-sija-primary shadow-hard-sm'
                                : 'text-sija-text/70 hover:text-sija-text border-2 border-transparent'
                                }`}
                        >
                            Assign to Article
                        </button>
                        <button
                            onClick={() => setMode('final')}
                            className={`flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wide transition-all ${mode === 'final'
                                ? 'bg-sija-primary text-white border-2 border-sija-primary shadow-hard-sm'
                                : 'text-sija-text/70 hover:text-sija-text border-2 border-transparent'
                                }`}
                        >
                            Set as Final Quiz
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-sija-primary" />
                        </div>
                    ) : (
                        <>
                            {/* Article Quiz Assignment */}
                            {mode === 'article' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-sija-text mb-2 uppercase tracking-wide">
                                        Select Article
                                    </label>
                                    <select
                                        value={selectedArticleId}
                                        onChange={(e) => setSelectedArticleId(e.target.value)}
                                        className="w-full px-4 py-3 bg-sija-surface border-2 border-sija-text/30 focus:border-sija-primary focus:outline-none transition-colors font-medium text-sija-text disabled:opacity-50 disabled:cursor-not-allowed"
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
                                        <p className="text-sm text-sija-text/60 mt-2 font-medium">
                                            No articles found in this course. Please add articles first.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Final Quiz Assignment */}
                            {mode === 'final' && (
                                <div className="mb-6">
                                    <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-500 shadow-hard-sm p-4">
                                        <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400 mb-2 uppercase tracking-wide">Final Course Assessment</h4>
                                        <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                                            This quiz will be set as the final assessment for the entire course.
                                            Students will need to complete it after finishing all course articles.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Success Message */}
                            {success && (
                                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 shadow-hard-sm flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-green-700 dark:text-green-300 font-bold">{success}</p>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 shadow-hard-sm flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700 dark:text-red-300 font-bold">{error}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t-4 border-sija-primary/10 bg-sija-light">
                    {/* Unassign button */}
                    {isAssigned && (
                        <button
                            onClick={handleUnassign}
                            disabled={submitting || loading}
                            className="px-5 py-3 text-red-600 dark:text-red-400 border-2 border-red-600 dark:border-red-500 bg-sija-surface hover:bg-red-50 dark:hover:bg-red-900/20 shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-hard-sm"
                        >
                            {submitting ? 'Unassigning...' : 'Unassign Current'}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="px-5 py-3 border-2 border-sija-text text-sija-text bg-sija-surface shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-hard-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={submitting || loading || !canAssign}
                        className="px-5 py-3 bg-sija-primary text-white border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-hard flex items-center gap-2"
                    >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {submitting ? 'Assigning...' : 'Assign Quiz'}
                    </button>
                </div>
            </div>
        </div>
    );
}
