// ============================================
// src/app/admin/analytics/page.tsx
// Admin Analytics Dashboard - Article Statistics with Charts
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import { UserRole, Article } from '@/types';
import { formatDate } from '@/lib/utils';
import Breadcrumb from '@/components/common/Breadcrumb';
import PageHeader from '@/components/common/PageHeader';
import Button from '@/components/common/Button';
import StatsCard from '@/components/admin/StatsCard';
import { 
  BarChart3,
  Shield,
  FileText,
  Eye,
  MessageCircle,
  TrendingUp,
  Calendar,
  Tag,
  CheckCircle,
  Circle,
  RefreshCw
} from 'lucide-react';

interface ArticleStats {
  article: Article;
  totalComments: number;
  uniqueViewers?: number;
  avgReadTime?: number;
  engagementRate?: number;
}

interface OverallStats {
  totalArticles: number;
  totalViews: number;
  totalComments: number;
  avgViewsPerArticle: number;
  avgCommentsPerArticle: number;
  publishedArticles: number;
  draftArticles: number;
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [articleStats, setArticleStats] = useState<ArticleStats[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'views' | 'comments' | 'recent' | 'engagement'>('views');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRole.ADMIN)) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      // Load all articles
      const articlesRes = await fetch('/api/articles?limit=1000', {
        headers: getAuthHeaders(),
      });
      const articlesData = await articlesRes.json();
      const articles = articlesData.articles || [];

      // Load comments count for each article
      const statsPromises = articles.map(async (article: Article) => {
        try {
          const commentsRes = await fetch(`/api/comments?articleId=${article._id}`);
          const commentsData = await commentsRes.json();
          const totalComments = commentsData.comments?.length || 0;

          // Calculate engagement rate (comments per 100 views)
          const engagementRate = article.views > 0 
            ? (totalComments / article.views) * 100 
            : 0;

          return {
            article,
            totalComments,
            engagementRate: Math.round(engagementRate * 10) / 10,
          };
        } catch {
          return {
            article,
            totalComments: 0,
            engagementRate: 0,
          };
        }
      });

      const stats = await Promise.all(statsPromises);
      setArticleStats(stats);

      // Calculate overall stats
      const totalViews = stats.reduce((sum, s) => sum + (s.article.views || 0), 0);
      const totalComments = stats.reduce((sum, s) => sum + s.totalComments, 0);
      const published = stats.filter(s => s.article.published).length;

      setOverallStats({
        totalArticles: stats.length,
        totalViews,
        totalComments,
        avgViewsPerArticle: stats.length > 0 ? Math.round(totalViews / stats.length) : 0,
        avgCommentsPerArticle: stats.length > 0 ? Math.round(totalComments / stats.length) : 0,
        publishedArticles: published,
        draftArticles: stats.length - published,
      });

    } catch (error) {
      console.error('Load analytics error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredStats = articleStats.filter(stat => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'published') return stat.article.published;
    if (filterCategory === 'draft') return !stat.article.published;
    return stat.article.category === filterCategory;
  });

  const sortedStats = [...filteredStats].sort((a, b) => {
    switch (sortBy) {
      case 'views':
        return (b.article.views || 0) - (a.article.views || 0);
      case 'comments':
        return b.totalComments - a.totalComments;
      case 'engagement':
        return (b.engagementRate || 0) - (a.engagementRate || 0);
      case 'recent':
        return new Date(b.article.createdAt).getTime() - new Date(a.article.createdAt).getTime();
      default:
        return 0;
    }
  });

  const topArticles = sortedStats.slice(0, 5);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sija-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user || user.role !== UserRole.ADMIN) {
    return null;
  }

  const engagementRate = overallStats?.totalViews 
    ? ((overallStats.totalComments / overallStats.totalViews) * 100).toFixed(1)
    : '0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin', icon: <Shield size={16} strokeWidth={2.5} /> },
          { label: 'Analytics' },
        ]}
      />

      {/* Page Header */}
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Comprehensive article performance insights"
        icon={BarChart3}
        iconBgColor="bg-orange-500 border-orange-500"
        actions={
          <Button
            variant="secondary"
            size="md"
            icon={<RefreshCw size={16} strokeWidth={2.5} className={refreshing ? 'animate-spin' : ''} />}
            onClick={loadAnalytics}
            loading={refreshing}
          >
            Refresh
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          label="Total Articles"
          value={overallStats?.totalArticles || 0}
          icon={FileText}
          color="blue"
        />
        <StatsCard
          label="Total Views"
          value={overallStats?.totalViews.toLocaleString() || 0}
          icon={Eye}
          color="green"
        />
        <StatsCard
          label="Total Comments"
          value={overallStats?.totalComments.toLocaleString() || 0}
          icon={MessageCircle}
          color="purple"
        />
        <StatsCard
          label="Engagement Rate"
          value={`${engagementRate}%`}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Top 5 Articles by Views */}
      <div className="bg-sija-surface border-2 border-sija-primary shadow-hard p-6 mb-8">
        <h2 className="font-display text-2xl font-black text-sija-primary uppercase mb-6 flex items-center gap-2">
          <TrendingUp size={24} strokeWidth={2.5} />
          Top 5 Articles by Views
        </h2>
        <div className="space-y-4">
          {topArticles.map((stat, index) => {
            const maxViews = topArticles[0]?.article.views || 1;
            const percentage = ((stat.article.views || 0) / maxViews) * 100;
            
            return (
              <div key={stat.article._id?.toString()} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Link
                    href={`/articles/${stat.article.slug}`}
                    className="font-bold text-sm text-sija-text hover:text-sija-primary transition-colors flex-1 truncate uppercase"
                  >
                    {index + 1}. {stat.article.title}
                  </Link>
                  <span className="font-black text-green-600 ml-4 whitespace-nowrap flex items-center gap-1">
                    <Eye size={16} strokeWidth={2.5} />
                    {stat.article.views?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="w-full bg-sija-text/20 border-2 border-sija-primary/30 h-4 overflow-hidden">
                  <div
                    className="bg-green-500 border-r-2 border-green-700 h-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Articles by Comments */}
      <div className="bg-sija-surface border-2 border-sija-primary shadow-hard p-6 mb-8">
        <h2 className="font-display text-2xl font-black text-sija-primary uppercase mb-6 flex items-center gap-2">
          <MessageCircle size={24} strokeWidth={2.5} />
          Top 5 Articles by Comments
        </h2>
        <div className="space-y-4">
          {[...sortedStats].sort((a, b) => b.totalComments - a.totalComments).slice(0, 5).map((stat, index) => {
            const maxComments = Math.max(...sortedStats.map(s => s.totalComments));
            const percentage = maxComments > 0 ? (stat.totalComments / maxComments) * 100 : 0;
            
            return (
              <div key={stat.article._id?.toString()} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Link
                    href={`/articles/${stat.article.slug}`}
                    className="font-bold text-sm text-sija-text hover:text-sija-primary transition-colors flex-1 truncate uppercase"
                  >
                    {index + 1}. {stat.article.title}
                  </Link>
                  <span className="font-black text-purple-600 ml-4 whitespace-nowrap flex items-center gap-1">
                    <MessageCircle size={16} strokeWidth={2.5} />
                    {stat.totalComments}
                  </span>
                </div>
                <div className="w-full bg-sija-text/20 border-2 border-sija-primary/30 h-4 overflow-hidden">
                  <div
                    className="bg-purple-500 border-r-2 border-purple-700 h-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="bg-sija-surface border-2 border-sija-primary shadow-hard p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-sija-text mb-2 uppercase">
              Filter by Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-sija-background text-sija-text border-2 border-sija-border px-4 py-2 font-bold text-sm uppercase shadow-hard-sm focus:outline-none focus:border-sija-primary transition-all duration-300"
            >
              <option value="all">All Categories</option>
              <option value="published">Published Only</option>
              <option value="draft">Draft Only</option>
              <option value="pelajaran">Pelajaran</option>
              <option value="tech">Tech</option>
              <option value="tutorial">Tutorial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-sija-text mb-2 uppercase">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-sija-background text-sija-text border-2 border-sija-border px-4 py-2 font-bold text-sm uppercase shadow-hard-sm focus:outline-none focus:border-sija-primary transition-all duration-300"
            >
              <option value="views">Most Views</option>
              <option value="comments">Most Comments</option>
              <option value="engagement">Highest Engagement</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-sija-surface border-2 border-sija-primary shadow-hard overflow-hidden">
        <div className="px-6 py-4 border-b-2 border-sija-primary bg-sija-primary/5">
          <h2 className="font-display text-xl font-black text-sija-primary uppercase flex items-center gap-2">
            <FileText size={20} strokeWidth={2.5} />
            All Articles ({sortedStats.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-sija-primary bg-sija-primary/5">
                <th className="px-6 py-4 text-left font-display text-xs font-black text-sija-primary uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-4 text-left font-display text-xs font-black text-sija-primary uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left font-display text-xs font-black text-sija-primary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left font-display text-xs font-black text-sija-primary uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-4 text-left font-display text-xs font-black text-sija-primary uppercase tracking-wider">
                  Comments
                </th>
                <th className="px-6 py-4 text-left font-display text-xs font-black text-sija-primary uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-4 text-left font-display text-xs font-black text-sija-primary uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStats.map((stat, index) => (
                <tr 
                  key={stat.article._id?.toString()} 
                  className={`${index !== sortedStats.length - 1 ? 'border-b-2 border-sija-primary/20' : ''} hover:bg-sija-primary/5 transition-colors`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {stat.article.banner && (
                        <img
                          src={stat.article.banner}
                          alt={stat.article.title}
                          className="h-12 w-16 object-cover border-2 border-sija-primary"
                        />
                      )}
                      <div className="max-w-md">
                        <Link
                          href={`/articles/${stat.article.slug}`}
                          className="text-sm font-bold text-sija-primary hover:text-green-600 transition-colors block truncate uppercase"
                        >
                          {stat.article.title}
                        </Link>
                        <p className="text-xs text-sija-text/60 font-bold truncate">{stat.article.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 border-2 border-blue-800 font-bold uppercase">
                      <Tag size={12} strokeWidth={2.5} />
                      {stat.article.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 border-2 font-bold uppercase ${
                      stat.article.published 
                        ? 'bg-green-100 text-green-800 border-green-800' 
                        : 'bg-gray-100 text-gray-800 border-gray-800'
                    }`}>
                      {stat.article.published ? (
                        <>
                          <CheckCircle size={12} strokeWidth={2.5} />
                          Published
                        </>
                      ) : (
                        <>
                          <Circle size={12} strokeWidth={2.5} />
                          Draft
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-sm font-black text-sija-text">
                      <Eye size={14} strokeWidth={2.5} />
                      {stat.article.views?.toLocaleString() || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-sm font-black text-sija-text">
                      <MessageCircle size={14} strokeWidth={2.5} />
                      {stat.totalComments}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-black ${
                      (stat.engagementRate || 0) > 5 ? 'text-green-600' :
                      (stat.engagementRate || 0) > 2 ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {stat.engagementRate?.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-sm text-sija-text/70 font-bold">
                      <Calendar size={14} strokeWidth={2.5} />
                      {formatDate(stat.article.createdAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sortedStats.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-sija-text/30 mx-auto mb-4" />
              <p className="text-sija-text font-bold text-lg">No articles found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}