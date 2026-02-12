// src/app/quiz/[id]/review/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, Award, TrendingUp, ArrowLeft, RotateCcw, Lightbulb } from 'lucide-react';
import Link from 'next/link';

export default function QuizReviewPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading } = useAuth();
    const quizId = params.id as string;

    const [reviewData, setReviewData] = useState<any>(null);
    const [loadingReview, setLoadingReview] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user && quizId) {
            loadReview();
        }
    }, [user, quizId]);

    const loadReview = async () => {
        try {
            setLoadingReview(true);
            const res = await fetch(`/api/quiz/${quizId}/review`, {
                headers: getAuthHeaders(),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to load review');
            }

            const data = await res.json();
            setReviewData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoadingReview(false);
        }
    };

    if (loading || loadingReview) {
        return (
            <div className="min-h-screen bg-sija-light flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-sija-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="font-bold text-sija-text uppercase tracking-wider">Loading Review...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-sija-light flex items-center justify-center p-4">
                <div className="bg-red-100 border-2 border-red-500 p-8 max-w-md text-center">
                    <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    <h2 className="font-bold text-red-900 text-xl mb-2">Error</h2>
                    <p className="text-red-800 mb-4">{error}</p>
                    <Link
                        href="/courses"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-sija-primary text-white font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Courses
                    </Link>
                </div>
            </div>
        );
    }

    if (!reviewData) return null;

    const { quiz, attempt, questionResults, totalPoints, earnedPoints, percentage, passed, courseSlug } = reviewData;

    return (
        <div className="min-h-screen bg-sija-light py-8">
            <div className="max-w-4xl mx-auto p-6">
                {/* Results Header */}
                <div className={`border-2 shadow-hard p-8 mb-8 ${passed ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'
                    }`}>
                    <div className="text-center">
                        {passed ? (
                            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" strokeWidth={2.5} />
                        ) : (
                            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" strokeWidth={2.5} />
                        )}
                        <h1 className="font-display text-3xl font-black text-sija-text mb-2 uppercase">
                            {passed ? 'Quiz Passed!' : 'Quiz Not Passed'}
                        </h1>
                        <p className="text-lg font-bold text-sija-text/80 mb-4">
                            {quiz.title}
                        </p>
                        <div className="flex items-center justify-center gap-8 text-sija-text">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" strokeWidth={2.5} />
                                <span className="text-2xl font-black">{percentage}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold">
                                    {earnedPoints} / {totalPoints} points
                                </span>
                            </div>
                            {passed && attempt.xpEarned > 0 && (
                                <div className="flex items-center gap-2 text-yellow-600">
                                    <Award className="w-5 h-5" strokeWidth={2.5} />
                                    <span className="text-lg font-black">+{attempt.xpEarned} XP</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Question Results */}
                <div className="bg-sija-surface border-2 border-sija-primary shadow-hard p-6 mb-6">
                    <h2 className="font-display text-2xl font-bold text-sija-text mb-6 uppercase border-b-2 border-dashed border-sija-text/10 pb-4">
                        Question Breakdown
                    </h2>
                    <div className="space-y-4">
                        {questionResults.map((qResult: any, index: number) => (
                            <div
                                key={qResult.questionId}
                                className={`border-l-4 p-4 border-2 ${qResult.isCorrect
                                    ? 'border-l-green-500 bg-green-50 border-green-200'
                                    : 'border-l-red-500 bg-red-50 border-red-200'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-bold text-sija-text uppercase tracking-wider">
                                        Question {index + 1}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {qResult.isCorrect ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" strokeWidth={2.5} />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-600" strokeWidth={2.5} />
                                        )}
                                        <span className="text-sm font-bold text-sija-text">
                                            {qResult.earnedPoints} / {qResult.points} pts
                                        </span>
                                    </div>
                                </div>
                                <p className="font-medium text-sija-text mb-3">{qResult.question}</p>

                                {/* Show options with indicators */}
                                <div className="space-y-2 mb-3">
                                    {qResult.options.map((option: any) => {
                                        const isSelected = qResult.studentAnswer.includes(option.id);
                                        const isCorrect = qResult.correctAnswer.includes(option.id);

                                        return (
                                            <div
                                                key={option.id}
                                                className={`p-3 border-2 font-medium ${isCorrect
                                                    ? 'bg-green-100 border-green-500 text-green-900'
                                                    : isSelected
                                                        ? 'bg-red-100 border-red-500 text-red-900'
                                                        : 'bg-white border-gray-300 text-gray-700'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {isCorrect && <CheckCircle className="w-4 h-4 text-green-600" />}
                                                    {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-600" />}
                                                    <span>{option.text}</span>
                                                    {isCorrect && <span className="ml-auto text-xs font-bold">(Correct)</span>}
                                                    {isSelected && !isCorrect && <span className="ml-auto text-xs font-bold">(Your Answer)</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {qResult.explanation && (
                                    <div className="p-3 bg-blue-50 border-2 border-blue-200">
                                        <p className="text-sm font-medium text-blue-900 flex items-start gap-2">
                                            <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                                            <span><span className="font-bold">Explanation:</span> {qResult.explanation}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-4">
                    <Link
                        href={`/quiz/${quizId}`}
                        className="flex items-center gap-2 px-6 py-3 bg-sija-primary text-white font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Retake Quiz
                    </Link>
                    <Link
                        href={courseSlug ? `/courses/${courseSlug}` : '/courses'}
                        className="px-6 py-3 border-2 border-sija-primary text-sija-primary font-bold shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider"
                    >
                        {courseSlug ? 'Back to Course' : 'Back to Courses'}
                    </Link>
                </div>
            </div>
        </div>
    );
}
