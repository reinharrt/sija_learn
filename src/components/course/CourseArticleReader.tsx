// ============================================
// src/components/course/CourseArticleReader.tsx
// Course Article Reader - Sequential reading with scroll tracking
// NEOBRUTALIST STYLE VERSION
// ============================================

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ArticleDetail from '@/components/article/ArticleDetail';
import { Article } from '@/types';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { BookOpen, Check, Lock, ArrowLeft, ArrowRight, ChevronDown, ArrowDown, CheckCircle2, Trophy, GraduationCap } from 'lucide-react';

interface CourseArticleReaderProps {
  article: Article;
  courseId: string;
  courseSlug: string;
  allArticles: Article[]; // Semua artikel dalam course (terurut)
  completedArticleIds: string[]; // Array of completed article IDs
  onArticleComplete: () => void; // Callback setelah tandai selesai
}

export default function CourseArticleReader({
  article,
  courseId,
  courseSlug,
  allArticles,
  completedArticleIds,
  onArticleComplete,
}: CourseArticleReaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useNotification();
  const contentRef = useRef<HTMLDivElement>(null);

  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Find current article index and navigation info
  const currentIndex = allArticles.findIndex(
    (a) => a._id?.toString() === article._id?.toString()
  );
  const isFirstArticle = currentIndex === 0;
  const isLastArticle = currentIndex === allArticles.length - 1;
  const previousArticle = !isFirstArticle ? allArticles[currentIndex - 1] : null;
  const nextArticle = !isLastArticle ? allArticles[currentIndex + 1] : null;

  // Check if current article is completed
  const isCurrentCompleted = completedArticleIds.some(
    (id) => id.toString() === article._id?.toString()
  );

  // Check if next article is unlocked (previous must be completed)
  const isNextUnlocked = !nextArticle || isCurrentCompleted;

  // Check if user can mark as complete (must scroll to bottom first)
  const canMarkComplete = hasScrolledToBottom && !isCurrentCompleted;

  // Scroll tracking
  useEffect(() => {
    if (isCurrentCompleted) {
      setHasScrolledToBottom(true);
      return;
    }

    const handleScroll = () => {
      if (!contentRef.current) return;

      const element = contentRef.current;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      // User has scrolled to 90% of the page
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      if (scrollPercentage >= 0.9) {
        setHasScrolledToBottom(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isCurrentCompleted]);

  const handleMarkComplete = async () => {
    if (!canMarkComplete || !user || !courseId) return;

    setIsCompleting(true);
    try {
      const res = await fetch(`/api/enrollments/${courseId}/progress`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ articleId: article._id }),
      });

      if (res.ok) {
        onArticleComplete();
        setHasScrolledToBottom(true);
      } else {
        const data = await res.json();
        showToast('error', data.error || 'Gagal menandai selesai');
      }
    } catch (error) {
      console.error('Mark complete error:', error);
      showToast('error', 'Terjadi kesalahan');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleNavigation = (targetArticle: Article) => {
    const targetIndex = allArticles.findIndex(
      (a) => a._id?.toString() === targetArticle._id?.toString()
    );

    if (targetIndex > 0) {
      const allPreviousCompleted = allArticles
        .slice(0, targetIndex)
        .every((a) =>
          completedArticleIds.some((id) => id.toString() === a._id?.toString())
        );

      if (!allPreviousCompleted) {
        showToast('warning', 'Anda harus menyelesaikan artikel sebelumnya terlebih dahulu!');
        return;
      }
    }

    router.push(`/articles/${targetArticle.slug}?course=${courseSlug}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Course Context Bar - NEOBRUTALIST */}
      <div className="bg-sija-primary text-white border-4 border-sija-primary shadow-hard p-6 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap className="w-6 h-6" />
              <p className="font-display font-black uppercase tracking-wider text-lg">
                Sedang Belajar Course
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white text-sija-primary px-3 py-1 border-2 border-white font-black shadow-hard-sm">
                {currentIndex + 1}
              </span>
              <span className="font-bold">dari</span>
              <span className="bg-white text-sija-primary px-3 py-1 border-2 border-white font-black shadow-hard-sm">
                {allArticles.length}
              </span>
              <span className="font-bold">artikel</span>
            </div>
          </div>
          <button
            onClick={() => router.push(`/courses/${courseSlug}`)}
            className="inline-flex items-center gap-2 bg-white text-sija-primary px-6 py-3 border-2 border-white font-bold shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Course
          </button>
        </div>
      </div>

      {/* Article Content */}
      <div ref={contentRef}>
        <ArticleDetail article={article} />
      </div>

      {/* Scroll Progress Indicator - NEOBRUTALIST */}
      {!isCurrentCompleted && !hasScrolledToBottom && (
        <div className="fixed bottom-8 right-8 bg-yellow-300 border-4 border-sija-text shadow-hard p-6 max-w-xs animate-bounce">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-400 border-2 border-sija-text p-3 shadow-hard-sm">
              <ArrowDown className="w-8 h-8 text-sija-text" />
            </div>
            <div>
              <p className="font-display font-black text-sija-text mb-1 uppercase text-sm">
                Scroll ke bawah
              </p>
              <p className="text-sija-text font-bold text-xs">
                Baca artikel sampai selesai untuk melanjutkan
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center">
            <ChevronDown className="w-6 h-6 text-sija-text animate-bounce" />
          </div>
        </div>
      )}

      {/* Completion Card - Always visible with different states */}
      <div className={`mt-12 border-4 shadow-hard p-8 transition-all duration-500 ${isCurrentCompleted
          ? 'bg-green-300 border-sija-text'
          : hasScrolledToBottom
            ? 'bg-yellow-300 border-sija-text'
            : 'bg-gray-100 border-gray-300 opacity-50'
        }`}>
        <div className="text-center">
          {/* Icon - Changes based on state */}
          <div className={`inline-flex items-center justify-center w-20 h-20 border-4 shadow-hard-sm mb-4 transition-all duration-500 ${isCurrentCompleted
              ? 'bg-green-400 border-sija-text'
              : hasScrolledToBottom
                ? 'bg-yellow-400 border-sija-text'
                : 'bg-gray-200 border-gray-400'
            }`}>
            {isCurrentCompleted ? (
              <Trophy className="w-12 h-12 text-sija-text" />
            ) : hasScrolledToBottom ? (
              <CheckCircle2 className="w-12 h-12 text-sija-text" />
            ) : (
              <Lock className="w-12 h-12 text-gray-400" />
            )}
          </div>

          {/* Title - Changes based on state */}
          <h3 className={`font-display text-3xl font-black mb-3 uppercase transition-all duration-500 ${isCurrentCompleted || hasScrolledToBottom ? 'text-sija-text' : 'text-gray-400'
            }`}>
            {isCurrentCompleted
              ? 'Artikel Selesai!'
              : hasScrolledToBottom
                ? 'Sudah selesai membaca?'
                : 'Baca Sampai Selesai'}
          </h3>

          {/* Description - Changes based on state */}
          <p className={`font-bold text-lg mb-6 transition-all duration-500 ${isCurrentCompleted || hasScrolledToBottom ? 'text-sija-text' : 'text-gray-500'
            }`}>
            {isCurrentCompleted
              ? 'Anda telah menyelesaikan artikel ini'
              : hasScrolledToBottom
                ? 'Tandai artikel ini sebagai selesai untuk melanjutkan ke artikel berikutnya'
                : 'Scroll ke bawah untuk membaca seluruh artikel'}
          </p>

          {/* Action - Changes based on state */}
          {isCurrentCompleted ? (
            <div className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 border-4 border-sija-text shadow-hard">
              <Check className="w-5 h-5" />
              <span className="font-black uppercase tracking-wider">Completed</span>
            </div>
          ) : hasScrolledToBottom ? (
            <button
              onClick={handleMarkComplete}
              disabled={isCompleting}
              className="inline-flex items-center gap-3 bg-green-600 text-white px-8 py-4 border-4 border-sija-text font-black text-lg shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider"
            >
              <Check className="w-6 h-6" />
              {isCompleting ? 'Menyimpan...' : 'Tandai Selesai'}
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 bg-gray-300 text-gray-500 px-6 py-3 border-4 border-gray-400 cursor-not-allowed">
              <ChevronDown className="w-5 h-5 animate-bounce" />
              <span className="font-black uppercase tracking-wider">Locked</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons - NEOBRUTALIST */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        {/* Previous Button */}
        <div>
          {previousArticle ? (
            <button
              onClick={() => handleNavigation(previousArticle)}
              className="w-full text-left bg-sija-surface border-4 border-sija-text shadow-hard p-6 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <ArrowLeft className="w-5 h-5 text-sija-primary" />
                <span className="font-display font-black text-sija-primary uppercase text-sm tracking-wider">
                  Sebelumnya
                </span>
              </div>
              <div className="font-bold text-sija-text group-hover:text-sija-primary line-clamp-2 transition-colors">
                {previousArticle.title}
              </div>
            </button>
          ) : (
            <div className="w-full bg-gray-100 border-4 border-gray-300 shadow-hard p-6 opacity-50">
              <div className="text-center">
                <p className="font-display font-black text-gray-500 uppercase text-sm tracking-wider">
                  Artikel Pertama
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Next Button */}
        <div>
          {nextArticle ? (
            isNextUnlocked ? (
              <button
                onClick={() => handleNavigation(nextArticle)}
                className="w-full text-right bg-sija-primary text-white border-4 border-sija-text shadow-hard p-6 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all group"
              >
                <div className="flex items-center justify-end gap-2 mb-2">
                  <span className="font-display font-black uppercase text-sm tracking-wider">
                    Selanjutnya
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div className="font-bold line-clamp-2">
                  {nextArticle.title}
                </div>
              </button>
            ) : (
              <div className="w-full bg-gray-200 border-4 border-gray-400 shadow-hard p-6 opacity-60 cursor-not-allowed">
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 mb-2">
                    <Lock className="w-5 h-5 text-gray-600" />
                    <span className="font-display font-black text-gray-600 uppercase text-sm tracking-wider">
                      Terkunci
                    </span>
                  </div>
                  <div className="font-bold text-gray-600 line-clamp-2 mb-2">
                    {nextArticle.title}
                  </div>
                  <div className="inline-block bg-gray-400 text-gray-700 px-3 py-1 border-2 border-gray-500 font-bold text-xs uppercase tracking-wider">
                    Selesaikan artikel ini dulu
                  </div>
                </div>
              </div>
            )
          ) : (
            <button
              onClick={() => router.push(`/courses/${courseSlug}`)}
              className="w-full text-right bg-green-600 text-white border-4 border-sija-text shadow-hard p-6 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <div className="flex items-center justify-end gap-2 mb-2">
                <GraduationCap className="w-5 h-5" />
                <span className="font-display font-black uppercase text-sm tracking-wider">
                  Selesai
                </span>
              </div>
              <div className="font-bold">
                Kembali ke Course
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}