// ============================================
// src/components/course/CourseDetail.tsx
// Course Detail Component - Full course display
// ============================================

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Course } from '@/types';
import { formatDate } from '@/lib/utils';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface CourseDetailProps {
  course: Course;
  articles?: any[];
}

export default function CourseDetail({ course, articles = [] }: CourseDetailProps) {
  const { user } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if user can edit
  const canEdit = user && (
    course.creator.toString() === user.id || 
    user.role === UserRole.ADMIN
  );

  // Check enrollment status
  useEffect(() => {
    if (user && course._id) {
      checkEnrollment();
    } else {
      setChecking(false);
    }
  }, [user, course._id]);

  const checkEnrollment = async () => {
    try {
      const response = await fetch(`/api/enrollments?courseId=${course._id}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setIsEnrolled(data.enrolled || false);
    } catch (error) {
      console.error('Check enrollment error:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      alert('Silakan login terlebih dahulu untuk mendaftar course');
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ courseId: course._id?.toString() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mendaftar course');
      }

      setIsEnrolled(true);
      alert('✅ Berhasil mendaftar course!');
      window.location.reload(); // Refresh to update enrollment count
    } catch (error: any) {
      alert(error.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async () => {
    if (!confirm('Yakin ingin keluar dari course ini?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/enrollments/${course._id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal keluar dari course');
      }

      setIsEnrolled(false);
      alert('Berhasil keluar dari course');
      window.location.reload();
    } catch (error: any) {
      alert(error.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        {course.thumbnail && (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-4 text-sm text-gray-500">
            <span>📚 {articles.length} artikel</span>
            <span>👥 {course.enrolledCount || 0} siswa terdaftar</span>
            <span>📅 {formatDate(course.createdAt)}</span>
          </div>

          <div className="flex gap-2">
            {canEdit && (
              <Link
                href={`/courses/${course.slug}/edit`}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                ✏️ Edit Course
              </Link>
            )}
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {course.title}
        </h1>

        <p className="text-lg text-gray-600 mb-6">
          {course.description}
        </p>

        {/* Enrollment Button */}
        {user && !canEdit && (
          <div className="mb-6">
            {checking ? (
              <button 
                disabled
                className="bg-gray-300 text-gray-600 px-6 py-3 rounded-lg font-medium cursor-not-allowed"
              >
                Checking...
              </button>
            ) : isEnrolled ? (
              <div className="flex gap-3 items-center">
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                  ✅ Anda sudah terdaftar
                </div>
                <button
                  onClick={handleUnenroll}
                  disabled={loading}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Keluar dari Course'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Loading...' : '📝 Daftar Course'}
              </button>
            )}
          </div>
        )}

        {!user && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              <Link href="/login" className="font-medium underline hover:text-blue-900">
                Login
              </Link>
              {' '}untuk mendaftar course ini dan mengakses materi pembelajaran
            </p>
          </div>
        )}
      </header>

      <section>
        <h2 className="text-2xl font-bold mb-4">Materi Course</h2>
        
        {articles.length === 0 ? (
          <p className="text-gray-500">Belum ada artikel dalam course ini.</p>
        ) : (
          <div className="space-y-3">
            {articles.map((article, index) => (
              <a
                key={article._id?.toString()}
                href={`/articles/${article.slug}`}
                className={`block p-4 border rounded-lg transition-colors ${
                  isEnrolled || canEdit 
                    ? 'hover:bg-gray-50 cursor-pointer' 
                    : 'opacity-75 cursor-not-allowed bg-gray-50'
                }`}
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    alert('Silakan login untuk mengakses artikel');
                  } else if (!isEnrolled && !canEdit) {
                    e.preventDefault();
                    alert('Daftar course terlebih dahulu untuk mengakses materi');
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-500">
                        {index + 1}.
                      </span>
                      <h3 className="font-semibold text-gray-900">
                        {article.title}
                      </h3>
                      {!isEnrolled && !canEdit && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          🔒 Terkunci
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {article.description}
                    </p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-4">
                    {article.category}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}