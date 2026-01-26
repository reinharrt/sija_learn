'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import { UserRole, Article } from '@/types';
import { formatDate } from '@/lib/utils';

export default function MyArticlesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || 
        (user.role !== UserRole.WRITER && 
         user.role !== UserRole.COURSE_ADMIN && 
         user.role !== UserRole.ADMIN))) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && (user.role === UserRole.WRITER || user.role === UserRole.COURSE_ADMIN || user.role === UserRole.ADMIN)) {
      loadMyArticles();
    }
  }, [user]);

  const loadMyArticles = () => {
    if (!user) return;
    
    setLoading(true);
    fetch(`/api/articles?author=${user.id}&limit=100`)
      .then(res => res.json())
      .then(data => setArticles(data.articles || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleDelete = async (articleId: string, articleSlug: string) => {
    if (!confirm('Yakin ingin menghapus artikel ini?')) return;

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        loadMyArticles();
      } else {
        alert('Gagal menghapus artikel');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Terjadi kesalahan');
    }
  };

  const togglePublish = async (articleId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ published: !currentStatus }),
      });

      if (response.ok) {
        loadMyArticles();
      } else {
        alert('Gagal mengubah status publikasi');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Terjadi kesalahan');
    }
  };

  if (authLoading || loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Artikel Saya</h1>
          <p className="text-gray-600 mt-2">Kelola semua artikel yang Anda buat</p>
        </div>
        <Link
          href="/articles/create"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Buat Artikel Baru
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-medium">Total Artikel</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{articles.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-medium">Published</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {articles.filter(a => a.published).length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-medium">Draft</div>
          <div className="text-3xl font-bold text-gray-600 mt-2">
            {articles.filter(a => !a.published).length}
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {articles.map((article) => (
              <tr key={article._id?.toString()}>
                <td className="px-6 py-4">
                  <Link 
                    href={`/articles/${article.slug}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {article.title}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {article.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => togglePublish(article._id!.toString(), article.published)}
                    className={`text-xs px-2 py-1 rounded ${
                      article.published 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {article.published ? '✓ Published' : '○ Draft'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  👁️ {article.views || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(article.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                  <Link
                    href={`/articles/${article.slug}/edit`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    ✏️ Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(article._id!.toString(), article.slug)}
                    className="text-red-600 hover:text-red-900"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {articles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">📝</div>
            <p className="text-gray-500 mb-4">Anda belum memiliki artikel</p>
            <Link
              href="/articles/create"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Buat Artikel Pertama
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}