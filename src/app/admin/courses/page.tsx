// ============================================
// src/app/admin/courses/page.tsx
// Admin Courses - Manage courses
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import { UserRole, Course } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AdminCoursesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRole.ADMIN)) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      loadCourses();
    }
  }, [user]);

  const loadCourses = () => {
    setLoading(true);
    fetch('/api/courses?limit=100')
      .then(res => res.json())
      .then(data => setCourses(data.courses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Yakin ingin menghapus course ini?')) return;

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        loadCourses();
      } else {
        alert('Gagal menghapus course');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Terjadi kesalahan');
    }
  };

  const togglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ published: !currentStatus }),
      });

      if (response.ok) {
        loadCourses();
      } else {
        alert('Gagal mengubah status publikasi');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Terjadi kesalahan');
    }
  };

  if (authLoading || loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  if (!user || user.role !== UserRole.ADMIN) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold mb-8">Manage Courses</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Articles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses.map((course) => (
              <tr key={course._id?.toString()}>
                <td className="px-6 py-4">
                  <Link 
                    href={`/courses/${course.slug}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {course.title}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {course.articles?.length || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => togglePublish(course._id!.toString(), course.published)}
                    className={`text-xs px-2 py-1 rounded ${course.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                  >
                    {course.published ? 'Published' : 'Draft'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {course.enrolledCount || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(course.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <Link
                    href={`/courses/${course.slug}/edit`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(course._id!.toString())}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {courses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada course
          </div>
        )}
      </div>
    </div>
  );
}