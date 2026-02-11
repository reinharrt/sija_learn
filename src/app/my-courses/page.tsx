

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import { Course } from '@/types';
import { formatDate } from '@/lib/utils';
import ConfirmModal from '@/components/common/ConfirmModal';
import {
  BookOpen,
  Calendar,
  TrendingUp,
  Trophy,
  ExternalLink,
  LogOut,
  Search,
  GraduationCap,
  Clock,
  CheckCircle2,
  PlayCircle,
  Library
} from 'lucide-react';

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
  const [unenrollModal, setUnenrollModal] = useState<{
    isOpen: boolean;
    courseId: string | null;
    courseTitle: string;
  }>({
    isOpen: false,
    courseId: null,
    courseTitle: '',
  });
  const [isUnenrolling, setIsUnenrolling] = useState(false);

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

  const openUnenrollModal = (courseId: string, courseTitle: string) => {
    setUnenrollModal({
      isOpen: true,
      courseId,
      courseTitle,
    });
  };

  const closeUnenrollModal = () => {
    if (!isUnenrolling) {
      setUnenrollModal({
        isOpen: false,
        courseId: null,
        courseTitle: '',
      });
    }
  };

  const handleUnenroll = async () => {
    if (!unenrollModal.courseId) return;

    setIsUnenrolling(true);
    try {
      const response = await fetch(`/api/enrollments/${unenrollModal.courseId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setTimeout(() => {
          closeUnenrollModal();
          loadMyEnrollments();
          setIsUnenrolling(false);
        }, 500);
      } else {
        alert('Gagal keluar dari course');
        setIsUnenrolling(false);
      }
    } catch (error) {
      console.error('Unenroll error:', error);
      alert('Terjadi kesalahan');
      setIsUnenrolling(false);
    }
  };

  const calculateProgress = (enrollment: EnrollmentWithCourse) => {
    if (!enrollment) return 0;
    if (!enrollment.course) return 0;
    if (!enrollment.course.articles) return 0;
    if (!Array.isArray(enrollment.course.articles)) return 0;
    if (enrollment.course.articles.length === 0) return 0;

    const total = enrollment.course.articles.length;
    if (!enrollment.progress) return 0;
    if (!enrollment.progress.completedArticles) return 0;
    if (!Array.isArray(enrollment.progress.completedArticles)) return 0;

    const completed = enrollment.progress.completedArticles.length;
    return Math.round((completed / total) * 100);
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sija-primary border-t-transparent"></div>
        <p className="mt-4 font-bold text-sija-text uppercase tracking-wider">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const inProgressCount = enrollments.filter(e => {
    const progress = calculateProgress(e);
    return progress > 0 && progress < 100;
  }).length;

  const completedCount = enrollments.filter(e => calculateProgress(e) === 100).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 bg-sija-surface border-4 border-sija-primary shadow-hard p-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-sija-primary border-2 border-sija-primary flex items-center justify-center shadow-hard-sm">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-black text-sija-primary uppercase">
              My Courses
            </h1>
            <p className="text-sija-text/70 font-bold mt-1">
              Kelola dan lanjutkan pembelajaran Anda
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-sija-light border-4 border-sija-primary shadow-hard p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-sija-primary border-2 border-sija-primary flex items-center justify-center shadow-hard-sm">
              <Library className="w-6 h-6 text-white" />
            </div>
            <div className="text-4xl font-black text-sija-primary">{enrollments.length}</div>
          </div>
          <div className="text-sm font-bold text-sija-text/70 uppercase tracking-wider">
            Total Courses
          </div>
        </div>
        <div className="bg-blue-100 border-4 border-blue-500 shadow-hard p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 border-2 border-blue-700 flex items-center justify-center shadow-hard-sm">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-4xl font-black text-blue-700">{inProgressCount}</div>
          </div>
          <div className="text-sm font-bold text-blue-700 uppercase tracking-wider">
            In Progress
          </div>
        </div>
        <div className="bg-green-100 border-4 border-green-500 shadow-hard p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 border-2 border-green-700 flex items-center justify-center shadow-hard-sm">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="text-4xl font-black text-green-700">{completedCount}</div>
          </div>
          <div className="text-sm font-bold text-green-700 uppercase tracking-wider">
            Completed
          </div>
        </div>
      </div>
      {enrollments.length === 0 ? (
        <div className="bg-sija-surface border-4 border-sija-primary shadow-hard p-12 text-center">
          <div className="w-24 h-24 bg-sija-light border-4 border-sija-primary mx-auto mb-6 flex items-center justify-center shadow-hard-sm">
            <BookOpen className="w-12 h-12 text-sija-primary" />
          </div>
          <p className="text-sija-text font-bold text-xl mb-6 uppercase tracking-wide">
            Belum Ada Course
          </p>
          <p className="text-sija-text/60 font-medium mb-8 max-w-md mx-auto">
            Anda belum mendaftar course apapun. Mulai perjalanan belajar Anda sekarang!
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-8 py-4 bg-sija-primary text-white font-bold border-4 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all uppercase tracking-wider"
          >
            <Search className="w-5 h-5" />
            Explore Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => {
            const course = enrollment.course;
            if (!course) return null;

            const progress = calculateProgress(enrollment);
            const isCompleted = progress === 100;
            const isInProgress = progress > 0 && progress < 100;

            return (
              <div
                key={enrollment._id}
                className={`bg-sija-surface border-4 shadow-hard overflow-hidden transition-all hover:shadow-hard-lg ${isCompleted
                    ? 'border-green-500'
                    : isInProgress
                      ? 'border-blue-500'
                      : 'border-sija-primary'
                  }`}
              >
                {/* Thumbnail */}
                {course.thumbnail && (
                  <div className="relative w-full h-48 border-b-4 border-current bg-sija-light overflow-hidden">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                    {/* Status Badge */}
                    {isCompleted && (
                      <div className="absolute top-3 right-3 bg-green-500 border-2 border-green-700 px-3 py-1 shadow-hard-sm">
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-white" />
                          <span className="text-xs font-black text-white uppercase">Completed</span>
                        </div>
                      </div>
                    )}
                    {isInProgress && (
                      <div className="absolute top-3 right-3 bg-blue-500 border-2 border-blue-700 px-3 py-1 shadow-hard-sm">
                        <div className="flex items-center gap-1">
                          <PlayCircle className="w-4 h-4 text-white" />
                          <span className="text-xs font-black text-white uppercase">In Progress</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6">
                  <Link
                    href={`/courses/${course.slug}`}
                    className="font-display text-xl font-bold text-sija-primary hover:text-sija-dark block mb-2 transition-colors line-clamp-2"
                  >
                    {course.title}
                  </Link>

                  <p className="text-sija-text/70 text-sm font-medium mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Progress Bar - Neobrutalist */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-sija-text/60 uppercase tracking-wider">
                        Progress
                      </span>
                      <span className="text-lg font-black text-sija-primary">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-sija-light border-2 border-sija-primary h-4 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex justify-between items-center text-xs font-bold text-sija-text/60 uppercase tracking-wider mb-4">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {course.articles?.length || 0} Modules
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(enrollment.enrolledAt)}
                    </span>
                  </div>

                  {/* Action Buttons - Neobrutalist */}
                  <div className="flex gap-2">
                    <Link
                      href={`/courses/${course.slug}`}
                      className="flex-1 bg-sija-primary text-white text-center px-4 py-3 text-sm font-bold border-2 border-sija-primary shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Review
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-4 h-4" />
                          Continue
                        </>
                      )}
                    </Link>
                    <button
                      onClick={() => openUnenrollModal(course._id!.toString(), course.title)}
                      className="bg-red-100 text-red-600 px-4 py-3 text-sm font-bold border-2 border-red-500 shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center"
                      title="Leave Course"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Unenroll Confirmation Modal */}
      <ConfirmModal
        isOpen={unenrollModal.isOpen}
        onClose={closeUnenrollModal}
        onConfirm={handleUnenroll}
        title="Keluar dari Course?"
        message={`Apakah Anda yakin ingin keluar dari course "${unenrollModal.courseTitle}"? Progress Anda akan hilang dan tidak dapat dikembalikan.`}
        confirmText="Ya, Keluar"
        cancelText="Batal"
        type="danger"
        isLoading={isUnenrolling}
      />
    </div>
  );
}