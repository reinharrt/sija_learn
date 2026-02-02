// ============================================
// src/components/admin/quiz/QuizBuilder.tsx
// Quiz Builder Component - Create/Edit Quiz
// ============================================

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
            <div className="bg-white rounded-lg shadow-md p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    {mode === 'edit' ? 'Edit Quiz' : 'Create New Quiz'}
                </h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {/* Quiz Metadata */}
                <div className="space-y-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quiz Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter quiz title..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            placeholder="Enter quiz description..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Target className="w-4 h-4" />
                                Passing Score (%)
                            </label>
                            <input
                                type="number"
                                value={passingScore}
                                onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)}
                                min="0"
                                max="100"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Award className="w-4 h-4" />
                                XP Reward
                            </label>
                            <input
                                type="number"
                                value={xpReward}
                                onChange={(e) => setXpReward(parseInt(e.target.value) || 0)}
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Clock className="w-4 h-4" />
                                Time Limit (minutes, 0 = unlimited)
                            </label>
                            <input
                                type="number"
                                value={timeLimit}
                                onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Hash className="w-4 h-4" />
                                Max Attempts (0 = unlimited)
                            </label>
                            <input
                                type="number"
                                value={maxAttempts}
                                onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 0)}
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="published"
                            checked={published}
                            onChange={(e) => setPublished(e.target.checked)}
                            className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <label htmlFor="published" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Eye className="w-4 h-4" />
                            Publish Quiz
                        </label>
                    </div>
                </div>

                {/* Questions */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Questions ({questions.length})
                        </h2>
                        {totalPoints > 0 && (
                            <span className="text-sm text-gray-600">
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
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Add Question
                    </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-6 border-t">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-5 h-5" />
                        {loading ? 'Saving...' : mode === 'edit' ? 'Update Quiz' : 'Create Quiz'}
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
