'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import { Course } from '@/types';
import { formatDate } from '@/lib/utils';

interface EnrollmentWithCourse {
  _id: string;
  courseId: string;
  enrolledAt: Date;
  course?: Course;
  progress: {
    completedArticles: string[];
    lastAccessedAt: Date;
  };
}

export default function MyCoursesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadMyEnrollments();
    }
  }, [user]);

  const loadMyEnrollments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/enrollments', {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      
      // Load course details for each enrollment
      const enrollmentsWithCourses = await Promise.all(
        (data.enrollments || []).map(async (enrollment: any) => {
          try {
            const courseResponse = await fetch(`/api/courses/${enrollment.courseId}`);
            const courseData = await courseResponse.json();
            return {
              ...enrollment,
              course: courseData
            };
          } catch (error) {
            console.error('Error loading course:', error);
            return enrollment;
          }
        })
      );

      setEnrollments(enrollmentsWithCourses);
    } catch (error) {
      console.error('Load enrollments error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (courseId: string, courseTitle: string) => {
    if (!confirm(`Yakin ingin keluar dari course "${courseTitle}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/enrollments/${courseId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        alert('Berhasil keluar dari course');
        loadMyEnrollments();
      } else {
        alert('Gagal keluar dari course');
      }
    } catch (error) {
      console.error('Unenroll error:', error);
      alert('Terjadi kesalahan');
    }
  };

  const calculateProgress = (enrollment: EnrollmentWithCourse) => {
    if (!enrollment.course?.articles?.length) return 0;
    const total = enrollment.course.articles.length;
    const completed = enrollment.progress.completedArticles.length;
    return Math.round((completed / total) * 100);
  };

  if (authLoading || loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Course Saya</h1>
        <p className="text-gray-600 mt-2">Kelola course yang Anda ikuti</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-medium">Total Course</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{enrollments.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-medium">Sedang Belajar</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {enrollments.filter(e => calculateProgress(e) > 0 && calculateProgress(e) < 100).length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-medium">Selesai</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {enrollments.filter(e => calculateProgress(e) === 100).length}
          </div>
        </div>
      </div>

      {/* Courses List */}
      {enrollments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">📚</div>
          <p className="text-gray-500 mb-4">Anda belum mendaftar course apapun</p>
          <Link
            href="/courses"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Jelajahi Course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => {
            const course = enrollment.course;
            if (!course) return null;

            const progress = calculateProgress(enrollment);

            return (
              <div key={enrollment._id} className="bg-white rounded-lg shadow overflow-hidden">
                {course.thumbnail && (
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                
                <div className="p-4">
                  <Link
                    href={`/courses/${course.slug}`}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 block mb-2"
                  >
                    {course.title}
                  </Link>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Progress</span>
                      <span className="text-xs font-medium text-gray-900">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          progress === 100 ? 'bg-green-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                    <span>📚 {course.articles?.length || 0} artikel</span>
                    <span>📅 {formatDate(enrollment.enrolledAt)}</span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/courses/${course.slug}`}
                      className="flex-1 bg-blue-600 text-white text-center px-3 py-2 rounded text-sm hover:bg-blue-700"
                    >
                      Lanjutkan
                    </Link>
                    <button
                      onClick={() => handleUnenroll(course._id!.toString(), course.title)}
                      className="bg-red-100 text-red-600 px-3 py-2 rounded text-sm hover:bg-red-200"
                    >
                      Keluar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}