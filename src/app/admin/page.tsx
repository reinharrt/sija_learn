// ============================================
// src/app/admin/page.tsx
// Admin Dashboard - Main admin interface with Analytics
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import Breadcrumb from '@/components/common/Breadcrumb';
import PageHeader from '@/components/common/PageHeader';
import { 
  Users, 
  FileText, 
  BookOpen, 
  Eye, 
  BarChart3,
  Shield,
  Tags,
  RefreshCw
} from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';
import NavigationCard from '@/components/admin/NavigationCard';
import QuickActions from '@/components/admin/QuickActions';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArticles: 0,
    totalCourses: 0,
    totalViews: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRole.ADMIN)) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    setRefreshing(true);
    try {
      const [usersRes, articlesRes, coursesRes] = await Promise.all([
        fetch('/api/users', { 
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
        }).then(r => r.json()),
        fetch('/api/articles').then(r => r.json()),
        fetch('/api/courses').then(r => r.json()),
      ]);

      // Calculate total views from all articles
      const totalViews = articlesRes.articles?.reduce(
        (sum: number, article: any) => sum + (article.views || 0), 
        0
      ) || 0;

      setStats({
        totalUsers: usersRes.pagination?.total || 0,
        totalArticles: articlesRes.pagination?.total || 0,
        totalCourses: coursesRes.pagination?.total || 0,
        totalViews,
      });
    } catch (error) {
      console.error('Load stats error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (authLoading || !user || user.role !== UserRole.ADMIN) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sija-primary border-t-transparent"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' as const },
    { label: 'Total Articles', value: stats.totalArticles, icon: FileText, color: 'green' as const },
    { label: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: 'purple' as const },
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'orange' as const },
  ];

  const navigationCards = [
    {
      href: '/admin/users',
      icon: Users,
      title: 'Manage Users',
      description: 'Kelola pengguna dan role',
      color: 'blue' as const,
    },
    {
      href: '/admin/articles',
      icon: FileText,
      title: 'Manage Articles',
      description: 'Kelola semua artikel',
      color: 'green' as const,
    },
    {
      href: '/admin/courses',
      icon: BookOpen,
      title: 'Manage Courses',
      description: 'Kelola semua course',
      color: 'purple' as const,
    },
    {
      href: '/admin/tags',
      icon: Tags,
      title: 'Manage Tags',
      description: 'Kelola tags artikel & course',
      color: 'pink' as const,
    },
    {
      href: '/admin/analytics',
      icon: BarChart3,
      title: 'Analytics',
      description: 'View detailed statistics',
      color: 'orange' as const,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Admin Dashboard', icon: <Shield size={16} strokeWidth={2.5} /> },
        ]}
      />

      {/* Page Header */}
      <PageHeader
        title="Admin Dashboard"
        subtitle="Control panel untuk manajemen platform"
        icon={Shield}
        iconBgColor="bg-sija-primary border-sija-primary"
        actions={
          <button
            onClick={loadStats}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 font-display font-bold text-xs bg-sija-surface text-sija-primary border-2 border-sija-primary shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw 
              size={16} 
              strokeWidth={2.5} 
              className={refreshing ? 'animate-spin' : ''} 
            />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {navigationCards.map((card) => (
          <NavigationCard key={card.href} {...card} />
        ))}
      </div>

      {/* Quick Actions */}
      <QuickActions onRefresh={loadStats} refreshing={refreshing} />
    </div>
  );
}