// src/components/quiz/QuizCard.tsx

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
        <div className="bg-sija-surface border-2 border-sija-primary shadow-hard hover:shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all p-6">
            <div className="flex items-start justify-between mb-4 pb-4 border-b-2 border-sija-primary/10">
                <div className="flex-1">
                    <h3 className="text-xl font-display font-black text-sija-text mb-2 uppercase tracking-wide">{title}</h3>
                    {description && (
                        <p className="text-sija-text/70 text-sm font-medium">{description}</p>
                    )}
                </div>
                {hasPassed && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 border-2 border-green-600 text-green-700 dark:text-green-400 text-xs font-bold uppercase">
                        <TrendingUp className="w-3 h-3" />
                        Passed
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="flex items-center gap-2 bg-sija-light px-3 py-2 border-2 border-sija-primary/20">
                    <FileText className="w-4 h-4 text-sija-primary" />
                    <span className="font-bold text-sija-text">{questionCount} questions</span>
                </div>
                <div className="flex items-center gap-2 bg-sija-light px-3 py-2 border-2 border-sija-primary/20">
                    <Target className="w-4 h-4 text-sija-primary" />
                    <span className="font-bold text-sija-text">{passingScore}% pass</span>
                </div>
                <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-2 border-2 border-yellow-600">
                    <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="font-bold text-yellow-700 dark:text-yellow-400">{xpReward} XP</span>
                </div>
                {timeLimit && (
                    <div className="flex items-center gap-2 bg-sija-light px-3 py-2 border-2 border-sija-primary/20">
                        <Clock className="w-4 h-4 text-sija-primary" />
                        <span className="font-bold text-sija-text">{timeLimit} min</span>
                    </div>
                )}
            </div>

            {attemptCount > 0 && (
                <div className="mb-4 p-3 bg-sija-light border-2 border-sija-primary border-dashed">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-sija-text/70 uppercase text-xs">Attempts: {attemptCount}</span>
                        {bestScore !== null && bestScore !== undefined && (
                            <span className="font-black text-sija-primary">
                                Best: {bestScore}%
                            </span>
                        )}
                    </div>
                </div>
            )}

            <Link
                href={`/quiz/${quizId}`}
                className="block w-full text-center px-6 py-3 bg-sija-primary text-white border-2 border-sija-primary shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-wider"
            >
                {attemptCount > 0 ? 'Retake Quiz' : 'Start Quiz'}
            </Link>
        </div>
    );
}
