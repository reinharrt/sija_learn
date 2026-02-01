// ============================================
// src/components/course/XPPreview.tsx
// XP Calculation Preview Component
// ============================================

'use client';

import { CourseDifficulty } from '@/lib/gamification';
import { calculateCourseXP } from '@/lib/xp-calculator';
import { Star, Plus, Equal, AlertCircle } from 'lucide-react';

interface XPPreviewProps {
    difficulty?: CourseDifficulty;
    articleCount: number;
    customXP?: number;
}

export default function XPPreview({ difficulty, articleCount, customXP }: XPPreviewProps) {
    if (!difficulty) {
        return (
            <div className="bg-yellow-100 dark:bg-yellow-900/20 border-2 border-yellow-500 p-6">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <div>
                        <p className="font-bold text-yellow-900 dark:text-yellow-300 uppercase tracking-wider mb-1">
                            Pilih Difficulty Level
                        </p>
                        <p className="text-sm text-yellow-800 dark:text-yellow-400 font-medium">
                            Pilih difficulty level terlebih dahulu untuk melihat preview XP
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const baseXP = {
        beginner: 50,
        intermediate: 100,
        advanced: 200,
    }[difficulty];

    const articleBonus = Math.floor(articleCount * 10);
    const calculatedXP = baseXP + articleBonus;
    const finalXP = customXP || calculatedXP;
    const isCustom = customXP && customXP !== calculatedXP;

    const difficultyColors = {
        beginner: {
            bg: 'bg-green-100 dark:bg-green-900/20',
            border: 'border-green-500',
            text: 'text-green-900 dark:text-green-300',
        },
        intermediate: {
            bg: 'bg-blue-100 dark:bg-blue-900/20',
            border: 'border-blue-500',
            text: 'text-blue-900 dark:text-blue-300',
        },
        advanced: {
            bg: 'bg-purple-100 dark:bg-purple-900/20',
            border: 'border-purple-500',
            text: 'text-purple-900 dark:text-purple-300',
        },
    }[difficulty];

    return (
        <div className={`${difficultyColors.bg} border-2 ${difficultyColors.border} p-6 shadow-hard`}>
            <div className="flex items-center gap-2 mb-4">
                <Star className={`w-6 h-6 ${difficultyColors.text}`} strokeWidth={2.5} fill="currentColor" />
                <h3 className={`font-bold uppercase tracking-wider ${difficultyColors.text}`}>
                    XP Reward Preview
                </h3>
            </div>

            {/* Calculation Breakdown */}
            <div className="space-y-3 mb-4">
                {/* Base XP */}
                <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600">
                    <span className="font-medium text-sija-text dark:text-gray-300">
                        Base XP ({difficulty})
                    </span>
                    <span className={`font-bold ${difficultyColors.text}`}>
                        {baseXP} XP
                    </span>
                </div>

                {/* Article Bonus */}
                <div className="flex items-center justify-center">
                    <Plus className="w-4 h-4 text-gray-500" strokeWidth={2.5} />
                </div>

                <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600">
                    <span className="font-medium text-sija-text dark:text-gray-300">
                        Article Bonus ({articleCount} × 10)
                    </span>
                    <span className={`font-bold ${difficultyColors.text}`}>
                        {articleBonus} XP
                    </span>
                </div>

                {/* Divider */}
                <div className="flex items-center justify-center">
                    <Equal className="w-4 h-4 text-gray-500" strokeWidth={2.5} />
                </div>

                {/* Calculated Total */}
                <div className={`flex items-center justify-between p-4 ${difficultyColors.bg} border-2 ${difficultyColors.border}`}>
                    <span className={`font-bold uppercase tracking-wider ${difficultyColors.text}`}>
                        {isCustom ? 'Calculated XP' : 'Total XP'}
                    </span>
                    <span className={`text-2xl font-black ${difficultyColors.text}`}>
                        {calculatedXP} XP
                    </span>
                </div>

                {/* Custom Override */}
                {isCustom && (
                    <>
                        <div className="flex items-center justify-center">
                            <AlertCircle className="w-4 h-4 text-orange-500" strokeWidth={2.5} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-orange-100 dark:bg-orange-900/20 border-2 border-orange-500">
                            <span className="font-bold uppercase tracking-wider text-orange-900 dark:text-orange-300">
                                Custom Override
                            </span>
                            <span className="text-2xl font-black text-orange-900 dark:text-orange-300">
                                {customXP} XP
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* Info */}
            <div className="pt-3 border-t-2 border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-400">
                    {isCustom
                        ? '⚠️ Custom XP override aktif - nilai manual akan digunakan'
                        : '✨ XP dihitung otomatis berdasarkan difficulty dan jumlah artikel'
                    }
                </p>
            </div>
        </div>
    );
}
