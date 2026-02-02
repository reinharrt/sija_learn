// ============================================
// src/components/quiz/QuizCard.tsx
// Quiz Card Component - Preview card for quizzes
// ============================================

'use client';

import Link from 'next/link';
import { FileText, Award, Clock, Target, TrendingUp } from 'lucide-react';

interface QuizCardProps {
    quizId: string;
    title: string;
    description?: string;
    questionCount: number;
    passingScore: number;
    xpReward: number;
    timeLimit?: number;
    bestScore?: number | null;
    attemptCount?: number;
    hasPassed?: boolean;
}

export default function QuizCard({
    quizId,
    title,
    description,
    questionCount,
    passingScore,
    xpReward,
    timeLimit,
    bestScore,
    attemptCount = 0,
    hasPassed = false
}: QuizCardProps) {
    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    {description && (
                        <p className="text-gray-600 text-sm mb-3">{description}</p>
                    )}
                </div>
                {hasPassed && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <TrendingUp className="w-3 h-3" />
                        Passed
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>{questionCount} questions</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span>{passingScore}% to pass</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <span>{xpReward} XP</span>
                </div>
                {timeLimit && (
                    <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>{timeLimit} min</span>
                    </div>
                )}
            </div>

            {attemptCount > 0 && (
                <div className="mb-4 p-3 bg-white rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Attempts: {attemptCount}</span>
                        {bestScore !== null && bestScore !== undefined && (
                            <span className="font-semibold text-blue-600">
                                Best: {bestScore}%
                            </span>
                        )}
                    </div>
                </div>
            )}

            <Link
                href={`/quiz/${quizId}`}
                className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
                {attemptCount > 0 ? 'Retake Quiz' : 'Start Quiz'}
            </Link>
        </div>
    );
}
