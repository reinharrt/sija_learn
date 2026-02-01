// ============================================
// src/app/courses/[slug]/page.tsx
// Course Detail Page - WITH PROPER ENROLLMENT STATE
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CourseDetail from '@/components/course/CourseDetail';
import { Course } from '@/types';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);

  useEffect(() => {
    loadCourse();
  }, [slug]);

  useEffect(() => {
    if (user && course?._id) {
      checkEnrollment();
    } else if (!user) {
      setIsEnrolled(false);
      setCheckingEnrollment(false);
    }
  }, [user, course?._id]);

  const loadCourse = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${slug}`);
      const data = await res.json();

      if (res.ok) {
        setCourse(data);
      } else {
        console.error('Course not found');
      }
    } catch (error) {
      console.error('Load course error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    if (!course?._id || !user) return;

    setCheckingEnrollment(true);
    try {
      const res = await fetch('/api/enrollments', {
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('📋 Enrollment check - All enrollments:', data.enrollments);
        console.log('📋 Current course ID:', course._id);

        // Compare courseId (now string from API) with current course ID
        const enrolled = data.enrollments?.some((e: any) => {
          const enrollmentCourseId = e.courseId; // Already a string from API
          const currentCourseId = course._id?.toString();

          console.log('🔍 Comparing:', enrollmentCourseId, '===', currentCourseId);

          return enrollmentCourseId === currentCourseId;
        });

        console.log('✅ Enrollment status:', enrolled);
        setIsEnrolled(enrolled);
      }
    } catch (error) {
      console.error('Check enrollment error:', error);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold mb-4">Course tidak ditemukan</h1>
        <button
          onClick={() => router.push('/courses')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Kembali ke Course
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CourseDetail
        course={course}
        initialIsEnrolled={isEnrolled}
      />
    </div>
  );
}