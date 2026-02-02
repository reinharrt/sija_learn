// ============================================
// src/components/quiz/QuizTaker.tsx
// Quiz Taker Component - Main quiz interface
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { Quiz, StudentAnswer, QuizResult } from '@/types';
import { getAuthHeaders } from '@/contexts/AuthContext';
import QuestionDisplay from './QuestionDisplay';
import QuizResults from './QuizResults';
import { Clock, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

interface QuizTakerProps {
    quizId: string;
}

export default function QuizTaker({ quizId }: QuizTakerProps) {
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

        // Check if all questions are answered
        const unanswered = quiz.questions.filter(
            (q: any) => !answers.find(a => a.questionId === q.id)
        );

        if (unanswered.length > 0 && timeRemaining !== 0) {
            if (!confirm(`You have ${unanswered.length} unanswered question(s). Submit anyway?`)) {
                return;
            }
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
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-semibold">Error</span>
                    </div>
                    <p>{error}</p>
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
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
                {quiz.description && (
                    <p className="text-gray-600 mb-4">{quiz.description}</p>
                )}
                <div className="flex items-center gap-6 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Passing Score: {quiz.passingScore}%</span>
                    </div>
                    {quiz.timeLimit && timeRemaining !== null && (
                        <div className={`flex items-center gap-2 font-semibold ${timeRemaining < 60 ? 'text-red-600' : ''
                            }`}>
                            <Clock className="w-4 h-4" />
                            <span>Time Remaining: {formatTime(timeRemaining)}</span>
                        </div>
                    )}
                    <div>
                        <span>Progress: {answeredCount} / {totalQuestions}</span>
                    </div>
                </div>
                {userProgress && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                        <p className="text-blue-800">
                            Attempts: {userProgress.attemptCount}
                            {userProgress.bestScore !== null && ` | Best Score: ${userProgress.bestScore}%`}
                            {userProgress.remainingAttempts !== null && ` | Remaining: ${userProgress.remainingAttempts}`}
                        </p>
                    </div>
                )}
            </div>

            {/* Questions */}
            <div className="space-y-6 mb-6">
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
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        {answeredCount < totalQuestions && (
                            <p className="text-yellow-600 font-medium">
                                <AlertCircle className="w-4 h-4 inline mr-1" />
                                {totalQuestions - answeredCount} question(s) unanswered
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || answeredCount === 0}
                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                        {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                </div>
            </div>
        </div>
    );
}
