// ============================================
// src/app/articles/page.tsx
// Articles List Page - Neobrutalist Design
// ============================================

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ArticleCard from '@/components/article/ArticleCard';
import PageHeader from '@/components/common/PageHeader';
import TagFilter, { FilterItem } from '@/components/common/TagFilter';
import { Article, ArticleCategory } from '@/types';
import {
  FileText,
  BookOpen,
  Code,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Search as SearchIcon,
} from 'lucide-react';

const CATEGORY_FILTERS: FilterItem[] = [
  { value: null, label: 'All Articles', icon: FileText },
  { value: 'pelajaran', label: 'Pelajaran', icon: BookOpen },
  { value: 'tech', label: 'Tech', icon: Code },
  { value: 'tutorial', label: 'Tutorial', icon: Lightbulb },
];

function ArticlesContent() {
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const search = searchParams.get('search');

  // Sync initial category dari URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category') as ArticleCategory | null;
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('published', 'true');
    params.append('type', 'public');
    params.append('page', page.toString());
    if (selectedCategory) params.append('category', selectedCategory);
    if (search) params.append('search', search);

    fetch(`/api/articles?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles || []);
        setTotalPages(data.pagination?.totalPages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCategory, search, page]);

  const handleCategoryChange = (value: string | null) => {
    setSelectedCategory(value);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <PageHeader
        title="Articles"
        subtitle="Jelajahi artikel yang bisa diakses publik"
        icon={FileText}
      />

      {/* Category Filter */}
      <TagFilter
        title="Filter by Category"
        items={CATEGORY_FILTERS}
        selectedValue={selectedCategory}
        onChange={handleCategoryChange}
      />

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-sija-primary border-t-transparent"></div>
          <p className="text-sija-text font-bold uppercase tracking-wider mt-4">
            Loading Articles...
          </p>
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
              : selectedCategory
                ? `Tidak ada artikel dalam kategori "${selectedCategory}"`
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-6 py-3 bg-sija-primary text-white font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-hard disabled:hover:translate-x-0 disabled:hover:translate-y-0 flex items-center gap-2 uppercase tracking-wider"
              >
                <ChevronLeft className="w-5 h-5" />
                Prev
              </button>

              <div className="bg-sija-surface border-2 border-sija-primary px-6 py-3 shadow-hard-sm">
                <span className="font-bold text-sija-text uppercase tracking-wider">
                  Page{' '}
                  <span className="text-sija-primary font-black">{page}</span> of{' '}
                  <span className="text-sija-primary font-black">
                    {totalPages}
                  </span>
                </span>
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

export default function ArticlesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-sija-primary border-t-transparent"></div>
          <p className="text-sija-text font-bold uppercase tracking-wider mt-4">
            Loading Articles...
          </p>
        </div>
      }
    >
      <ArticlesContent />
    </Suspense>
  );
}