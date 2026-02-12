// src/components/quiz/QuestionDisplay.tsx

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
        <div className="bg-sija-surface border-2 border-sija-primary shadow-hard-sm p-6 md:p-8">
            <div className="mb-6">
                <div className="flex items-start justify-between mb-4 border-b-2 border-sija-primary/10 pb-4">
                    <h3 className="font-display font-bold text-xl text-sija-text uppercase tracking-wide">
                        Question {questionNumber}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-sija-light border-2 border-sija-primary text-xs font-bold uppercase text-sija-primary">
                        {question.points} {question.points === 1 ? 'pt' : 'pts'}
                    </span>
                </div>
                <p className="text-sija-text text-lg font-medium leading-relaxed">{question.question}</p>
                {question.type === QuizQuestionType.MULTIPLE_ANSWER && (
                    <p className="text-sm text-sija-primary font-bold uppercase mt-3 flex items-center gap-2">
                        <CheckSquare className="w-4 h-4" />
                        Select all that apply
                    </p>
                )}
            </div>

            <div className="space-y-4">
                {question.options.map((option) => {
                    const selected = isSelected(option.id);
                    const isSingleChoice = question.type === QuizQuestionType.MULTIPLE_CHOICE ||
                        question.type === QuizQuestionType.TRUE_FALSE;

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleOptionSelect(option.id)}
                            disabled={disabled}
                            className={`w-full text-left p-4 md:p-5 border-2 transition-all flex items-center gap-4 group ${selected
                                ? 'border-sija-primary bg-sija-primary text-white shadow-hard-sm'
                                : 'border-sija-text/20 bg-sija-surface hover:border-sija-primary hover:bg-sija-light hover:shadow-hard-sm hover:-translate-y-1'
                                } ${disabled ? 'cursor-not-allowed opacity-60 hover:transform-none hover:shadow-none' : 'cursor-pointer'}`}
                        >
                            <div className={`flex-shrink-0 w-6 h-6 border-2 flex items-center justify-center transition-colors ${selected
                                ? 'border-white bg-white text-sija-primary'
                                : 'border-sija-text/30 group-hover:border-sija-primary bg-white'
                                } ${isSingleChoice ? 'rounded-full' : ''}`}>
                                {selected && <div className={`w-3 h-3 bg-current ${isSingleChoice ? 'rounded-full' : ''}`} />}
                            </div>

                            <span className={`text-base md:text-lg ${selected ? 'font-bold' : 'font-medium text-sija-text group-hover:text-sija-primary'}`}>
                                {option.text}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
