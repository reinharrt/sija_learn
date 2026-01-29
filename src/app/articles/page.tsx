'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ArticleCard from '@/components/article/ArticleCard';
import { Article, ArticleCategory } from '@/types';
import { 
  FileText, 
  BookOpen, 
  Code, 
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Search as SearchIcon
} from 'lucide-react';

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
    params.append('type', 'public'); // Only show PUBLIC articles in articles page
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

  const categories = [
    { value: null, label: 'All Articles', icon: FileText },
    { value: 'pelajaran', label: 'Pelajaran', icon: BookOpen },
    { value: 'tech', label: 'Tech', icon: Code },
    { value: 'tutorial', label: 'Tutorial', icon: Lightbulb },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header - Neobrutalist */}
      <div className="mb-8 bg-sija-surface border-2 border-sija-primary p-8 shadow-hard">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-sija-primary border-2 border-sija-primary flex items-center justify-center">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-black text-sija-primary uppercase">
              Articles
            </h1>
            <p className="text-sija-text/70 font-bold mt-1">
              Jelajahi artikel yang bisa diakses publik
            </p>
          </div>
        </div>
        
        {/* Category Filter - Neobrutalist */}
        <div className="flex flex-wrap gap-3 mt-6">
          {categories.map((cat) => {
            const isActive = category === cat.value;
            const Icon = cat.icon;
            
            return (
              <a
                key={cat.value || 'all'}
                href={cat.value ? `/articles?category=${cat.value}` : '/articles'}
                className={`px-6 py-3 text-sm font-bold border-2 shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider flex items-center gap-2 ${
                  isActive
                    ? 'bg-sija-primary text-white border-sija-primary'
                    : 'bg-sija-light text-sija-text border-sija-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </a>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-sija-primary border-t-transparent"></div>
          <p className="text-sija-text font-bold uppercase tracking-wider mt-4">Loading Articles...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-sija-surface border-2 border-sija-primary p-12 text-center shadow-hard">
          <div className="w-24 h-24 bg-sija-light border-2 border-sija-primary mx-auto mb-6 flex items-center justify-center">
            <SearchIcon className="w-12 h-12 text-sija-primary" />
          </div>
          <p className="text-sija-text font-bold text-xl mb-4 uppercase tracking-wide">
            No Articles Found
          </p>
          <p className="text-sija-text/60 font-medium">
            {search 
              ? `Tidak ada artikel yang cocok dengan pencarian "${search}"`
              : category
              ? `Tidak ada artikel dalam kategori "${category}"`
              : 'Belum ada artikel tersedia'}
          </p>
        </div>
      ) : (
        <>
          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {articles.map((article) => (
              <ArticleCard key={article._id?.toString()} article={article} />
            ))}
          </div>

          {/* Pagination - Neobrutalist */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-6 py-3 bg-sija-primary text-white font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-hard disabled:hover:translate-x-0 disabled:hover:translate-y-0 flex items-center gap-2 uppercase tracking-wider"
              >
                <ChevronLeft className="w-5 h-5" />
                Prev
              </button>
              
              <div className="bg-sija-surface border-2 border-sija-primary px-6 py-3 shadow-hard-sm">
                <span className="font-bold text-sija-text uppercase tracking-wider">
                  Page <span className="text-sija-primary font-black">{page}</span> of <span className="text-sija-primary font-black">{totalPages}</span>
                </span>
              </div>
              
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-6 py-3 bg-sija-primary text-white font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-hard disabled:hover:translate-x-0 disabled:hover:translate-y-0 flex items-center gap-2 uppercase tracking-wider"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}