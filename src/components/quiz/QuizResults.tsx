// src/components/quiz/QuizResults.tsx

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
            <div className={`border-2 shadow-hard p-8 mb-8 text-center transition-all ${passed
                ? 'bg-green-100 border-green-600 text-green-900'
                : 'bg-red-100 border-red-600 text-red-900'
                }`}>
                <div className="inline-block p-4 bg-white border-2 border-current rounded-full mb-6 shadow-sm">
                    {passed ? (
                        <CheckCircle className="w-16 h-16" />
                    ) : (
                        <XCircle className="w-16 h-16" />
                    )}
                </div>
                <h1 className="text-4xl font-display font-black uppercase mb-3 tracking-wide">
                    {passed ? 'Mission Accomplished!' : 'Mission Failed'}
                </h1>
                <p className="text-xl font-medium mb-8 opacity-90">
                    {passed ? 'Excellent work, engineer. System updated.' : 'Debugging required. Try again.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
                    <div className="bg-white/50 border-2 border-current px-6 py-3 min-w-[120px]">
                        <div className="text-sm font-bold uppercase opacity-70 mb-1">Score</div>
                        <div className="text-3xl font-black">{percentage}%</div>
                    </div>
                    <div className="bg-white/50 border-2 border-current px-6 py-3 min-w-[120px]">
                        <div className="text-sm font-bold uppercase opacity-70 mb-1">Points</div>
                        <div className="text-3xl font-black">{earnedPoints} <span className="text-base text-current/70">/ {totalPoints}</span></div>
                    </div>
                    {passed && attempt.xpEarned > 0 && (
                        <div className="bg-yellow-100 border-2 border-yellow-600 text-yellow-800 px-6 py-3 min-w-[120px]">
                            <div className="text-sm font-bold uppercase opacity-70 mb-1 flex items-center justify-center gap-1">
                                <Award className="w-4 h-4" /> XP
                            </div>
                            <div className="text-3xl font-black">+{attempt.xpEarned}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Question Results */}
            <div className="bg-sija-surface border-2 border-sija-primary shadow-hard p-6 md:p-8 mb-8">
                <h2 className="text-2xl font-display font-black text-sija-text uppercase mb-8 border-b-2 border-sija-primary/10 pb-4">
                    Analysis Breakdown
                </h2>
                <div className="space-y-6">
                    {questionResults.map((qResult, index) => (
                        <div
                            key={qResult.questionId}
                            className={`border-2 p-6 transition-all ${qResult.isCorrect
                                ? 'border-green-500 bg-green-50/50'
                                : 'border-red-500 bg-red-50/50'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="font-bold text-lg text-sija-text">Question {index + 1}</h3>
                                <div className={`flex items-center gap-2 px-3 py-1 border-2 text-sm font-bold uppercase ${qResult.isCorrect
                                    ? 'bg-green-100 border-green-600 text-green-800'
                                    : 'bg-red-100 border-red-600 text-red-800'
                                    }`}>
                                    {qResult.isCorrect ? (
                                        <>
                                            <CheckCircle className="w-4 h-4" /> Correct
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-4 h-4" /> Incorrect
                                        </>
                                    )}
                                    <span className="ml-2 border-l-2 border-current pl-2">
                                        {qResult.earnedPoints} / {qResult.points} pts
                                    </span>
                                </div>
                            </div>
                            <p className="text-sija-text text-lg mb-6 leading-relaxed font-medium">{qResult.question}</p>

                            {!qResult.isCorrect && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="p-4 bg-red-100 border-2 border-red-200 text-red-900 text-sm">
                                        <span className="font-bold block mb-1 uppercase text-xs">Your answer via Terminal</span>
                                        {qResult.studentAnswer.length > 0 ? 'Selected options are technically incorrect' : 'No input received'}
                                    </div>
                                    <div className="p-4 bg-green-100 border-2 border-green-200 text-green-900 text-sm">
                                        <span className="font-bold block mb-1 uppercase text-xs">Expected Output</span>
                                        Correct compiled solution matches highlighted options
                                    </div>
                                </div>
                            )}

                            {qResult.explanation && (
                                <div className="mt-4 p-4 bg-sija-light border-l-4 border-sija-primary text-sija-text/80 text-sm">
                                    <span className="font-bold text-sija-primary uppercase text-xs block mb-1">Documentation</span>
                                    {qResult.explanation}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                {canRetake && onRetake && (
                    <button
                        onClick={onRetake}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-sija-primary text-white border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-wider"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Retake Quiz
                    </button>
                )}
                <Link
                    href={courseSlug ? `/courses/${courseSlug}` : '/courses'}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-sija-surface text-sija-text border-2 border-sija-text shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-wider"
                >
                    {courseSlug ? 'Return to Course' : 'All Courses'}
                </Link>
            </div>
        </div>
    );
}
