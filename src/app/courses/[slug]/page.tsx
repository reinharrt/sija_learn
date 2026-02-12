

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CourseDetail from '@/components/course/CourseDetail';
import { Course } from '@/types';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import Breadcrumb from '@/components/common/Breadcrumb';
import { BookOpen, ArrowLeft, Loader2 } from 'lucide-react';

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
        console.log('[ENROLL] Enrollment check - All enrollments:', data.enrollments);
        console.log('[ENROLL] Current course ID:', course._id);

        const enrolled = data.enrollments?.some((e: any) => {
          const enrollmentCourseId = e.courseId;
          const currentCourseId = course._id?.toString();

          console.log('[ENROLL] Comparing:', enrollmentCourseId, '===', currentCourseId);

          return enrollmentCourseId === currentCourseId;
        });

        console.log('[ENROLL] Enrollment status:', enrolled);
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
        <Loader2 className="w-12 h-12 animate-spin text-sija-primary mx-auto mb-4" />
        <p className="text-sija-text/60 font-bold uppercase tracking-wider">Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-sija-surface border-2 border-sija-border shadow-hard p-12 text-center">
          <BookOpen className="w-16 h-16 text-sija-text/30 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-sija-text uppercase mb-4">Course Tidak Ditemukan</h1>
          <button
            onClick={() => router.push('/courses')}
            className="inline-flex items-center gap-2 text-sija-primary font-bold hover:underline uppercase tracking-wider text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: 'Courses', href: '/courses', icon: <BookOpen size={16} strokeWidth={2.5} /> },
          { label: course.title },
        ]}
      />

      <CourseDetail
        course={course}
        initialIsEnrolled={isEnrolled}
      />
    </div>
  );
}