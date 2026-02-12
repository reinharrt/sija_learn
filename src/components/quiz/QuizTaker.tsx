// ============================================
// src/components/quiz/QuizTaker.tsx
// Quiz Taker Component - Main quiz interface
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { Quiz, StudentAnswer, QuizResult } from '@/types';
import { getAuthHeaders } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useRouter } from 'next/navigation';
import QuestionDisplay from './QuestionDisplay';
import QuizResults from './QuizResults';
import { Clock, Send, AlertCircle, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';

interface QuizTakerProps {
    quizId: string;
}

export default function QuizTaker({ quizId }: QuizTakerProps) {
    const { showConfirm } = useNotification();
    const [quiz, setQuiz] = useState<any>(null);
    const [userProgress, setUserProgress] = useState<any>(null);
    const [answers, setAnswers] = useState<StudentAnswer[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<QuizResult | null>(null);
    const [startTime] = useState(new Date());
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [courseSlug, setCourseSlug] = useState<string | undefined>(undefined);
    const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        loadQuiz();
    }, [quizId]);

    useEffect(() => {
        if (quiz?.timeLimit && !result) {
            const totalSeconds = quiz.timeLimit * 60;
            setTimeRemaining(totalSeconds);

            const interval = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev === null || prev <= 0) {
                        clearInterval(interval);
                        handleSubmit(); // Auto-submit when time runs out
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [quiz, result]);

    useEffect(() => {
        // Initialize countdown
        if (userProgress && !userProgress.canAttempt && !result && redirectCountdown === null) {
            setRedirectCountdown(5);
        }
    }, [userProgress, result, redirectCountdown]);

    useEffect(() => {
        // Handle countdown timer
        if (redirectCountdown === null) return;

        if (redirectCountdown <= 0) {
            router.push(courseSlug ? `/courses/${courseSlug}` : '/courses');
            return;
        }

        const timer = setTimeout(() => {
            setRedirectCountdown((prev) => (prev !== null ? prev - 1 : null));
        }, 1000);

        return () => clearTimeout(timer);
    }, [redirectCountdown, router, courseSlug]);

    const loadQuiz = async () => {
        try {
            const response = await fetch(`/api/quizzes/${quizId}`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load quiz');
            }

            setQuiz(data.quiz);
            setUserProgress(data.userProgress);
            setCourseSlug(data.courseSlug);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (answer: StudentAnswer) => {
        setAnswers((prev) => {
            const existing = prev.findIndex(a => a.questionId === answer.questionId);
            if (existing >= 0) {
                const updated = [...prev];
                updated[existing] = answer;
                return updated;
            }
            return [...prev, answer];
        });
    };

    const handleSubmit = async () => {
        if (submitting) return;

        const unanswered = quiz.questions.filter(
            (q: any) => !answers.find(a => a.questionId === q.id)
        );

        if (unanswered.length > 0 && timeRemaining !== 0) {
            const confirmed = await showConfirm({
                title: 'Unanswered Questions',
                message: `You have ${unanswered.length} unanswered question(s). Submit anyway?`,
                confirmText: 'Submit',
                cancelText: 'Cancel',
                type: 'warning',
            });

            if (!confirmed) return;
        }

        setSubmitting(true);
        setError('');

        try {
            const response = await fetch(`/api/quizzes/${quizId}/submit`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    answers,
                    startedAt: startTime.toISOString()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit quiz');
            }

            setResult(data.result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRetake = () => {
        setAnswers([]);
        setResult(null);
        loadQuiz();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const answeredCount = answers.filter(a => a.selectedOptions.length > 0).length;
    const totalQuestions = quiz?.questions.length || 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-600">Loading quiz...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="p-6 bg-red-50 border-2 border-red-500 shadow-hard-sm text-red-700">
                    <div className="flex items-center gap-3 mb-3">
                        <AlertCircle className="w-6 h-6" />
                        <span className="font-display font-bold uppercase text-lg">Error</span>
                    </div>
                    <p className="font-medium">{error}</p>
                </div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="text-center text-gray-600">Quiz not found</div>
            </div>
        );
    }

    // Check for max attempts
    if (userProgress && !userProgress.canAttempt && !result) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="bg-sija-surface border-2 border-red-500 shadow-hard p-8 text-center">
                    <div className="inline-block p-4 bg-red-100 border-2 border-red-500 rounded-full mb-6">
                        <AlertTriangle className="w-12 h-12 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-display font-black text-sija-text uppercase mb-4">
                        Max Attempts Reached
                    </h2>
                    <p className="text-lg font-medium text-sija-text/80 mb-8">
                        You have used all your attempts for this quiz.
                    </p>
                    <div className="p-4 bg-sija-light border-2 border-sija-primary mb-6">
                        <p className="font-bold text-sija-primary animate-pulse">
                            Redirecting to course page in {redirectCountdown}s...
                        </p>
                    </div>
                    <button
                        onClick={() => router.push(courseSlug ? `/courses/${courseSlug}` : '/courses')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-sija-surface text-sija-text border-2 border-sija-text shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-wider"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back Now
                    </button>
                </div>
            </div>
        );
    }

    // Show results if quiz is submitted
    if (result) {
        return (
            <QuizResults
                result={result}
                quizTitle={quiz.title}
                canRetake={userProgress?.canAttempt || false}
                onRetake={handleRetake}
                courseSlug={courseSlug}
            />
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Quiz Header */}
            <div className="bg-sija-surface border-2 border-sija-primary shadow-hard p-8 mb-8">
                <h1 className="text-3xl font-display font-black text-sija-text mb-4 uppercase">{quiz.title}</h1>
                {quiz.description && (
                    <p className="text-sija-text/80 font-medium mb-6 text-lg">{quiz.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-6 text-sm md:text-base font-bold text-sija-text border-t-2 border-sija-primary/10 pt-6">
                    <div className="flex items-center gap-2 bg-sija-light px-4 py-2 border-2 border-sija-primary">
                        <CheckCircle2 className="w-5 h-5 text-sija-primary" />
                        <span>Pass: {quiz.passingScore}%</span>
                    </div>
                    {quiz.timeLimit && timeRemaining !== null && (
                        <div className={`flex items-center gap-2 bg-sija-light px-4 py-2 border-2 border-sija-primary ${timeRemaining < 60 ? 'text-red-500 border-red-500' : ''
                            }`}>
                            <Clock className="w-5 h-5" />
                            <span>Time: {formatTime(timeRemaining)}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 bg-sija-light px-4 py-2 border-2 border-sija-primary">
                        <span>Progress: {answeredCount} / {totalQuestions}</span>
                    </div>
                </div>
                {userProgress && (
                    <div className="mt-6 p-4 bg-sija-surface border-2 border-sija-primary border-dashed font-mono text-sm text-sija-text/70">
                        <p>
                            Attempts: {userProgress.attemptCount}
                            {userProgress.bestScore !== null && ` | Best: ${userProgress.bestScore}%`}
                            {userProgress.remainingAttempts !== null && ` | Remaining: ${userProgress.remainingAttempts}`}
                        </p>
                    </div>
                )}
            </div>

            {/* Questions */}
            <div className="space-y-8 mb-8">
                {quiz.questions.map((question: any, index: number) => (
                    <QuestionDisplay
                        key={question.id}
                        question={question}
                        questionNumber={index + 1}
                        answer={answers.find(a => a.questionId === question.id)}
                        onAnswerChange={handleAnswerChange}
                    />
                ))}
            </div>

            {/* Submit Button */}
            <div className="bg-sija-surface border-2 border-sija-primary shadow-hard p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm">
                        {answeredCount < totalQuestions && (
                            <p className="text-orange-500 font-bold flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                {totalQuestions - answeredCount} question(s) left
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || answeredCount === 0}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-sija-primary text-white border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                    >
                        <Send className="w-5 h-5" />
                        {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                </div>
            </div>
        </div>
    );
}
