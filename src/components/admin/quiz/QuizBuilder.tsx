// src/components/admin/quiz/QuizBuilder.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Quiz, QuizQuestion, QuizType, QuizQuestionType } from '@/types';
import { getAuthHeaders } from '@/contexts/AuthContext';
import QuestionEditor from './QuestionEditor';
import { Plus, Save, Eye, Clock, Award, Target, Hash } from 'lucide-react';

interface QuizBuilderProps {
    courseId: string;
    articleId?: string;
    initialQuiz?: Quiz;
    mode?: 'create' | 'edit';
    onSuccess?: () => void;
}

export default function QuizBuilder({ courseId, articleId, initialQuiz, mode = 'create', onSuccess }: QuizBuilderProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [title, setTitle] = useState(initialQuiz?.title || '');
    const [description, setDescription] = useState(initialQuiz?.description || '');
    const [type, setType] = useState<QuizType>(initialQuiz?.type || (articleId ? QuizType.ARTICLE_QUIZ : QuizType.FINAL_QUIZ));
    const [passingScore, setPassingScore] = useState(initialQuiz?.passingScore || 70);
    const [timeLimit, setTimeLimit] = useState(initialQuiz?.timeLimit || 0);
    const [maxAttempts, setMaxAttempts] = useState(initialQuiz?.maxAttempts || 0);
    const [xpReward, setXpReward] = useState(initialQuiz?.xpReward || 100);
    const [published, setPublished] = useState(initialQuiz?.published || false);
    const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuiz?.questions || []);

    const addQuestion = () => {
        const newQuestion: QuizQuestion = {
            id: `q-${Date.now()}`,
            type: QuizQuestionType.MULTIPLE_CHOICE,
            question: '',
            options: [
                { id: `opt-${Date.now()}-1`, text: '', isCorrect: false },
                { id: `opt-${Date.now()}-2`, text: '', isCorrect: false }
            ],
            points: 1,
            order: questions.length
        };
        setQuestions([...questions, newQuestion]);
    };

    const updateQuestion = (index: number, updatedQuestion: QuizQuestion) => {
        const updated = [...questions];
        updated[index] = updatedQuestion;
        setQuestions(updated);
    };

    const deleteQuestion = (index: number) => {
        const updated = questions.filter((_, i) => i !== index);
        // Update order
        updated.forEach((q, i) => q.order = i);
        setQuestions(updated);
    };

    const validateQuiz = (): string | null => {
        if (!title.trim()) return 'Quiz title is required';
        if (questions.length === 0) return 'At least one question is required';

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question.trim()) return `Question ${i + 1} text is required`;
            if (q.options.length < 2) return `Question ${i + 1} must have at least 2 options`;

            const hasCorrect = q.options.some(opt => opt.isCorrect);
            if (!hasCorrect) return `Question ${i + 1} must have at least one correct answer`;

            const hasEmptyOption = q.options.some(opt => !opt.text.trim());
            if (hasEmptyOption) return `Question ${i + 1} has empty options`;
        }

        return null;
    };

    const handleSave = async () => {
        const validationError = validateQuiz();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const quizData = {
                title,
                description,
                courseId,
                articleId,
                type,
                questions,
                passingScore,
                timeLimit: timeLimit || undefined,
                maxAttempts: maxAttempts || undefined,
                xpReward,
                published
            };

            const endpoint = mode === 'edit' && initialQuiz?._id
                ? `/api/admin/quizzes/${initialQuiz._id}`
                : '/api/admin/quizzes/create';

            const method = mode === 'edit' ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: getAuthHeaders(),
                body: JSON.stringify(quizData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save quiz');
            }

            if (onSuccess) {
                onSuccess();
            } else {
                router.push(`/admin/courses/${courseId}/quizzes`);
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="bg-sija-surface border-2 border-sija-primary shadow-hard p-8">
                <h1 className="text-3xl font-display font-black text-sija-text mb-6 uppercase tracking-wide">
                    {mode === 'edit' ? 'Edit Quiz' : 'Create New Quiz'}
                </h1>

                {error && (
                    <div className="mb-6 p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 shadow-hard-sm text-red-700 dark:text-red-400">
                        <p className="font-bold uppercase text-sm mb-1">Error</p>
                        <p>{error}</p>
                    </div>
                )}

                {/* Quiz Metadata */}
                <div className="space-y-6 mb-8">
                    <div>
                        <label className="block text-sm font-bold text-sija-text mb-2 uppercase tracking-wide">
                            Quiz Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-sija-surface border-2 border-sija-text/30 focus:border-sija-primary focus:outline-none transition-colors font-medium text-sija-text"
                            placeholder="Enter quiz title..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-sija-text mb-2 uppercase tracking-wide">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 bg-sija-surface border-2 border-sija-text/30 focus:border-sija-primary focus:outline-none transition-colors font-medium text-sija-text resize-none"
                            rows={3}
                            placeholder="Enter quiz description..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-sija-text mb-2 uppercase tracking-wide">
                                <Target className="w-4 h-4" />
                                Passing Score (%)
                            </label>
                            <input
                                type="number"
                                value={passingScore}
                                onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)}
                                min="0"
                                max="100"
                                className="w-full px-4 py-3 bg-sija-surface border-2 border-sija-text/30 focus:border-sija-primary focus:outline-none transition-colors font-medium text-sija-text"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-sija-text mb-2 uppercase tracking-wide">
                                <Award className="w-4 h-4" />
                                XP Reward
                            </label>
                            <input
                                type="number"
                                value={xpReward}
                                onChange={(e) => setXpReward(parseInt(e.target.value) || 0)}
                                min="0"
                                className="w-full px-4 py-3 bg-sija-surface border-2 border-sija-text/30 focus:border-sija-primary focus:outline-none transition-colors font-medium text-sija-text"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-sija-text mb-2 uppercase tracking-wide">
                                <Clock className="w-4 h-4" />
                                Time Limit (minutes, 0 = unlimited)
                            </label>
                            <input
                                type="number"
                                value={timeLimit}
                                onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
                                min="0"
                                className="w-full px-4 py-3 bg-sija-surface border-2 border-sija-text/30 focus:border-sija-primary focus:outline-none transition-colors font-medium text-sija-text"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-sija-text mb-2 uppercase tracking-wide">
                                <Hash className="w-4 h-4" />
                                Max Attempts (0 = unlimited)
                            </label>
                            <input
                                type="number"
                                value={maxAttempts}
                                onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 0)}
                                min="0"
                                className="w-full px-4 py-3 bg-sija-surface border-2 border-sija-text/30 focus:border-sija-primary focus:outline-none transition-colors font-medium text-sija-text"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-sija-light border-2 border-sija-primary/20">
                        <input
                            type="checkbox"
                            id="published"
                            checked={published}
                            onChange={(e) => setPublished(e.target.checked)}
                            className="w-5 h-5 accent-sija-primary"
                        />
                        <label htmlFor="published" className="flex items-center gap-2 text-sm font-bold text-sija-text uppercase tracking-wide cursor-pointer">
                            <Eye className="w-4 h-4" />
                            Publish Quiz
                        </label>
                    </div>
                </div>

                {/* Questions */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-sija-primary/10">
                        <h2 className="text-xl font-display font-black text-sija-text uppercase tracking-wide">
                            Questions ({questions.length})
                        </h2>
                        {totalPoints > 0 && (
                            <span className="px-4 py-2 bg-sija-light border-2 border-sija-primary/20 text-sm font-bold text-sija-text uppercase">
                                Total Points: {totalPoints}
                            </span>
                        )}
                    </div>

                    <div className="space-y-4">
                        {questions.map((question, index) => (
                            <QuestionEditor
                                key={question.id}
                                question={question}
                                index={index}
                                onUpdate={(updated) => updateQuestion(index, updated)}
                                onDelete={() => deleteQuestion(index)}
                            />
                        ))}
                    </div>

                    <button
                        onClick={addQuestion}
                        className="mt-6 flex items-center gap-2 px-6 py-3 bg-sija-light text-sija-primary border-2 border-sija-primary hover:bg-sija-primary hover:text-white shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-wider"
                    >
                        <Plus className="w-5 h-5" />
                        Add Question
                    </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-6 border-t-2 border-sija-primary/10">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-4 bg-sija-primary text-white border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-hard"
                    >
                        <Save className="w-5 h-5" />
                        {loading ? 'Saving...' : mode === 'edit' ? 'Update Quiz' : 'Create Quiz'}
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="px-8 py-4 border-2 border-sija-text text-sija-text bg-sija-surface shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-wider"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
