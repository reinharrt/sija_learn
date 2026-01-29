// ============================================
// src/components/admin/ArticleAnalytics.tsx
// Article Analytics Component - Display view stats
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading analytics...</p>
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
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Total Views</div>
          <div className="text-3xl font-bold text-blue-600">
            {totalViews.toLocaleString()}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Total Articles</div>
          <div className="text-3xl font-bold text-green-600">
            {articles.length}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Avg Views</div>
          <div className="text-3xl font-bold text-purple-600">
            {avgViews}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Most Viewed</div>
          <div className="text-lg font-bold text-orange-600 truncate">
            {mostViewedArticle?.title || '-'}
          </div>
          <div className="text-sm text-gray-500">
            {(mostViewedArticle?.views || 0).toLocaleString()} views
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="text-sm text-gray-600 mr-3">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="border rounded px-3 py-1"
        >
          <option value="views">Most Views</option>
          <option value="recent">Most Recent</option>
          <option value="title">Title (A-Z)</option>
        </select>
      </div>

      {/* Articles List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Article
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Views
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedArticles.map((article) => (
              <tr key={article._id?.toString()} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {article.banner && (
                      <img
                        src={article.banner}
                        alt={article.title}
                        className="h-10 w-16 object-cover rounded mr-3"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {article.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {article.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                    {article.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    👁️ {(article.views || 0).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${
                    article.published 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {article.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(article.createdAt).toLocaleDateString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Trends (Placeholder for future implementation) */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">View Trends</h3>
        <div className="text-gray-500 text-center py-8">
          📊 Chart visualization coming soon...
          <br />
          <span className="text-sm">Track daily/weekly/monthly trends</span>
        </div>
      </div>
    </div>
  );
}