// ============================================
// src/components/course/ArticleSelector.tsx
// Article Selector Modal - Advanced article selection with search & filter
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { Article } from '@/types';
import { 
  X, 
  Search, 
  Globe, 
  Lock, 
  CheckCircle, 
  Circle,
  Filter,
  Tag,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';

interface ArticleSelectorProps {
  selectedArticles: string[];
  onSelectionChange: (articleIds: string[]) => void;
  onClose: () => void;
}

export default function ArticleSelector({ 
  selectedArticles, 
  onSelectionChange, 
  onClose 
}: ArticleSelectorProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'public' | 'course-only'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [tempSelected, setTempSelected] = useState<string[]>(selectedArticles);
  const itemsPerPage = 10;

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchQuery, typeFilter, categoryFilter]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/articles?published=true&limit=500');
      const data = await res.json();
      const loadedArticles = data.articles || [];
      setArticles(loadedArticles);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(loadedArticles.map((a: Article) => a.category))].filter(Boolean);
      setCategories(uniqueCategories as string[]);
    } catch (error) {
      console.error('Load articles error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = [...articles];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(a => a.type === typeFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(a => a.category === categoryFilter);
    }

    setFilteredArticles(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const toggleArticle = (articleId: string) => {
    setTempSelected(prev =>
      prev.includes(articleId)
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const selectAll = () => {
    const currentPageArticles = getPaginatedArticles();
    const currentPageIds = currentPageArticles.map(a => a._id?.toString() || '');
    setTempSelected(prev => [...new Set([...prev, ...currentPageIds])]);
  };

  const deselectAll = () => {
    const currentPageArticles = getPaginatedArticles();
    const currentPageIds = currentPageArticles.map(a => a._id?.toString() || '');
    setTempSelected(prev => prev.filter(id => !currentPageIds.includes(id)));
  };

  const handleConfirm = () => {
    onSelectionChange(tempSelected);
    onClose();
  };

  const getPaginatedArticles = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredArticles.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const paginatedArticles = getPaginatedArticles();

  const publicCount = articles.filter(a => a.type === 'public').length;
  const courseOnlyCount = articles.filter(a => a.type === 'course-only').length;
  const selectedCount = tempSelected.length;
  const selectedPublicCount = tempSelected.filter(id => 
    articles.find(a => a._id?.toString() === id && a.type === 'public')
  ).length;
  const selectedCourseOnlyCount = tempSelected.filter(id => 
    articles.find(a => a._id?.toString() === id && a.type === 'course-only')
  ).length;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-sija-surface dark:bg-gray-900 border-2 border-sija-primary dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b-2 border-sija-primary dark:border-white bg-sija-light dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-black text-sija-primary dark:text-yellow-400 uppercase">
                Pilih Artikel
              </h2>
              <p className="text-sm text-sija-text/70 dark:text-gray-400 font-medium mt-1">
                Cari dan pilih artikel untuk ditambahkan ke course
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-sija-primary/10 dark:hover:bg-yellow-400/10 transition-colors border-2 border-transparent hover:border-sija-primary dark:hover:border-yellow-400"
            >
              <X className="w-6 h-6 text-sija-text dark:text-white" strokeWidth={2.5} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-500 p-3">
              <p className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">Dipilih</p>
              <p className="text-xl font-black text-blue-900 dark:text-blue-300">{selectedCount}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 border-2 border-green-500 p-3">
              <p className="text-xs font-bold text-green-900 dark:text-green-300 uppercase tracking-wider flex items-center gap-1">
                <Globe className="w-3 h-3" /> Public
              </p>
              <p className="text-xl font-black text-green-900 dark:text-green-300">{selectedPublicCount}</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/20 border-2 border-purple-500 p-3">
              <p className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3" /> Course
              </p>
              <p className="text-xl font-black text-purple-900 dark:text-purple-300">{selectedCourseOnlyCount}</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 border-2 border-gray-500 p-3">
              <p className="text-xs font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider">Total</p>
              <p className="text-xl font-black text-gray-900 dark:text-gray-300">{articles.length}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b-2 border-sija-primary dark:border-white bg-sija-surface dark:bg-gray-900">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sija-text/50 dark:text-gray-500" strokeWidth={2.5} />
              <input
                type="text"
                placeholder="Cari artikel berdasarkan judul, deskripsi, atau tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-sija-primary dark:border-white bg-sija-surface dark:bg-gray-800 text-sija-text dark:text-white focus:outline-none focus:ring-2 focus:ring-sija-primary dark:focus:ring-yellow-400 font-medium placeholder:text-sija-text/40 dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Type & Category Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-xs font-bold text-sija-text dark:text-white mb-2 uppercase tracking-wider">
                Tipe Artikel
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setTypeFilter('all')}
                  className={`px-4 py-2 font-bold text-xs border-2 shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider ${
                    typeFilter === 'all'
                      ? 'bg-sija-primary text-white border-sija-primary'
                      : 'bg-sija-surface dark:bg-gray-800 text-sija-text dark:text-white border-sija-text/30 dark:border-gray-600'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('public')}
                  className={`px-4 py-2 font-bold text-xs border-2 shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider flex items-center gap-1 ${
                    typeFilter === 'public'
                      ? 'bg-green-500 text-white border-green-700'
                      : 'bg-sija-surface dark:bg-gray-800 text-sija-text dark:text-white border-sija-text/30 dark:border-gray-600'
                  }`}
                >
                  <Globe className="w-3 h-3" /> Public ({publicCount})
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('course-only')}
                  className={`px-4 py-2 font-bold text-xs border-2 shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider flex items-center gap-1 ${
                    typeFilter === 'course-only'
                      ? 'bg-purple-500 text-white border-purple-700'
                      : 'bg-sija-surface dark:bg-gray-800 text-sija-text dark:text-white border-sija-text/30 dark:border-gray-600'
                  }`}
                >
                  <Lock className="w-3 h-3" /> Course ({courseOnlyCount})
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold text-sija-text dark:text-white mb-2 uppercase tracking-wider">
                Kategori
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-sija-primary dark:border-white bg-sija-surface dark:bg-gray-800 text-sija-text dark:text-white focus:outline-none focus:ring-2 focus:ring-sija-primary dark:focus:ring-yellow-400 font-bold text-sm"
              >
                <option value="all">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Info */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-sija-text/70 dark:text-gray-400 font-medium">
              Menampilkan {filteredArticles.length} artikel
              {searchQuery && ` untuk "${searchQuery}"`}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="px-3 py-1 bg-green-500 text-white font-bold text-xs border-2 border-green-700 shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase"
              >
                ✓ Pilih Halaman
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="px-3 py-1 bg-red-500 text-white font-bold text-xs border-2 border-red-700 shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase"
              >
                ✗ Hapus Halaman
              </button>
            </div>
          </div>
        </div>

        {/* Articles List */}
        <div className="flex-1 overflow-y-auto p-6 bg-sija-light dark:bg-gray-950">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-sija-primary dark:text-yellow-400 mx-auto mb-4" />
              <p className="font-bold text-sija-text dark:text-white uppercase tracking-wider">Loading articles...</p>
            </div>
          ) : paginatedArticles.length === 0 ? (
            <div className="bg-yellow-100 dark:bg-yellow-900/20 border-2 border-yellow-500 p-12 text-center">
              <Search className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
              <p className="font-bold text-yellow-900 dark:text-yellow-300 text-lg uppercase tracking-wider mb-2">
                Tidak ada artikel ditemukan
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-400 font-medium">
                Coba ubah filter atau kata kunci pencarian
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedArticles.map((article) => {
                const isSelected = tempSelected.includes(article._id?.toString() || '');
                
                return (
                  <div
                    key={article._id?.toString()}
                    onClick={() => toggleArticle(article._id?.toString() || '')}
                    className={`flex items-start gap-4 p-4 border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 shadow-hard-sm' 
                        : 'bg-sija-surface dark:bg-gray-900 border-sija-text/20 dark:border-gray-700 hover:border-sija-primary dark:hover:border-yellow-400 hover:shadow-hard-sm'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="flex-shrink-0 pt-1">
                      {isSelected ? (
                        <CheckCircle className="w-6 h-6 text-blue-600" strokeWidth={2.5} />
                      ) : (
                        <Circle className="w-6 h-6 text-sija-text/30 dark:text-gray-600" strokeWidth={2.5} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-bold text-sija-text dark:text-white text-base leading-tight">
                          {article.title}
                        </h3>
                        
                        {/* Type Badge */}
                        <span className={`flex-shrink-0 text-xs px-2 py-1 font-bold border-2 uppercase tracking-wider flex items-center gap-1 ${
                          article.type === 'public' 
                            ? 'bg-green-100 text-green-900 border-green-500' 
                            : 'bg-purple-100 text-purple-900 border-purple-500'
                        }`}>
                          {article.type === 'public' ? (
                            <><Globe className="w-3 h-3" /> Public</>
                          ) : (
                            <><Lock className="w-3 h-3" /> Course</>
                          )}
                        </span>
                      </div>
                      
                      <p className="text-sm text-sija-text/70 dark:text-gray-400 mb-3 font-medium line-clamp-2">
                        {article.description}
                      </p>
                      
                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-sija-text/60 dark:text-gray-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Filter className="w-3 h-3" />
                          {article.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.views || 0} views
                        </span>
                      </div>
                      
                      {/* Tags */}
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-2">
                          {article.tags.slice(0, 4).map((tag, i) => (
                            <span key={i} className="text-xs bg-sija-light dark:bg-gray-800 text-sija-text dark:text-gray-300 px-2 py-0.5 border border-sija-text/20 dark:border-gray-700 font-medium">
                              #{tag}
                            </span>
                          ))}
                          {article.tags.length > 4 && (
                            <span className="text-xs text-sija-text/50 dark:text-gray-500">
                              +{article.tags.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t-2 border-dashed border-sija-text/10 dark:border-gray-800">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-sija-surface dark:bg-gray-800 text-sija-text dark:text-white font-bold border-2 border-sija-primary dark:border-white shadow-hard disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase text-sm flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
                Prev
              </button>
              <div className="px-4 py-2 bg-sija-primary text-white font-bold border-2 border-sija-primary text-sm">
                {currentPage} / {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-sija-surface dark:bg-gray-800 text-sija-text dark:text-white font-bold border-2 border-sija-primary dark:border-white shadow-hard disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase text-sm flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t-2 border-sija-primary dark:border-white bg-sija-light dark:bg-gray-800">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleConfirm}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-sija-primary text-white font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all uppercase tracking-wider"
            >
              <CheckCircle className="w-5 h-5" strokeWidth={2.5} />
              Konfirmasi ({selectedCount} artikel)
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border-2 border-sija-primary dark:border-white bg-sija-surface dark:bg-gray-900 text-sija-text dark:text-white font-bold shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" strokeWidth={2.5} />
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}