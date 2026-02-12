

// src/app/my-articles/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { UserRole, Article } from '@/types';
import { formatDate } from '@/lib/utils';
import { FileText, Eye, Edit, Trash2, Plus, CheckCircle, Circle, Globe, Lock } from 'lucide-react';

export default function MyArticlesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast, showConfirm } = useNotification();
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
    const confirmed = await showConfirm({
      title: 'Hapus Artikel',
      message: 'Yakin ingin menghapus artikel ini?',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        loadMyArticles();
        showToast('success', 'Artikel berhasil dihapus');
      } else {
        showToast('error', 'Gagal menghapus artikel');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('error', 'Terjadi kesalahan');
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
        showToast('success', `Artikel berhasil ${!currentStatus ? 'dipublikasi' : 'dijadikan draft'}`);
      } else {
        showToast('error', 'Gagal mengubah status publikasi');
      }
    } catch (error) {
      console.error('Update error:', error);
      showToast('error', 'Terjadi kesalahan');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-sija-light flex items-center justify-center">
        <div className="text-2xl font-black text-sija-primary animate-pulse uppercase tracking-widest">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-sija-light bg-grid-pattern py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-sija-primary text-white border-2 border-sija-primary px-3 py-1 font-bold text-xs uppercase mb-2 shadow-hard-sm">
              <FileText size={14} />
              Dashboard Penulis
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-sija-text uppercase tracking-tight">Artikel Saya</h1>
            <p className="text-sija-text/80 font-medium mt-1">Kelola karya tulis dan pengetahuan Anda</p>
          </div>
          <Link
            href="/articles/create"
            className="group flex items-center gap-2 bg-sija-primary text-white px-6 py-3 font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider text-sm"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            Buat Artikel Baru
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-sija-surface p-6 border-2 border-sija-primary shadow-hard hover:translate-x-[2px] hover:translate-y-[2px] transition-transform">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-100 border-2 border-blue-500 text-blue-700">
                <FileText size={24} />
              </div>
              <span className="text-5xl font-black text-sija-text">{articles.length}</span>
            </div>
            <div className="text-sija-text font-bold uppercase tracking-wider text-sm">Total Artikel</div>
          </div>

          <div className="bg-sija-surface p-6 border-2 border-sija-primary shadow-hard hover:translate-x-[2px] hover:translate-y-[2px] transition-transform">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-100 border-2 border-green-500 text-green-700">
                <CheckCircle size={24} />
              </div>
              <span className="text-5xl font-black text-sija-text">{articles.filter(a => a.published).length}</span>
            </div>
            <div className="text-sija-text font-bold uppercase tracking-wider text-sm">Published</div>
          </div>

          <div className="bg-sija-surface p-6 border-2 border-sija-primary shadow-hard hover:translate-x-[2px] hover:translate-y-[2px] transition-transform">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-100 border-2 border-gray-500 text-gray-700">
                <Circle size={24} />
              </div>
              <span className="text-5xl font-black text-sija-text">{articles.filter(a => !a.published).length}</span>
            </div>
            <div className="text-sija-text font-bold uppercase tracking-wider text-sm">Draft</div>
          </div>
        </div>
        <div className="bg-sija-surface border-2 border-sija-primary shadow-hard overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-sija-primary">
              <thead className="bg-sija-primary text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider border-r-2 border-sija-primary/20">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider border-r-2 border-sija-primary/20">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider border-r-2 border-sija-primary/20">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider border-r-2 border-sija-primary/20">Views</th>
                  <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider border-r-2 border-sija-primary/20">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y-2 divide-sija-primary/10">
                {articles.map((article) => (
                  <tr key={article._id?.toString()} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 border-r-2 border-sija-primary/10">
                      <Link
                        href={`/articles/${article.slug}`}
                        className="font-bold text-sija-text hover:text-sija-primary hover:underline decoration-2 underline-offset-2 text-lg block mb-1"
                      >
                        {article.title}
                      </Link>
                      <div className="flex items-center gap-2">
                        {article.type === 'public' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-100 border border-green-300 px-1.5 py-0.5 rounded-sm">
                            <Globe size={10} /> Public Article
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100 border border-orange-300 px-1.5 py-0.5 rounded-sm">
                            <Lock size={10} /> Course Only
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-r-2 border-sija-primary/10">
                      <span className="text-xs font-bold uppercase tracking-wider bg-sija-primary text-white px-2 py-1 border-2 border-sija-primary shadow-hard-sm">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-r-2 border-sija-primary/10">
                      <button
                        onClick={() => togglePublish(article._id!.toString(), article.published)}
                        className={`text-xs font-bold px-3 py-1.5 border-2 shadow-hard-sm transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none uppercase tracking-wider flex items-center gap-1 ${article.published
                          ? 'bg-green-100 text-green-800 border-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 border-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        {article.published ? <CheckCircle size={12} /> : <Circle size={12} />}
                        {article.published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-r-2 border-sija-primary/10 font-bold text-sija-text">
                      <div className="flex items-center gap-2">
                        <Eye size={16} className="text-sija-primary" />
                        {article.views || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-r-2 border-sija-primary/10 font-medium text-sija-text/70 text-sm">
                      {formatDate(article.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/articles/${article.slug}/edit`}
                          className="p-2 bg-yellow-400 text-black border-2 border-black hover:bg-yellow-300 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                          title="Edit Artikel"
                        >
                          <Edit size={16} strokeWidth={2.5} />
                        </Link>
                        <button
                          onClick={() => handleDelete(article._id!.toString(), article.slug)}
                          className="p-2 bg-red-500 text-white border-2 border-black hover:bg-red-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                          title="Hapus Artikel"
                        >
                          <Trash2 size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {articles.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 border-2 border-dashed border-gray-400 rounded-full mb-6">
                <FileText size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-sija-text uppercase tracking-tight mb-2">Belum Ada Artikel</h3>
              <p className="text-sija-text/60 mb-8 max-w-md mx-auto">Mulai bagikan pengetahuan Anda dengan membuat artikel pertama Anda sekarang.</p>
              <Link
                href="/articles/create"
                className="inline-flex items-center gap-2 bg-sija-primary text-white px-6 py-3 font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider"
              >
                <Plus size={20} />
                Buat Artikel Pertama
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}