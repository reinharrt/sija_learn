// ============================================
// src/app/courses/page.tsx
// Courses List Page - Display all courses
// ============================================

'use client';

import { useEffect, useState } from 'react';
import CourseCard from '@/components/course/CourseCard';
import { Course } from '@/types';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/courses?published=true&page=${page}`)
      .then(res => res.json())
      .then(data => {
        setCourses(data.courses || []);
        setTotalPages(data.pagination?.totalPages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Course</h1>
        <p className="text-gray-600">
          Ikuti learning path yang terstruktur untuk memperdalam pemahaman Anda
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Belum ada course tersedia
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {courses.map((course) => (
              <CourseCard key={course._id?.toString()} course={course} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-4 py-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
