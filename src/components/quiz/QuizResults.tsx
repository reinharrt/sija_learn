// ============================================
// src/components/quiz/QuizResults.tsx
// Quiz Results Component - Display quiz results
// ============================================

'use client';

import { QuizResult } from '@/types';
import { CheckCircle, XCircle, Award, TrendingUp, RotateCcw } from 'lucide-react';
import Link from 'next/link';

interface QuizResultsProps {
    result: QuizResult;
    quizTitle: string;
    canRetake: boolean;
    onRetake?: () => void;
    courseSlug?: string;
}

export default function QuizResults({ result, quizTitle, canRetake, onRetake, courseSlug }: QuizResultsProps) {
    const { passed, percentage, earnedPoints, totalPoints, questionResults, attempt } = result;

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Results Header */}
            <div className={`rounded-lg p-8 mb-8 ${passed ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
                }`}>
                <div className="text-center">
                    {passed ? (
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    ) : (
                        <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    )}
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {passed ? 'Congratulations!' : 'Keep Trying!'}
                    </h1>
                    <p className="text-lg text-gray-700 mb-4">
                        {passed ? 'You passed the quiz!' : 'You did not pass this time.'}
                    </p>
                    <div className="flex items-center justify-center gap-8 text-gray-700">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            <span className="text-2xl font-bold">{percentage}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg">
                                {earnedPoints} / {totalPoints} points
                            </span>
                        </div>
                        {passed && attempt.xpEarned > 0 && (
                            <div className="flex items-center gap-2 text-yellow-600">
                                <Award className="w-5 h-5" />
                                <span className="text-lg font-semibold">+{attempt.xpEarned} XP</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Question Results */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Question Breakdown</h2>
                <div className="space-y-6">
                    {questionResults.map((qResult, index) => (
                        <div
                            key={qResult.questionId}
                            className={`border-l-4 p-4 rounded-r-lg ${qResult.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-gray-900">Question {index + 1}</h3>
                                <div className="flex items-center gap-2">
                                    {qResult.isCorrect ? (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-600" />
                                    )}
                                    <span className="text-sm font-medium text-gray-700">
                                        {qResult.earnedPoints} / {qResult.points} pts
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-800 mb-3">{qResult.question}</p>

                            {!qResult.isCorrect && (
                                <div className="space-y-2">
                                    <div className="text-sm">
                                        <span className="font-medium text-red-700">Your answer: </span>
                                        <span className="text-gray-700">
                                            {qResult.studentAnswer.length > 0 ? 'Selected options' : 'No answer'}
                                        </span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-medium text-green-700">Correct answer: </span>
                                        <span className="text-gray-700">Correct options highlighted</span>
                                    </div>
                                </div>
                            )}

                            {qResult.explanation && (
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-gray-700">
                                        <span className="font-medium text-blue-700">Explanation: </span>
                                        {qResult.explanation}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-4">
                {canRetake && onRetake && (
                    <button
                        onClick={onRetake}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Retake Quiz
                    </button>
                )}
                <Link
                    href={courseSlug ? `/courses/${courseSlug}` : '/courses'}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                    {courseSlug ? 'Back to Course' : 'Back to Courses'}
                </Link>
            </div>
        </div>
    );
}
