// src/components/course/CourseSidebar.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    BookOpen,
    CheckCircle2,
    Circle,
    Lock,
    Trophy,
    FileQuestion,
    Award
} from 'lucide-react';

interface Article {
    _id: string;
    title: string;
    slug: string;
}

interface QuizCompletion {
    score: number;
    passed: boolean;
    attempts: number;
    lastAttempt: Date | null;
}

interface ArticleQuiz {
    _id: string;
    title: string;
    type: string;
    passingScore: number;
    xpReward: number;
    published: boolean;
    articleId: string;
    article: Article;
    completion: QuizCompletion;
}

interface FinalQuiz {
    _id: string;
    title: string;
    type: string;
    passingScore: number;
    xpReward: number;
    published: boolean;
    completion: QuizCompletion;
}

interface CourseSidebarProps {
    courseId: string;
    courseSlug: string;
    articles: Article[];
    articleQuizzes: ArticleQuiz[];
    finalQuiz?: FinalQuiz | null;
    completedArticles: string[];
    isEnrolled: boolean;
    currentArticleId?: string;
}

export default function CourseSidebar({
    courseId,
    courseSlug,
    articles,
    articleQuizzes,
    finalQuiz,
    completedArticles,
    isEnrolled,
    currentArticleId
}: CourseSidebarProps) {

    // Create a map of article quizzes for quick lookup
    const quizByArticle = new Map<string, ArticleQuiz>();
    articleQuizzes.forEach(quiz => {
        if (quiz.articleId) {
            quizByArticle.set(quiz.articleId, quiz);
        }
    });

    const isArticleCompleted = (articleId: string) => {
        return completedArticles.some(id => id === articleId);
    };

    const allArticlesCompleted = articles.length > 0 &&
        articles.every(article => isArticleCompleted(article._id));

    return (
        <div className="bg-sija-surface border-2 border-sija-primary shadow-hard">
            {/* Header */}
            <div className="p-4 border-b-2 border-sija-primary bg-sija-primary/5">
                <h3 className="font-display text-lg font-black text-sija-text uppercase flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Course Content
                </h3>
            </div>

            {/* Content List */}
            <div className="p-2">
                {articles.map((article, index) => {
                    const isCompleted = isArticleCompleted(article._id);
                    const quiz = quizByArticle.get(article._id);
                    const hasQuiz = !!quiz && quiz.published;
                    const isCurrent = currentArticleId === article._id;

                    return (
                        <div key={article._id} className="mb-1">
                            {/* Article Item */}
                            <div
                                className={`flex items-center gap-2 p-3 border-2 transition-all ${isCurrent
                                    ? 'border-sija-primary bg-sija-primary/10'
                                    : 'border-sija-primary/30 hover:border-sija-primary hover:bg-sija-light'
                                    }`}
                            >
                                {/* Completion Icon */}
                                {isEnrolled && (
                                    <div className="flex-shrink-0">
                                        {isCompleted ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-sija-text/30" />
                                        )}
                                    </div>
                                )}

                                {/* Article Link */}
                                <Link
                                    href={`/articles/${article.slug}?course=${courseSlug}`}
                                    className="flex-1 min-w-0"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs text-sija-text/50">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <span className={`font-bold text-sm truncate ${isCurrent ? 'text-sija-primary' : 'text-sija-text'
                                            }`}>
                                            {article.title}
                                        </span>
                                    </div>
                                </Link>
                            </div>

                            {/* Article Quiz (Always shown if exists) */}
                            {hasQuiz && quiz && (
                                <div className="ml-6 mt-1 mb-2">
                                    <Link
                                        href={`/quizzes/${quiz._id}?course=${courseSlug}`}
                                        className="flex items-center gap-2 p-2 border-2 border-sija-primary/50 bg-sija-light hover:border-sija-primary hover:shadow-hard-sm transition-all"
                                    >
                                        {/* Quiz Icon */}
                                        <FileQuestion className="w-4 h-4 text-sija-primary flex-shrink-0" />

                                        {/* Quiz Title */}
                                        <span className="flex-1 text-sm font-medium text-sija-text truncate">
                                            {quiz.title}
                                        </span>

                                        {/* Completion Status */}
                                        {isEnrolled && quiz.completion.passed && (
                                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        )}

                                        {/* XP Badge */}
                                        <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 border border-amber-300 rounded flex-shrink-0">
                                            <Trophy className="w-3 h-3 text-amber-600" />
                                            <span className="text-xs font-bold text-amber-700">
                                                {quiz.xpReward}
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Final Quiz Section */}
            {finalQuiz && finalQuiz.published && (
                <div className="border-t-2 border-sija-primary">
                    <div className="p-4 bg-amber-50/50">
                        <h4 className="font-display text-sm font-black text-sija-text uppercase mb-2 flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-600" />
                            Final Assessment
                        </h4>

                        <Link
                            href={`/quizzes/${finalQuiz._id}?course=${courseSlug}`}
                            className={`flex items-center gap-3 p-3 border-2 transition-all ${allArticlesCompleted
                                ? 'border-amber-500 bg-amber-100 hover:shadow-hard-sm'
                                : 'border-sija-text/20 bg-sija-text/5 cursor-not-allowed opacity-60'
                                }`}
                            onClick={(e) => {
                                if (!allArticlesCompleted) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            {/* Lock/Trophy Icon */}
                            <div className="flex-shrink-0">
                                {allArticlesCompleted ? (
                                    <Trophy className="w-5 h-5 text-amber-600" />
                                ) : (
                                    <Lock className="w-5 h-5 text-sija-text/40" />
                                )}
                            </div>

                            {/* Quiz Info */}
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm text-sija-text truncate">
                                    {finalQuiz.title}
                                </div>
                                {!allArticlesCompleted && (
                                    <div className="text-xs text-sija-text/60 mt-0.5">
                                        Complete all articles to unlock
                                    </div>
                                )}
                            </div>

                            {/* Completion/XP Badge */}
                            {isEnrolled && finalQuiz.completion.passed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : (
                                <div className="flex items-center gap-1 px-2 py-1 bg-amber-200 border border-amber-400 rounded flex-shrink-0">
                                    <Trophy className="w-4 h-4 text-amber-700" />
                                    <span className="text-sm font-bold text-amber-800">
                                        {finalQuiz.xpReward}
                                    </span>
                                </div>
                            )}
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
