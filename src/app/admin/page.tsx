'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArticles: 0,
    totalCourses: 0,
    totalComments: 0,
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRole.ADMIN)) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    Promise.all([
      fetch('/api/users', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(r => r.json()),
      fetch('/api/articles').then(r => r.json()),
      fetch('/api/courses').then(r => r.json()),
    ])
      .then(([users, articles, courses]) => {
        setStats({
          totalUsers: users.pagination?.total || 0,
          totalArticles: articles.pagination?.total || 0,
          totalCourses: courses.pagination?.total || 0,
          totalComments: 0,
        });
      })
      .catch(console.error);
  }, []);

  if (authLoading || !user || user.role !== UserRole.ADMIN) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-medium">Total Users</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-medium">Total Articles</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats.totalArticles}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-medium">Total Courses</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCourses}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-medium">Total Comments</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats.totalComments}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          href="/admin/users"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Manage Users</h2>
          <p className="text-gray-600 text-sm">Kelola pengguna dan role</p>
        </Link>

        <Link 
          href="/admin/articles"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Manage Articles</h2>
          <p className="text-gray-600 text-sm">Kelola semua artikel</p>
        </Link>

        <Link 
          href="/admin/courses"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Manage Courses</h2>
          <p className="text-gray-600 text-sm">Kelola semua course</p>
        </Link>
      </div>
    </div>
  );
}
