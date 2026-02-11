

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import ArticleDetail from '@/components/article/ArticleDetail';
import Breadcrumb from '@/components/common/Breadcrumb';
import CourseArticleReader from '@/components/course/CourseArticleReader';
import CommentItem from '@/components/comment/CommentItem';
import ArticleAccessLoader from '@/components/article/ArticleAccessLoader';
import { Article, Comment, ArticleType } from '@/types';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import { Lock, BookOpen, GraduationCap, Home, Search, AlertCircle, LogIn, Loader2 } from 'lucide-react';

interface PageState {
  article: Article | null;
  loading: boolean;
  accessDenied: boolean;
}

interface CourseContext {
  courseId: string;
  courseSlug: string;
  allArticles: Article[];
  completedArticleIds: string[];
}

function ArticleDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const courseSlugParam = searchParams.get('course'); // ?course=slug
  const { user, loading: authLoading } = useAuth();

  const [pageState, setPageState] = useState<PageState>({
    article: null,
    loading: true,
    accessDenied: false,
  });

  const [courseContext, setCourseContext] = useState<CourseContext | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAccessLoader, setShowAccessLoader] = useState(false);


  const isInCourseMode = !!courseSlugParam;

  useEffect(() => {
    if (authLoading) {
      console.log('⏳ Waiting for auth...');
      return;
    }

    console.log('✅ Auth ready, loading article...');
    loadArticle();
  }, [slug, user, authLoading]);


  useEffect(() => {
    if (isInCourseMode && courseSlugParam && user && pageState.article) {
      loadCourseContext(courseSlugParam);
    }
  }, [isInCourseMode, courseSlugParam, user, pageState.article]);

  const loadArticle = async () => {
    setPageState({ article: null, loading: true, accessDenied: false });

    try {
      const viewedKey = `viewed-article-${slug}`;
      const hasViewed = checkRecentView(viewedKey);

      const viewParam = hasViewed ? '' : '?view=true';
      const res = await fetch(`/api/articles/${slug}${viewParam}`);

      if (!res.ok) {
        setPageState({ article: null, loading: false, accessDenied: false });
        return;
      }

      const data = await res.json();

      if (!hasViewed) {
        markAsViewed(viewedKey);
      }


      if (data.type === ArticleType.COURSE_ONLY) {
        console.log('📌 COURSE_ONLY - checking access...');

        const hasAccess = await checkArticleAccess(data);

        if (!hasAccess) {
          console.log('❌ DENIED');
          setPageState({
            article: data,
            loading: false,
            accessDenied: true,
          });
          return;
        }

        console.log('✅ GRANTED');
      }

      setPageState({
        article: data,
        loading: false,
        accessDenied: false,
      });

      if (data._id && !isInCourseMode) {
        const commentsRes = await fetch(`/api/comments?articleId=${data._id}`);
        const commentsData = await commentsRes.json();
        if (commentsData?.comments) {
          setComments(commentsData.comments);
        }
      }
    } catch (error) {
      console.error('Load error:', error);
      setPageState({ article: null, loading: false, accessDenied: false });
    }
  };

  const loadCourseContext = async (courseSlug: string) => {
    try {
      const courseRes = await fetch(`/api/courses/${courseSlug}`);
      if (!courseRes.ok) return;

      const course = await courseRes.json();

      const articlePromises = (course.articles || []).map((articleId: any) =>
        fetch(`/api/articles/${articleId}`).then((r) => r.json())
      );
      const articles = await Promise.all(articlePromises);

      const progressRes = await fetch(`/api/enrollments/${course._id}/progress`, {
        headers: getAuthHeaders(),
      });

      let completedIds: string[] = [];
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        completedIds = progressData.progress?.completedArticles || [];
      }

      setCourseContext({
        courseId: course._id,
        courseSlug: course.slug,
        allArticles: articles.filter((a) => a && !a.error),
        completedArticleIds: completedIds,
      });

      if (pageState.article) {
        const isCompleted = completedIds.some(
          (id: string) => id.toString() === pageState.article!._id?.toString()
        );

        if (!isCompleted) {
          setShowAccessLoader(true);
        }
      }
    } catch (error) {
      console.error('Load course context error:', error);
    }
  };

  const handleAccessComplete = () => {
    setShowAccessLoader(false);
    if (courseSlugParam) {
      loadCourseContext(courseSlugParam);
    }
  };

  const checkRecentView = (key: string): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      const viewData = localStorage.getItem(key);
      if (!viewData) return false;

      const { timestamp } = JSON.parse(viewData);
      const oneHour = 60 * 60 * 1000;
      return (Date.now() - timestamp) < oneHour;
    } catch {
      return false;
    }
  };

  const markAsViewed = (key: string): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(key, JSON.stringify({
        timestamp: Date.now(),
        slug: slug,
      }));
    } catch (error) {
      console.error('Mark viewed error:', error);
    }
  };

  const checkArticleAccess = async (article: Article): Promise<boolean> => {
    if (!user) {
      console.log('❌ No user');
      return false;
    }

    const normalizeId = (id: any): string => {
      if (!id) return '';
      if (typeof id === 'string') return id;
      if (id._id) return id._id.toString();
      if (id.toString) return id.toString();
      return String(id);
    };

    const authorId = normalizeId(article.author);
    const userId = normalizeId(user.id);

    if (authorId === userId) {
      console.log('✅ AUTHOR');
      return true;
    }

    if (user.role === 'admin') {
      console.log('✅ ADMIN');
      return true;
    }

    console.log('🔍 Checking enrollments...');
    try {
      const enrollRes = await fetch('/api/enrollments', {
        headers: getAuthHeaders(),
      });

      if (!enrollRes.ok) {
        console.log('❌ Enroll fetch failed');
        return false;
      }

      const enrollData = await enrollRes.json();
      const enrollments = enrollData.enrollments || [];

      console.log(`Found ${enrollments.length} enrollments`);

      for (const enrollment of enrollments) {
        const courseRes = await fetch(`/api/courses/${enrollment.courseId}`);
        if (!courseRes.ok) continue;

        const course = await courseRes.json();

        if (course.articles && Array.isArray(course.articles)) {
          const hasArticle = course.articles.some((aid: any) =>
            normalizeId(aid) === normalizeId(article._id)
          );

          if (hasArticle) {
            console.log(`✅ In course: ${course.title}`);
            return true;
          }
        }
      }

      console.log('❌ Not in any course');
      return false;
    } catch (error) {
      console.error('❌ Enroll error:', error);
      return false;
    }
  };

  const loadComments = async () => {
    if (!pageState.article) return;

    try {
      const res = await fetch(`/api/comments?articleId=${pageState.article._id}`);
      const data = await res.json();
      if (data?.comments) setComments(data.comments);
    } catch (error) {
      console.error('Load comments error:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !pageState.article) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          articleId: pageState.article._id,
          content: newComment,
        }),
      });

      if (res.ok) {
        setNewComment('');
        await loadComments();
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal mengirim komentar');
      }
    } catch (error) {
      console.error('Comment error:', error);
      alert('Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArticleComplete = () => {
    if (courseSlugParam) {
      loadCourseContext(courseSlugParam);
    }
  };

  const { article, loading, accessDenied } = pageState;

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-sija-primary mx-auto mb-4" />
        <p className="text-sija-text font-bold uppercase tracking-wider">Loading...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center bg-sija-surface border-4 border-sija-primary shadow-hard p-12 transition-colors duration-300">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 dark:bg-red-950/30 border-4 border-red-500 dark:border-red-400 shadow-hard-sm mb-6 transition-colors duration-300">
            <AlertCircle className="w-16 h-16 text-red-500 dark:text-red-400" />
          </div>
          <h1 className="font-display text-3xl font-black text-sija-text mb-6 uppercase">
            Artikel Tidak Ditemukan
          </h1>
          <button
            onClick={() => router.push('/articles')}
            className="inline-flex items-center gap-2 bg-sija-primary text-white px-6 py-3 border-4 border-sija-primary font-bold shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider"
          >
            <Home className="w-5 h-5" />
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-sija-light border-4 border-sija-primary shadow-hard p-8 transition-colors duration-300">
          <div className="text-center mb-8">
            <div className="inline-block bg-sija-primary p-6 border-4 border-sija-primary shadow-hard mb-6">
              <Lock className="w-16 h-16 text-white" />
            </div>
            <h1 className="font-display text-3xl font-black text-sija-primary mb-4 uppercase">
              Artikel Terkunci
            </h1>
            <p className="text-sija-text font-bold text-xl mb-2">
              {article.title}
            </p>
            <p className="text-sija-text/70 font-medium">
              Artikel ini hanya bisa diakses melalui course yang sudah Anda daftar.
            </p>
          </div>

          <div className="bg-sija-surface border-4 border-sija-border shadow-hard p-6 mb-8 transition-colors duration-300">
            <h3 className="font-display font-black text-sija-text mb-4 uppercase text-lg">Cara Mengakses:</h3>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="bg-sija-primary text-white font-black px-3 py-1 border-2 border-sija-primary shadow-hard-sm flex-shrink-0">1</span>
                <span className="text-sija-text font-medium flex-1 pt-1">Cari course yang berisi artikel ini</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-sija-primary text-white font-black px-3 py-1 border-2 border-sija-primary shadow-hard-sm flex-shrink-0">2</span>
                <span className="text-sija-text font-medium flex-1 pt-1">Daftar course tersebut</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-sija-primary text-white font-black px-3 py-1 border-2 border-sija-primary shadow-hard-sm flex-shrink-0">3</span>
                <span className="text-sija-text font-medium flex-1 pt-1">Akses artikel melalui materi course</span>
              </li>
            </ol>
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            {user ? (
              <>
                <button
                  onClick={() => router.push('/courses')}
                  className="inline-flex items-center gap-2 bg-sija-primary text-white px-6 py-3 border-4 border-sija-primary font-bold shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider"
                >
                  <Search className="w-5 h-5" />
                  Jelajahi Course
                </button>
                <button
                  onClick={() => router.push('/my-courses')}
                  className="inline-flex items-center gap-2 bg-sija-surface text-sija-text px-6 py-3 border-4 border-sija-border font-bold shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider"
                >
                  <BookOpen className="w-5 h-5" />
                  Course Saya
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="inline-flex items-center gap-2 bg-sija-primary text-white px-6 py-3 border-4 border-sija-primary font-bold shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider"
                >
                  <LogIn className="w-5 h-5" />
                  Login
                </button>
                <button
                  onClick={() => router.push('/courses')}
                  className="inline-flex items-center gap-2 bg-sija-surface text-sija-text px-6 py-3 border-4 border-sija-border font-bold shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider"
                >
                  <Search className="w-5 h-5" />
                  Lihat Course
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }


  if (isInCourseMode && courseContext) {
    if (showAccessLoader && article) {
      return (
        <ArticleAccessLoader
          courseId={courseContext.courseId}
          articleId={article._id?.toString() || ''}
          onComplete={handleAccessComplete}
        />
      );
    }

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CourseArticleReader
          article={article}
          courseId={courseContext.courseId}
          courseSlug={courseContext.courseSlug}
          allArticles={courseContext.allArticles}
          completedArticleIds={courseContext.completedArticleIds}
          onArticleComplete={handleArticleComplete}
        />
      </div>
    );
  }


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb
          className="-mx-4 sm:-mx-6 lg:-mx-8"
          items={[
            { label: 'Articles', href: '/articles' },
            { label: article.title }
          ]}
        />
      </div>
      <ArticleDetail article={article} />

      <div className="max-w-4xl mx-auto mt-12 border-t-4 border-sija-primary pt-8">
        <h2 className="font-display text-3xl font-black text-sija-text mb-6 uppercase">
          Komentar ({comments.length})
        </h2>

        {user ? (
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-4 border-4 border-sija-border bg-sija-background text-sija-text shadow-hard focus:outline-none focus:shadow-none focus:border-sija-primary focus:translate-x-[2px] focus:translate-y-[2px] transition-all font-medium duration-300"
              rows={4}
              placeholder="Tulis komentar..."
              required
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="mt-4 bg-sija-primary text-white px-6 py-3 border-4 border-sija-primary font-bold shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider"
            >
              {submitting ? 'Mengirim...' : 'Kirim Komentar'}
            </button>
          </form>
        ) : (
          <div className="mb-8 p-6 bg-sija-light border-4 border-sija-primary shadow-hard text-center transition-colors duration-300">
            <p className="text-sija-text font-bold mb-4 uppercase tracking-wider">
              Login untuk memberikan komentar
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-2 bg-sija-primary text-white px-6 py-3 border-4 border-sija-primary font-bold shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider"
            >
              <LogIn className="w-5 h-5" />
              Login
            </a>
          </div>
        )}

        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-12 bg-sija-light border-4 border-sija-primary shadow-hard transition-colors duration-300">
              <p className="text-sija-text font-bold uppercase tracking-wider">
                Belum ada komentar. Jadilah yang pertama!
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment._id?.toString()}
                comment={comment}
                onUpdate={loadComments}
                onDelete={loadComments}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function ArticleDetailPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <Loader2 className="w-16 h-16 animate-spin text-sija-primary mx-auto mb-4" />
        <p className="text-sija-text font-bold uppercase tracking-wider">Loading Article...</p>
      </div>
    }>
      <ArticleDetailContent />
    </Suspense>
  );
}