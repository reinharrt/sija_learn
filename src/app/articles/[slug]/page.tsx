'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ArticleDetail from '@/components/article/ArticleDetail';
import CommentItem from '@/components/comment/CommentItem';
import { Article, Comment, ArticleType } from '@/types';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user } = useAuth();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    loadArticleAndCheckAccess();
  }, [slug, user]);

  const loadArticleAndCheckAccess = async () => {
    setLoading(true);
    setCheckingAccess(true);
    
    try {
      const res = await fetch(`/api/articles/${slug}?view=true`);
      const data = await res.json();
      
      if (!res.ok) {
        setLoading(false);
        setCheckingAccess(false);
        return;
      }

      setArticle(data);

      // 🆕 Check if article is COURSE_ONLY
      if (data.type === ArticleType.COURSE_ONLY) {
        // Check if user has access
        const canAccess = await checkArticleAccess(data);
        
        if (!canAccess) {
          setAccessDenied(true);
          setCheckingAccess(false);
          setLoading(false);
          return;
        }
      }

      // Load comments if user has access
      if (data._id) {
        const commentsRes = await fetch(`/api/comments?articleId=${data._id}`);
        const commentsData = await commentsRes.json();
        if (commentsData?.comments) setComments(commentsData.comments);
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
      setCheckingAccess(false);
    }
  };

  const checkArticleAccess = async (article: Article): Promise<boolean> => {
    // ✅ FIX: Not logged in = no access to COURSE_ONLY
    if (!user) {
      return false;
    }

    // ✅ FIX: Author can ALWAYS access their own articles (even COURSE_ONLY)
    if (article.author.toString() === user.id) {
      return true;
    }

    // ✅ FIX: Admin can access everything
    if (user.role === 'admin') {
      return true;
    }

    // ✅ Check if user is enrolled in any course that contains this article
    try {
      const enrollmentsRes = await fetch('/api/enrollments', {
        headers: getAuthHeaders(),
      });
      const enrollmentsData = await enrollmentsRes.json();
      const enrollments = enrollmentsData.enrollments || [];

      // Check each enrolled course to see if it contains this article
      for (const enrollment of enrollments) {
        const courseRes = await fetch(`/api/courses/${enrollment.courseId}`);
        const course = await courseRes.json();
        
        if (course.articles && course.articles.some((id: any) => id.toString() === article._id?.toString())) {
          return true; // User is enrolled in a course that has this article
        }
      }

      return false; // Not enrolled in any course with this article
    } catch (error) {
      console.error('Check access error:', error);
      return false;
    }
  };

  const loadComments = async () => {
    if (!article) return;
    
    try {
      const response = await fetch(`/api/comments?articleId=${article._id}`);
      const data = await response.json();
      if (data?.comments) setComments(data.comments);
    } catch (error) {
      console.error('Load comments error:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !article) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          articleId: article._id,
          content: newComment,
        }),
      });

      if (response.ok) {
        setNewComment('');
        await loadComments();
      } else {
        const data = await response.json();
        alert(data.error || 'Gagal mengirim komentar');
      }
    } catch (error) {
      console.error('Comment error:', error);
      alert('Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || checkingAccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // 🆕 Access Denied Screen
  if (accessDenied && article) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Artikel Terkunci
          </h1>
          <p className="text-gray-700 mb-2">
            <strong>{article.title}</strong>
          </p>
          <p className="text-gray-600 mb-6">
            Artikel ini hanya bisa diakses melalui course yang sudah Anda daftar.
          </p>
          
          <div className="bg-white rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Cara Mengakses:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Cari course yang berisi artikel ini</li>
              <li>Daftar course tersebut</li>
              <li>Akses artikel melalui materi course</li>
            </ol>
          </div>

          <div className="flex gap-3 justify-center">
            {user ? (
              <>
                <button
                  onClick={() => router.push('/courses')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  🔍 Jelajahi Course
                </button>
                <button
                  onClick={() => router.push('/my-courses')}
                  className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300"
                >
                  📚 Course Saya
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  🔐 Login untuk Lanjut
                </button>
                <button
                  onClick={() => router.push('/courses')}
                  className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300"
                >
                  🔍 Lihat Course
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold mb-4">Artikel tidak ditemukan</h1>
        <button
          onClick={() => router.push('/articles')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Kembali ke Artikel
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ArticleDetail article={article} />

      <div className="max-w-4xl mx-auto mt-12 border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">
          Komentar ({comments.length})
        </h2>

        {user ? (
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Tulis komentar..."
              required
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Mengirim...' : 'Kirim Komentar'}
            </button>
          </form>
        ) : (
          <div className="mb-8 p-4 bg-gray-50 rounded text-center">
            <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Login
            </a>{' '}
            untuk memberikan komentar
          </div>
        )}

        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Belum ada komentar. Jadilah yang pertama berkomentar!
            </p>
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