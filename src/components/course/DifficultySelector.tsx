// src/components/course/DifficultySelector.tsx

'use client';

import { CourseDifficulty } from '@/lib/gamification';
import { Zap, TrendingUp, Flame, Lightbulb } from 'lucide-react';

interface DifficultySelectorProps {
    value: CourseDifficulty | undefined;
    onChange: (difficulty: CourseDifficulty) => void;
}

const DIFFICULTY_OPTIONS = [
    {
        value: 'beginner' as CourseDifficulty,
        label: 'Beginner',
        description: 'Cocok untuk pemula',
        baseXP: 50,
        color: 'green',
        icon: Zap,
    },
    {
        value: 'intermediate' as CourseDifficulty,
        label: 'Intermediate',
        description: 'Untuk yang sudah punya dasar',
        baseXP: 100,
        color: 'blue',
        icon: TrendingUp,
    },
    {
        value: 'advanced' as CourseDifficulty,
        label: 'Advanced',
        description: 'Tingkat lanjut',
        baseXP: 200,
        color: 'purple',
        icon: Flame,
    },
];

export default function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
    return (
        <div>
            <label className="block text-sm font-bold text-sija-text dark:text-white mb-3 uppercase tracking-wider">
                Difficulty Level
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {DIFFICULTY_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = value === option.value;

                    const colorClasses = ({
                        green: {
                            border: 'border-green-500',
                            bg: 'bg-green-100 dark:bg-green-900/20',
                            text: 'text-green-900 dark:text-green-300',
                            icon: 'text-green-600 dark:text-green-400',
                            selectedBorder: 'border-green-600',
                            selectedBg: 'bg-green-500',
                        },
                        blue: {
                            border: 'border-blue-500',
                            bg: 'bg-blue-100 dark:bg-blue-900/20',
                            text: 'text-blue-900 dark:text-blue-300',
                            icon: 'text-blue-600 dark:text-blue-400',
                            selectedBorder: 'border-blue-600',
                            selectedBg: 'bg-blue-500',
                        },
                        purple: {
                            border: 'border-purple-500',
                            bg: 'bg-purple-100 dark:bg-purple-900/20',
                            text: 'text-purple-900 dark:text-purple-300',
                            icon: 'text-purple-600 dark:text-purple-400',
                            selectedBorder: 'border-purple-600',
                            selectedBg: 'bg-purple-500',
                        },
                    } as const)[option.color as 'green' | 'blue' | 'purple'];

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange(option.value)}
                            className={`
                relative p-4 border-2 transition-all
                ${isSelected
                                    ? `${colorClasses.selectedBorder} shadow-hard`
                                    : `${colorClasses.border} hover:shadow-hard-sm`
                                }
                ${colorClasses.bg}
                hover:translate-x-[2px] hover:translate-y-[2px]
              `}
                        >
                            {/* Selected Indicator */}
                            {isSelected && (
                                <div className={`absolute top-2 right-2 w-3 h-3 ${colorClasses.selectedBg} border-2 border-white`} />
                            )}

                            <div className="flex items-start gap-3">
                                <div className={`p-2 ${colorClasses.selectedBg} border-2 ${colorClasses.selectedBorder}`}>
                                    <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                                </div>

                                <div className="flex-1 text-left">
                                    <h3 className={`font-bold uppercase tracking-wider mb-1 ${colorClasses.text}`}>
                                        {option.label}
                                    </h3>
                                    <p className={`text-xs font-medium mb-2 ${colorClasses.text} opacity-80`}>
                                        {option.description}
                                    </p>
                                    <div className={`inline-block px-2 py-1 border ${colorClasses.border} ${colorClasses.bg}`}>
                                        <span className={`text-xs font-bold ${colorClasses.text}`}>
                                            Base: {option.baseXP} XP
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {!value && (
                <p className="mt-3 text-sm text-yellow-700 dark:text-yellow-400 font-medium flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" strokeWidth={2.5} />
                    Pilih difficulty level untuk menentukan base XP reward
                </p>
            )}
        </div>
    );
}
