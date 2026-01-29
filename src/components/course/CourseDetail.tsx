// ============================================
// src/components/course/CourseDetail.tsx
// Course Detail Component - WITH ENROLLMENT STATE
// ============================================

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Course, Article } from '@/types';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  User,
  Lock,
  CheckCircle2,
  PlayCircle,
  LogOut,
  AlertCircle
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

  useEffect(() => {
    if (course.articles && course.articles.length > 0) {
      loadArticles();
    }
  }, [course.articles]);

  useEffect(() => {
    if (isEnrolled && user) {
      loadProgress();
    }
  }, [isEnrolled, user]);

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
      const res = await fetch(`/api/enrollments/${course._id}/progress`, {
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setProgress({
          completedArticles: data.progress.completedArticles || [],
          percentage: data.progress.percentage || 0,
        });
      }
    } catch (error) {
      console.error('Load progress error:', error);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      alert('Silakan login terlebih dahulu!');
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
    if (index === 0) return true; // First article always unlocked
    
    // Previous article must be completed
    const previousArticle = articles[index - 1];
    if (!previousArticle || !previousArticle._id) return false;
    
    return isArticleCompleted(previousArticle._id.toString());
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Course Header - Neobrutalist */}
      <div className="bg-sija-surface border-2 border-sija-primary shadow-hard mb-8 overflow-hidden">
        {course.thumbnail && (
          <div className="relative w-full h-64 md:h-80 border-b-2 border-sija-primary">
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover"
              priority
            />
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
            {!user ? (
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
              const unlocked = isEnrolled ? isArticleUnlocked(index) : false;
              const canAccess = !isEnrolled || unlocked;

              return (
                <div
                  key={article._id?.toString() || index}
                  className={`border-2 p-4 transition-all ${
                    completed
                      ? 'bg-green-100 border-green-500'
                      : !canAccess
                      ? 'bg-gray-100 border-gray-300 opacity-60'
                      : 'bg-sija-light border-sija-primary hover:shadow-hard-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-10 h-10 border-2 flex items-center justify-center font-bold ${
                          completed
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
                          isEnrolled
                            ? `/articles/${article.slug}?course=${course.slug}`
                            : `/articles/${article.slug}`
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-sija-primary text-white font-bold border-2 border-sija-primary shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider text-sm whitespace-nowrap"
                      >
                        {completed ? 'Review' : 'Start'}
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

      {/* Additional Info */}
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
    </div>
  );
}