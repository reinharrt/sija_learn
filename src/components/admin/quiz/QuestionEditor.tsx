// src/components/admin/quiz/QuestionEditor.tsx

'use client';

import { useState } from 'react';
import { QuizQuestion, QuizQuestionType, QuizOption } from '@/types';
import { Trash2, Plus, GripVertical } from 'lucide-react';

interface QuestionEditorProps {
    question: QuizQuestion;
    index: number;
    onUpdate: (question: QuizQuestion) => void;
    onDelete: () => void;
}

export default function QuestionEditor({ question, index, onUpdate, onDelete }: QuestionEditorProps) {
    const [localQuestion, setLocalQuestion] = useState<QuizQuestion>(question);

    const handleQuestionChange = (field: keyof QuizQuestion, value: any) => {
        const updated = { ...localQuestion, [field]: value };
        setLocalQuestion(updated);
        onUpdate(updated);
    };

    const handleOptionChange = (optionId: string, field: keyof QuizOption, value: any) => {
        const updatedOptions = localQuestion.options.map(opt =>
            opt.id === optionId ? { ...opt, [field]: value } : opt
        );
        handleQuestionChange('options', updatedOptions);
    };

    const addOption = () => {
        const newOption: QuizOption = {
            id: `opt-${Date.now()}`,
            text: '',
            isCorrect: false
        };
        handleQuestionChange('options', [...localQuestion.options, newOption]);
    };

    const removeOption = (optionId: string) => {
        const updatedOptions = localQuestion.options.filter(opt => opt.id !== optionId);
        handleQuestionChange('options', updatedOptions);
    };

    const handleTypeChange = (newType: QuizQuestionType) => {
        let options = localQuestion.options;

        // For TRUE_FALSE, ensure exactly 2 options
        if (newType === QuizQuestionType.TRUE_FALSE) {
            options = [
                { id: 'true', text: 'True', isCorrect: false },
                { id: 'false', text: 'False', isCorrect: false }
            ];
        }

        handleQuestionChange('type', newType);
        handleQuestionChange('options', options);
    };

    const toggleCorrectAnswer = (optionId: string) => {
        if (localQuestion.type === QuizQuestionType.MULTIPLE_CHOICE) {
            // For single choice, only one can be correct
            const updatedOptions = localQuestion.options.map(opt => ({
                ...opt,
                isCorrect: opt.id === optionId
            }));
            handleQuestionChange('options', updatedOptions);
        } else {
            // For multiple answer or true/false, toggle
            handleOptionChange(optionId, 'isCorrect', !localQuestion.options.find(o => o.id === optionId)?.isCorrect);
        }
    };

    return (
        <div className="border-2 border-sija-primary bg-sija-surface shadow-hard p-6">
            <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-sija-primary/10">
                <div className="flex items-center gap-3">
                    <GripVertical className="w-5 h-5 text-sija-text/40 cursor-move" />
                    <span className="font-display font-black text-sija-text uppercase tracking-wide">Question {index + 1}</span>
                </div>
                <button
                    onClick={onDelete}
                    className="p-2 text-sija-text border-2 border-sija-text/20 bg-sija-surface hover:border-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete question"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* Question Type */}
            <div className="mb-6">
                <label className="block text-sm font-bold text-sija-text mb-2 uppercase tracking-wide">
                    Question Type
                </label>
                <select
                    value={localQuestion.type}
                    onChange={(e) => handleTypeChange(e.target.value as QuizQuestionType)}
                    className="w-full px-4 py-3 bg-sija-surface border-2 border-sija-text/30 focus:border-sija-primary focus:outline-none transition-colors font-medium text-sija-text"
                >
                    <option value={QuizQuestionType.MULTIPLE_CHOICE}>Multiple Choice (Single Answer)</option>
                    <option value={QuizQuestionType.MULTIPLE_ANSWER}>Multiple Choice (Multiple Answers)</option>
                    <option value={QuizQuestionType.TRUE_FALSE}>True/False</option>
                </select>
            </div>

            {/* Question Text */}
            <div className="mb-6">
                <label className="block text-sm font-bold text-sija-text mb-2 uppercase tracking-wide">
                    Question
                </label>
                <textarea
                    value={localQuestion.question}
                    onChange={(e) => handleQuestionChange('question', e.target.value)}
                    className="w-full px-4 py-3 bg-sija-surface border-2 border-sija-text/30 focus:border-sija-primary focus:outline-none transition-colors font-medium text-sija-text resize-none"
                    rows={3}
                    placeholder="Enter your question here..."
                />
            </div>

            {/* Points */}
            <div className="mb-6">
                <label className="block text-sm font-bold text-sija-text mb-2 uppercase tracking-wide">
                    Points
                </label>
                <input
                    type="number"
                    value={localQuestion.points}
                    onChange={(e) => handleQuestionChange('points', parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-32 px-4 py-3 bg-sija-surface border-2 border-sija-text/30 focus:border-sija-primary focus:outline-none transition-colors font-medium text-sija-text"
                />
            </div>

            {/* Options */}
            <div className="mb-6">
                <label className="block text-sm font-bold text-sija-text mb-3 uppercase tracking-wide">
                    Answer Options
                </label>
                <div className="space-y-3">
                    {localQuestion.options.map((option) => (
                        <div key={option.id} className="flex items-center gap-3 p-3 bg-sija-light border-2 border-sija-primary/20">
                            <input
                                type={localQuestion.type === QuizQuestionType.MULTIPLE_CHOICE ? 'radio' : 'checkbox'}
                                checked={option.isCorrect}
                                onChange={() => toggleCorrectAnswer(option.id)}
                                className="w-5 h-5 accent-sija-primary"
                                name={`question-${localQuestion.id}`}
                            />
                            <input
                                type="text"
                                value={option.text}
                                onChange={(e) => handleOptionChange(option.id, 'text', e.target.value)}
                                className="flex-1 px-4 py-2 bg-sija-surface border-2 border-sija-text/30 focus:border-sija-primary focus:outline-none transition-colors font-medium text-sija-text"
                                placeholder="Enter option text..."
                                disabled={localQuestion.type === QuizQuestionType.TRUE_FALSE}
                            />
                            {localQuestion.type !== QuizQuestionType.TRUE_FALSE && (
                                <button
                                    onClick={() => removeOption(option.id)}
                                    className="p-2 text-sija-text border-2 border-sija-text/20 bg-sija-surface hover:border-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={localQuestion.options.length <= 2}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {localQuestion.type !== QuizQuestionType.TRUE_FALSE && (
                    <button
                        onClick={addOption}
                        className="mt-3 flex items-center gap-2 px-4 py-2 bg-sija-light text-sija-primary border-2 border-sija-primary hover:bg-sija-primary hover:text-white shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-wider text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Option
                    </button>
                )}
            </div>

            {/* Explanation */}
            <div>
                <label className="block text-sm font-bold text-sija-text mb-2 uppercase tracking-wide">
                    Explanation (Optional)
                </label>
                <textarea
                    value={localQuestion.explanation || ''}
                    onChange={(e) => handleQuestionChange('explanation', e.target.value)}
                    className="w-full px-4 py-3 bg-sija-surface border-2 border-sija-text/30 focus:border-sija-primary focus:outline-none transition-colors font-medium text-sija-text resize-none"
                    rows={2}
                    placeholder="Provide an explanation for the correct answer..."
                />
            </div>
        </div>
    );
}
