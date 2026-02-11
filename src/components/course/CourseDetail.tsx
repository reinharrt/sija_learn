// ============================================
// src/components/course/CourseDetail.tsx
// Course Detail Component - WITH QUIZ HIERARCHY SIDEBAR
// ============================================

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Course, Article } from '@/types';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';
import { getImageUrl } from '@/lib/image-utils';
import { getDifficultyDisplay, getDifficultyColor, calculateCourseXP } from '@/lib/xp-calculator';
import CourseCompletionHandler from './CourseCompletionHandler';
import CourseSidebar from './CourseSidebar';
import {
  BookOpen,
  Users,
  Calendar,
  User,
  Lock,
  CheckCircle2,
  PlayCircle,
  LogOut,
  AlertCircle,
  Edit,
  Crown,
  Star,
  Zap,
  XCircle,
  Clock
} from 'lucide-react';

interface CourseDetailProps {
  course: Course & {
    creator?: {
      _id?: any;
      name?: string;
    };
  };
  initialIsEnrolled?: boolean;
}

export default function CourseDetail({ course, initialIsEnrolled = false }: CourseDetailProps) {
  const { user } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(initialIsEnrolled);
  const [enrolling, setEnrolling] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [progress, setProgress] = useState<{
    completedArticles: string[];
    percentage: number;
  }>({ completedArticles: [], percentage: 0 });
  const [quizStatus, setQuizStatus] = useState<any>(null);
  const [loadingQuizStatus, setLoadingQuizStatus] = useState(false);
  const [quizData, setQuizData] = useState<{
    articleQuizzes: any[];
    finalQuiz: any | null;
  }>({ articleQuizzes: [], finalQuiz: null });
  const [loadingQuizData, setLoadingQuizData] = useState(false);

  // ✅ CHECK IF USER IS CREATOR
  const isCreator = user && course.creator &&
    (typeof course.creator === 'string'
      ? course.creator === user.id
      : course.creator._id?.toString() === user.id);

  // ✅ SYNC ENROLLMENT STATE WITH PROP
  useEffect(() => {
    setIsEnrolled(initialIsEnrolled);
  }, [initialIsEnrolled]);

  useEffect(() => {
    if (course.articles && course.articles.length > 0) {
      loadArticles();
    }
  }, [course.articles]);

  useEffect(() => {
    // ✅ ONLY LOAD PROGRESS IF NOT CREATOR
    if (isEnrolled && user && !isCreator) {
      loadProgress();
      loadQuizStatus();
    }
  }, [isEnrolled, user, isCreator]);

  useEffect(() => {
    // Load quiz data when user is enrolled or is creator
    if ((isEnrolled || isCreator) && user && course._id) {
      loadQuizData();
    }
  }, [isEnrolled, isCreator, user, course._id]);

  const loadArticles = async () => {
    setLoadingArticles(true);
    try {
      const articlePromises = (course.articles || []).map(async (articleId) => {
        const res = await fetch(`/api/articles/${articleId}`);
        if (res.ok) {
          return await res.json();
        }
        return null;
      });

      const loadedArticles = await Promise.all(articlePromises);
      setArticles(loadedArticles.filter((a) => a !== null));
    } catch (error) {
      console.error('Load articles error:', error);
    } finally {
      setLoadingArticles(false);
    }
  };

  const loadProgress = async () => {
    if (!course._id) return;

    try {
      const res = await fetch(`/api/enrollments/${course._id}`, {
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setProgress({
          completedArticles: data.progress?.completedArticles || [],
          percentage: data.progress?.percentage || 0,
        });
      }
    } catch (error) {
      console.error('Load progress error:', error);
    }
  };

  const loadQuizStatus = async () => {
    if (!course._id || !user) return;

    setLoadingQuizStatus(true);
    try {
      const res = await fetch(`/api/courses/${course._id}/quiz-status`, {
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setQuizStatus(data);
      }
    } catch (error) {
      console.error('Load quiz status error:', error);
    } finally {
      setLoadingQuizStatus(false);
    }
  };

  const loadQuizData = async () => {
    if (!course._id) return;

    setLoadingQuizData(true);
    try {
      const res = await fetch(`/api/courses/${course._id}/quizzes`, {
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setQuizData({
          articleQuizzes: data.articleQuizzes || [],
          finalQuiz: data.finalQuiz || null,
        });
      }
    } catch (error) {
      console.error('Load quiz data error:', error);
    } finally {
      setLoadingQuizData(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      alert('Silakan login terlebih dahulu!');
      return;
    }

    // ✅ PREVENT CREATOR FROM ENROLLING
    if (isCreator) {
      alert('Anda tidak dapat mendaftar di course yang Anda buat sendiri');
      return;
    }

    setEnrolling(true);
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ courseId: course._id }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsEnrolled(true);
        alert('Berhasil mendaftar course!');
      } else {
        alert(data.error || 'Gagal mendaftar course');
      }
    } catch (error) {
      console.error('Enroll error:', error);
      alert('Terjadi kesalahan');
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!confirm('Yakin ingin keluar dari course ini?')) return;

    try {
      const response = await fetch(`/api/enrollments/${course._id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setIsEnrolled(false);
        setProgress({ completedArticles: [], percentage: 0 });
        setQuizStatus(null);
        alert('Berhasil keluar dari course');
      } else {
        alert('Gagal keluar dari course');
      }
    } catch (error) {
      console.error('Unenroll error:', error);
      alert('Terjadi kesalahan');
    }
  };

  const isArticleCompleted = (articleId: string) => {
    return progress.completedArticles.some((id) => id === articleId);
  };

  const isArticleUnlocked = (index: number) => {
    // ✅ CREATORS HAVE ACCESS TO ALL ARTICLES
    if (isCreator) return true;

    if (index === 0) return true; // First article always unlocked

    // Previous article must be completed
    const previousArticle = articles[index - 1];
    if (!previousArticle || !previousArticle._id) return false;

    return isArticleCompleted(previousArticle._id.toString());
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Course Header - Full Width */}
      <div className="bg-sija-surface border-2 border-sija-primary shadow-hard mb-6 overflow-hidden">
        {course.thumbnail && (
          <div className="relative w-full h-64 md:h-80 border-b-2 border-sija-primary">
            <img
              src={getImageUrl(course.thumbnail)}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            {/* ✅ CREATOR BADGE ON THUMBNAIL */}
            {isCreator && (
              <div className="absolute top-4 right-4 bg-yellow-400 text-sija-primary px-4 py-2 border-2 border-sija-primary shadow-hard font-bold uppercase tracking-wider flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Your Course
              </div>
            )}
          </div>
        )}

        <div className="p-6 md:p-8">
          <h1 className="font-display text-3xl md:text-4xl font-black text-sija-primary mb-4 uppercase leading-tight">
            {course.title}
          </h1>

          <p className="text-lg text-sija-text/80 mb-6 font-medium leading-relaxed">
            {course.description}
          </p>

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {course.tags.map((tag, index) => (
                <span
                  key={index}
                  className="font-mono text-xs font-bold uppercase tracking-wider px-3 py-1 bg-sija-light text-sija-primary border-2 border-sija-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Difficulty & XP Badges */}
          <div className="flex flex-wrap gap-3 mb-6">
            {course.difficulty && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 border-2 font-bold uppercase tracking-wider ${getDifficultyColor(course.difficulty)}`}>
                <Zap className="w-4 h-4" strokeWidth={2.5} />
                {getDifficultyDisplay(course.difficulty)}
              </div>
            )}

            {(course.xpReward || course.difficulty) && (
              <div className="inline-flex items-center gap-2 px-4 py-2 border-2 bg-yellow-100 text-yellow-900 border-yellow-500 font-bold uppercase tracking-wider">
                <Star className="w-4 h-4" strokeWidth={2.5} fill="currentColor" />
                {course.xpReward || calculateCourseXP(course.difficulty || 'beginner', articles.length)} XP
              </div>
            )}
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-y-2 border-dashed border-sija-text/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sija-primary border-2 border-sija-primary flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-sija-text/60 uppercase tracking-wider">
                  Modules
                </div>
                <div className="text-lg font-black text-sija-text">
                  {articles.length}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 border-2 border-green-700 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-sija-text/60 uppercase tracking-wider">
                  Students
                </div>
                <div className="text-lg font-black text-sija-text">
                  {course.enrolledCount || 0}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 border-2 border-blue-700 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-sija-text/60 uppercase tracking-wider">
                  Instructor
                </div>
                <div className="text-sm font-bold text-sija-text truncate">
                  {course.creator?.name || 'Unknown'}
                </div>
              </div>
            </div>
          </div>

          {/* Enrollment Section */}
          <div className="mt-6">
            {/* ✅ CREATOR VIEW */}
            {isCreator ? (
              <div className="bg-yellow-100 border-2 border-yellow-500 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="w-8 h-8 text-yellow-600" />
                  <div>
                    <h3 className="font-bold text-yellow-900 uppercase tracking-wider text-lg">
                      You are the Course Creator
                    </h3>
                    <p className="text-sm text-yellow-800 font-medium">
                      You have full access to all modules and can edit this course
                    </p>
                  </div>
                </div>
                <Link
                  href={`/courses/${course.slug}/edit`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-sija-primary text-white font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider"
                >
                  <Edit className="w-5 h-5" />
                  Edit Course
                </Link>
              </div>
            ) : !user ? (
              <div className="bg-yellow-100 border-2 border-yellow-500 p-6 text-center">
                <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                <p className="text-yellow-900 font-bold mb-4">
                  Silakan login untuk mendaftar course ini
                </p>
                <Link
                  href="/login"
                  className="inline-block px-8 py-3 bg-sija-primary text-white font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider"
                >
                  Login Now
                </Link>
              </div>
            ) : isEnrolled ? (
              <div className="bg-green-100 border-2 border-green-500 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <span className="font-bold text-green-900 uppercase tracking-wider">
                      Enrolled
                    </span>
                  </div>
                  <button
                    onClick={handleUnenroll}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 font-bold border-2 border-red-500 shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Leave Course
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-green-900 uppercase tracking-wider">
                      Your Progress
                    </span>
                    <span className="text-2xl font-black text-green-900">
                      {progress.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-sija-light border-2 border-green-500 h-4 overflow-hidden">
                    <div
                      className="bg-green-500 h-full transition-all duration-500"
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs font-bold text-green-700 mt-2">
                    {progress.completedArticles.length} of {articles.length} modules completed
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-sija-primary text-white font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-lg"
              >
                <PlayCircle className="w-6 h-6" />
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Two-column layout: Sidebar (Left) + Main Content (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - LEFT SIDE */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <CourseSidebar
              courseId={course._id?.toString() || ''}
              courseSlug={course.slug}
              articles={articles.map(a => ({
                _id: a._id?.toString() || '',
                title: a.title,
                slug: a.slug
              }))}
              articleQuizzes={quizData.articleQuizzes}
              finalQuiz={quizData.finalQuiz}
              completedArticles={progress.completedArticles}
              isEnrolled={isEnrolled || !!isCreator}
            />
          </div>
        </div>

        {/* Main Content - RIGHT SIDE */}
        <div className="lg:col-span-3 space-y-6">
          {/* Course Content */}
          <div className="bg-sija-surface border-2 border-sija-primary shadow-hard p-6 md:p-8">
            <h2 className="font-display text-2xl font-bold text-sija-text mb-6 uppercase border-b-2 border-dashed border-sija-text/10 pb-4">
              Course Content
            </h2>

            {loadingArticles ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sija-primary border-t-transparent"></div>
                <p className="mt-4 font-bold text-sija-text uppercase tracking-wider">
                  Loading modules...
                </p>
              </div>
            ) : articles.length === 0 ? (
              <div className="bg-yellow-100 border-2 border-yellow-500 p-8 text-center">
                <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                <p className="font-bold text-yellow-900 uppercase tracking-wider">
                  No modules available yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {articles.map((article, index) => {
                  if (!article) return null;

                  const completed = isArticleCompleted(article._id?.toString() || '');
                  const unlocked = isCreator ? true : (isEnrolled ? isArticleUnlocked(index) : false);
                  const canAccess = isCreator || !isEnrolled || unlocked;

                  return (
                    <div
                      key={article._id?.toString() || index}
                      className={`border-2 p-4 transition-all ${completed
                        ? 'bg-green-100 border-green-500'
                        : !canAccess
                          ? 'bg-gray-100 border-gray-300 opacity-60'
                          : 'bg-sija-light border-sija-primary hover:shadow-hard-sm'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className={`w-10 h-10 border-2 flex items-center justify-center font-bold ${completed
                              ? 'bg-green-500 border-green-700 text-white'
                              : !canAccess
                                ? 'bg-gray-300 border-gray-400 text-gray-600'
                                : 'bg-sija-primary border-sija-primary text-white'
                              }`}
                          >
                            {completed ? (
                              <CheckCircle2 className="w-6 h-6" />
                            ) : !canAccess ? (
                              <Lock className="w-5 h-5" />
                            ) : (
                              <span>{index + 1}</span>
                            )}
                          </div>

                          <div className="flex-1">
                            <h3 className="font-bold text-sija-text mb-1">
                              {article.title}
                            </h3>
                            <p className="text-sm text-sija-text/60 font-medium line-clamp-1">
                              {article.description}
                            </p>
                          </div>
                        </div>

                        {canAccess ? (
                          <Link
                            href={
                              isEnrolled || isCreator
                                ? `/articles/${article.slug}?course=${course.slug}`
                                : `/articles/${article.slug}`
                            }
                            className="flex items-center gap-2 px-4 py-2 bg-sija-primary text-white font-bold border-2 border-sija-primary shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider text-sm whitespace-nowrap"
                          >
                            {isCreator ? 'View' : completed ? 'Review' : 'Start'}
                            <PlayCircle className="w-4 h-4" />
                          </Link>
                        ) : (
                          <div className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-600 font-bold border-2 border-gray-400 uppercase tracking-wider text-sm cursor-not-allowed">
                            <Lock className="w-4 h-4" />
                            Locked
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quiz Status Section */}
          {isEnrolled && !isCreator && quizStatus && quizStatus.summary.total > 0 && (
            <div className="mt-6 bg-sija-surface border-2 border-sija-primary shadow-hard p-6 md:p-8">
              <h2 className="font-display text-2xl font-bold text-sija-text mb-4 uppercase border-b-2 border-dashed border-sija-text/10 pb-4">
                Quiz Requirements
              </h2>

              <div className="bg-yellow-100 border-2 border-yellow-500 p-4 mb-6">
                <p className="text-sm font-bold text-yellow-900">
                  ⚠️ Anda harus lulus semua quiz untuk menyelesaikan course ini!
                </p>
              </div>

              {/* Progress Summary */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-sija-text uppercase tracking-wider">
                    Quiz Progress
                  </span>
                  <span className="text-2xl font-black text-sija-text">
                    {quizStatus.summary.passed}/{quizStatus.summary.total}
                  </span>
                </div>
                <div className="w-full bg-sija-light border-2 border-sija-primary h-4 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${quizStatus.summary.allPassed ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                    style={{ width: `${quizStatus.summary.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs font-bold text-sija-text/60 mt-2">
                  {quizStatus.summary.percentage}% Complete
                </p>
              </div>

              {/* Quiz List */}
              <div className="space-y-3">
                {quizStatus.quizzes.map((quiz: any, index: number) => {
                  const hasPassed = quiz.attempt?.passed;
                  const hasAttempted = quiz.attempt !== null;
                  const score = quiz.attempt?.score || 0;

                  return (
                    <div
                      key={quiz.quizId}
                      className={`border-2 p-4 transition-all ${hasPassed
                        ? 'bg-green-100 border-green-500'
                        : hasAttempted
                          ? 'bg-red-100 border-red-500'
                          : 'bg-gray-100 border-gray-300'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className={`w-10 h-10 border-2 flex items-center justify-center font-bold ${hasPassed
                              ? 'bg-green-500 border-green-700 text-white'
                              : hasAttempted
                                ? 'bg-red-500 border-red-700 text-white'
                                : 'bg-gray-300 border-gray-400 text-gray-600'
                              }`}
                          >
                            {hasPassed ? (
                              <CheckCircle2 className="w-6 h-6" />
                            ) : hasAttempted ? (
                              <XCircle className="w-6 h-6" />
                            ) : (
                              <Clock className="w-5 h-5" />
                            )}
                          </div>

                          <div className="flex-1">
                            <h3 className="font-bold text-sija-text mb-1">
                              {quiz.title}
                            </h3>
                            <div className="flex items-center gap-3 text-sm">
                              {hasAttempted && (
                                <span
                                  className={`font-bold ${hasPassed ? 'text-green-700' : 'text-red-700'
                                    }`}
                                >
                                  Score: {score}% (Passing: {quiz.passingScore}%)
                                </span>
                              )}
                              {!hasAttempted && (
                                <span className="font-medium text-gray-600">
                                  Not attempted yet • Passing: {quiz.passingScore}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <Link
                          href={hasPassed ? `/quiz/${quiz.quizId}/review` : `/quiz/${quiz.quizId}`}
                          className={`flex items-center gap-2 px-4 py-2 font-bold border-2 shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider text-sm whitespace-nowrap ${hasPassed
                            ? 'bg-green-500 text-white border-green-700'
                            : hasAttempted
                              ? 'bg-red-500 text-white border-red-700'
                              : 'bg-sija-primary text-white border-sija-primary'
                            }`}
                        >
                          {hasPassed ? 'Review ✓' : hasAttempted ? 'Retake' : 'Take Quiz'}
                          <PlayCircle className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Final Quiz Section */}
          {course.finalQuizId && (isEnrolled || isCreator) && (() => {
            // Check if final quiz is passed
            const finalQuizStatus = quizStatus?.quizzes?.find(
              (q: any) => q.quizId === course.finalQuizId?.toString()
            );
            const finalQuizPassed = finalQuizStatus?.attempt?.passed;

            return (
              <div className="mt-6 bg-sija-surface border-2 border-sija-primary shadow-hard p-6 md:p-8">
                <h2 className="font-display text-2xl font-bold text-sija-text mb-4 uppercase border-b-2 border-dashed border-sija-text/10 pb-4">
                  Final Quiz
                </h2>

                {finalQuizPassed ? (
                  // Quiz already passed - show completion status
                  <div className="bg-green-100 border-2 border-green-500 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                      <div>
                        <h3 className="font-bold text-green-900 uppercase tracking-wider text-lg">
                          Final Quiz Completed! ✓
                        </h3>
                        <p className="text-sm text-green-800 font-medium">
                          Score: {finalQuizStatus.attempt.score}% (Passing: {finalQuizStatus.passingScore}%)
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/quiz/${course.finalQuizId}/review`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-bold border-2 border-green-700 shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider text-sm mt-3"
                    >
                      Review Quiz
                      <PlayCircle className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-sija-text/70 font-medium mb-4">
                      Complete all modules to unlock the final quiz and test your knowledge!
                    </p>
                    {progress.percentage === 100 || isCreator ? (
                      <Link
                        href={`/quiz/${course.finalQuizId}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-sija-primary text-white font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider"
                      >
                        Take Final Quiz
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-600 font-bold border-2 border-gray-400 uppercase tracking-wider cursor-not-allowed inline-flex">
                        <Lock className="w-5 h-5" />
                        Complete All Modules First
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })()}

          {/* Additional Info */}
          {!isCreator && (
            <div className="mt-6 bg-blue-100 border-2 border-blue-500 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-blue-900 mb-2 uppercase tracking-wider">
                    Sequential Learning
                  </h3>
                  <p className="text-sm text-blue-800 font-medium">
                    Modules must be completed in order. Complete each module to unlock the next one.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Course Completion Handler - Automatically awards XP when all articles are completed */}
          {user && isEnrolled && !isCreator && (
            <CourseCompletionHandler
              courseId={course._id?.toString() || ''}
              totalArticles={articles.length}
              completedArticles={progress.completedArticles}
              isEnrolled={isEnrolled}
              isCreator={!!isCreator}
            />
          )}
        </div>
      </div >
    </div >
  );
}