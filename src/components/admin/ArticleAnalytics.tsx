// ============================================
// src/components/admin/ArticleAnalytics.tsx
// Article Analytics Component - Display view stats with Dark Mode
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { Article } from '@/types';

interface ArticleWithStats extends Article {
  viewsToday?: number;
  viewsThisWeek?: number;
  viewsThisMonth?: number;
}

export default function ArticleAnalytics() {
  const [articles, setArticles] = useState<ArticleWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'views' | 'recent' | 'title'>('views');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/articles?includeStats=true');
      const data = await res.json();

      if (data.articles) {
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('Load analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedArticles = [...articles].sort((a, b) => {
    switch (sortBy) {
      case 'views':
        return (b.views || 0) - (a.views || 0);
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sija-primary mx-auto"></div>
        <p className="mt-2 text-sija-text/60 dark:text-sija-text/50 transition-colors duration-300">Loading analytics...</p>
      </div>
    );
  }

  const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
  const avgViews = articles.length > 0 ? Math.round(totalViews / articles.length) : 0;
  const mostViewedArticle = articles.reduce((max, article) =>
    (article.views || 0) > (max.views || 0) ? article : max
    , articles[0]);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-sija-surface border-2 border-sija-border p-6 shadow-hard-sm transition-colors duration-300">
          <div className="text-sm text-sija-text/60 dark:text-sija-text/50 mb-1 font-bold uppercase tracking-wider transition-colors duration-300">Total Views</div>
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400 transition-colors duration-300">
            {totalViews.toLocaleString()}
          </div>
        </div>

        <div className="bg-sija-surface border-2 border-sija-border p-6 shadow-hard-sm transition-colors duration-300">
          <div className="text-sm text-sija-text/60 dark:text-sija-text/50 mb-1 font-bold uppercase tracking-wider transition-colors duration-300">Total Articles</div>
          <div className="text-3xl font-black text-green-600 dark:text-green-400 transition-colors duration-300">
            {articles.length}
          </div>
        </div>

        <div className="bg-sija-surface border-2 border-sija-border p-6 shadow-hard-sm transition-colors duration-300">
          <div className="text-sm text-sija-text/60 dark:text-sija-text/50 mb-1 font-bold uppercase tracking-wider transition-colors duration-300">Avg Views</div>
          <div className="text-3xl font-black text-purple-600 dark:text-purple-400 transition-colors duration-300">
            {avgViews}
          </div>
        </div>

        <div className="bg-sija-surface border-2 border-sija-border p-6 shadow-hard-sm transition-colors duration-300">
          <div className="text-sm text-sija-text/60 dark:text-sija-text/50 mb-1 font-bold uppercase tracking-wider transition-colors duration-300">Most Viewed</div>
          <div className="text-lg font-bold text-orange-600 dark:text-orange-400 truncate transition-colors duration-300">
            {mostViewedArticle?.title || '-'}
          </div>
          <div className="text-sm text-sija-text/60 dark:text-sija-text/50 transition-colors duration-300">
            {(mostViewedArticle?.views || 0).toLocaleString()} views
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="bg-sija-surface border-2 border-sija-border p-4 shadow-hard-sm transition-colors duration-300">
        <label className="text-sm text-sija-text font-bold mr-3 uppercase tracking-wider transition-colors duration-300">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 bg-sija-background border-2 border-sija-border font-bold text-sija-text focus:outline-none focus:ring-2 focus:ring-sija-primary transition-colors duration-300"
        >
          <option value="views">Most Views</option>
          <option value="recent">Most Recent</option>
          <option value="title">Title (A-Z)</option>
        </select>
      </div>

      {/* Articles List */}
      <div className="bg-sija-surface border-2 border-sija-border shadow-hard overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y-2 divide-sija-border">
            <thead className="bg-sija-light dark:bg-sija-dark/30 transition-colors duration-300">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-sija-text uppercase tracking-wider transition-colors duration-300">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-sija-text uppercase tracking-wider transition-colors duration-300">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-sija-text uppercase tracking-wider transition-colors duration-300">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-sija-text uppercase tracking-wider transition-colors duration-300">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-sija-text uppercase tracking-wider transition-colors duration-300">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-sija-surface divide-y-2 divide-sija-border/30 transition-colors duration-300">
              {sortedArticles.map((article) => (
                <tr key={article._id?.toString()} className="hover:bg-sija-light dark:hover:bg-sija-dark/20 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {article.banner && (
                        <img
                          src={article.banner}
                          alt={article.title}
                          className="h-10 w-16 object-cover border-2 border-sija-border mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-bold text-sija-text transition-colors duration-300">
                          {article.title}
                        </div>
                        <div className="text-xs text-sija-text/50 dark:text-sija-text/40 font-mono transition-colors duration-300">
                          {article.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-600 transition-colors duration-300">
                      {article.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-black text-sija-text transition-colors duration-300">
                      👁️ {(article.views || 0).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 transition-colors duration-300 ${article.published
                        ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-600'
                        : 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-600'
                      }`}>
                      {article.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-sija-text/60 dark:text-sija-text/50 font-medium transition-colors duration-300">
                    {new Date(article.createdAt).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Trends (Placeholder for future implementation) */}
      <div className="bg-sija-surface border-2 border-sija-border p-6 shadow-hard transition-colors duration-300">
        <h3 className="text-lg font-bold text-sija-text mb-4 uppercase tracking-wider transition-colors duration-300">View Trends</h3>
        <div className="text-sija-text/60 dark:text-sija-text/50 text-center py-8 transition-colors duration-300">
          📊 Chart visualization coming soon...
          <br />
          <span className="text-sm">Track daily/weekly/monthly trends</span>
        </div>
      </div>
    </div>
  );
}