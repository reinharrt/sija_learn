// ============================================
// src/components/quiz/QuestionDisplay.tsx
// Question Display Component - Render questions by type
// ============================================

'use client';

import { QuizQuestion, QuizQuestionType, StudentAnswer } from '@/types';
import { CheckSquare, Circle, Square } from 'lucide-react';

interface QuestionDisplayProps {
    question: QuizQuestion;
    questionNumber: number;
    answer: StudentAnswer | undefined;
    onAnswerChange: (answer: StudentAnswer) => void;
    disabled?: boolean;
}

export default function QuestionDisplay({
    question,
    questionNumber,
    answer,
    onAnswerChange,
    disabled = false
}: QuestionDisplayProps) {
    const selectedOptions = answer?.selectedOptions || [];

    const handleOptionSelect = (optionId: string) => {
        if (disabled) return;

        let newSelected: string[];

        if (question.type === QuizQuestionType.MULTIPLE_CHOICE || question.type === QuizQuestionType.TRUE_FALSE) {
            // Single selection
            newSelected = [optionId];
        } else {
            // Multiple selection
            if (selectedOptions.includes(optionId)) {
                newSelected = selectedOptions.filter(id => id !== optionId);
            } else {
                newSelected = [...selectedOptions, optionId];
            }
        }

        onAnswerChange({
            questionId: question.id,
            selectedOptions: newSelected
        });
    };

    const isSelected = (optionId: string) => selectedOptions.includes(optionId);

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Question {questionNumber}
                    </h3>
                    <span className="text-sm text-gray-600 font-medium">
                        {question.points} {question.points === 1 ? 'point' : 'points'}
                    </span>
                </div>
                <p className="text-gray-800 text-base leading-relaxed">{question.question}</p>
                {question.type === QuizQuestionType.MULTIPLE_ANSWER && (
                    <p className="text-sm text-blue-600 mt-2">Select all that apply</p>
                )}
            </div>

            <div className="space-y-3">
                {question.options.map((option) => {
                    const selected = isSelected(option.id);
                    const isSingleChoice = question.type === QuizQuestionType.MULTIPLE_CHOICE ||
                        question.type === QuizQuestionType.TRUE_FALSE;

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleOptionSelect(option.id)}
                            disabled={disabled}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selected
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                        >
                            <div className="flex items-center gap-3">
                                {isSingleChoice ? (
                                    <Circle
                                        className={`w-5 h-5 ${selected ? 'text-blue-600 fill-blue-600' : 'text-gray-400'}`}
                                    />
                                ) : (
                                    selected ? (
                                        <CheckSquare className="w-5 h-5 text-blue-600" />
                                    ) : (
                                        <Square className="w-5 h-5 text-gray-400" />
                                    )
                                )}
                                <span className={`text-base ${selected ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                                    {option.text}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
