'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ArticleCard from '@/components/article/ArticleCard';
import { Article, ArticleCategory } from '@/types';

export default function ArticlesPage() {
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const category = searchParams.get('category') as ArticleCategory | null;
  const search = searchParams.get('search');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('published', 'true');
    params.append('type', 'public'); // 🆕 Only show PUBLIC articles in articles page
    params.append('page', page.toString());
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    fetch(`/api/articles?${params}`)
      .then(res => res.json())
      .then(data => {
        setArticles(data.articles || []);
        setTotalPages(data.pagination?.totalPages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, search, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Artikel</h1>
        <p className="text-gray-600">Jelajahi artikel yang bisa diakses publik</p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <a
            href="/articles"
            className={`px-4 py-2 rounded ${!category ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            Semua
          </a>
          <a
            href="/articles?category=pelajaran"
            className={`px-4 py-2 rounded ${category === 'pelajaran' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            Pelajaran
          </a>
          <a
            href="/articles?category=tech"
            className={`px-4 py-2 rounded ${category === 'tech' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            Tech
          </a>
          <a
            href="/articles?category=tutorial"
            className={`px-4 py-2 rounded ${category === 'tutorial' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            Tutorial
          </a>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-gray-500">Tidak ada artikel ditemukan</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {articles.map((article) => (
              <ArticleCard key={article._id?.toString()} article={article} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
              >
                ← Prev
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}