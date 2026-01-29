// ============================================
// src/components/course/CourseArticleReader.tsx
// Course Article Reader - Sequential reading with scroll tracking
// ============================================

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ArticleDetail from '@/components/article/ArticleDetail';
import { Article } from '@/types';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';

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
        onArticleComplete(); // Refresh parent data
        setHasScrolledToBottom(true); // Ensure button stays enabled
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal menandai selesai');
      }
    } catch (error) {
      console.error('Mark complete error:', error);
      alert('Terjadi kesalahan');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleNavigation = (targetArticle: Article) => {
    // Check if target is locked
    const targetIndex = allArticles.findIndex(
      (a) => a._id?.toString() === targetArticle._id?.toString()
    );

    // Check if all previous articles are completed
    if (targetIndex > 0) {
      const allPreviousCompleted = allArticles
        .slice(0, targetIndex)
        .every((a) =>
          completedArticleIds.some((id) => id.toString() === a._id?.toString())
        );

      if (!allPreviousCompleted) {
        alert('Anda harus menyelesaikan artikel sebelumnya terlebih dahulu!');
        return;
      }
    }

    router.push(`/articles/${targetArticle.slug}?course=${courseSlug}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Course Context Bar */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-700 font-medium">
              📚 Sedang Belajar Course
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Artikel {currentIndex + 1} dari {allArticles.length}
            </p>
          </div>
          <button
            onClick={() => router.push(`/courses/${courseSlug}`)}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Kembali ke Course
          </button>
        </div>
      </div>

      {/* Article Content */}
      <div ref={contentRef}>
        <ArticleDetail article={article} />
      </div>

      {/* Scroll Progress Indicator (when not completed) */}
      {!isCurrentCompleted && !hasScrolledToBottom && (
        <div className="fixed bottom-8 right-8 bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 shadow-lg max-w-xs animate-bounce">
          <div className="flex items-center gap-3">
            <div className="text-3xl">👇</div>
            <div>
              <p className="text-sm font-semibold text-yellow-900">
                Scroll ke bawah
              </p>
              <p className="text-xs text-yellow-700">
                Baca artikel sampai selesai untuk melanjutkan
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mark Complete Button (appears after scrolling) */}
      {!isCurrentCompleted && hasScrolledToBottom && (
        <div className="mt-8 bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">
          <div className="text-5xl mb-3">✅</div>
          <h3 className="text-xl font-bold text-green-900 mb-2">
            Sudah selesai membaca?
          </h3>
          <p className="text-green-700 mb-4">
            Tandai artikel ini sebagai selesai untuk melanjutkan ke artikel berikutnya
          </p>
          <button
            onClick={handleMarkComplete}
            disabled={isCompleting}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCompleting ? 'Menyimpan...' : '✓ Tandai Selesai'}
          </button>
        </div>
      )}

      {/* Completion Success */}
      {isCurrentCompleted && (
        <div className="mt-8 bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="text-xl font-bold text-green-900 mb-2">
            Artikel Selesai!
          </h3>
          <p className="text-green-700">
            Anda telah menyelesaikan artikel ini
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between items-center gap-4 pb-12">
        {/* Previous Button */}
        <div className="flex-1">
          {previousArticle ? (
            <button
              onClick={() => handleNavigation(previousArticle)}
              className="w-full text-left bg-white border-2 border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="text-sm text-gray-500 mb-1">← Sebelumnya</div>
              <div className="font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2">
                {previousArticle.title}
              </div>
            </button>
          ) : (
            <div className="text-sm text-gray-400 text-center py-4">
              Artikel pertama
            </div>
          )}
        </div>

        {/* Next Button */}
        <div className="flex-1">
          {nextArticle ? (
            isNextUnlocked ? (
              <button
                onClick={() => handleNavigation(nextArticle)}
                className="w-full text-right bg-blue-600 text-white rounded-lg p-4 hover:bg-blue-700 hover:shadow-md transition-all group"
              >
                <div className="text-sm text-blue-100 mb-1">Selanjutnya →</div>
                <div className="font-semibold group-hover:text-white line-clamp-2">
                  {nextArticle.title}
                </div>
              </button>
            ) : (
              <div className="w-full text-right bg-gray-200 rounded-lg p-4 cursor-not-allowed opacity-60">
                <div className="text-sm text-gray-500 mb-1">🔒 Terkunci</div>
                <div className="font-semibold text-gray-600 line-clamp-2">
                  {nextArticle.title}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Selesaikan artikel ini terlebih dahulu
                </div>
              </div>
            )
          ) : (
            <button
              onClick={() => router.push(`/courses/${courseSlug}`)}
              className="w-full text-right bg-green-600 text-white rounded-lg p-4 hover:bg-green-700 hover:shadow-md transition-all"
            >
              <div className="text-sm text-green-100 mb-1">🎓 Selesai</div>
              <div className="font-semibold">Kembali ke Course</div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}