// src/app/admin/courses/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { UserRole, Course } from '@/types';
import { formatDate } from '@/lib/utils';
import Breadcrumb from '@/components/common/Breadcrumb';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  FileText,
  Calendar,
  CheckCircle,
  Circle,
  Users as UsersIcon,
  Shield
} from 'lucide-react';

export default function AdminCoursesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useNotification();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const itemsPerPage = 10;
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    courseId: string | null;
    courseTitle: string;
  }>({
    isOpen: false,
    courseId: null,
    courseTitle: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);

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

  const loadCourses = (page: number = 1) => {
    setLoading(true);
    setCurrentPage(page);
    fetch(`/api/courses?page=${page}&limit=${itemsPerPage}`)
      .then(res => res.json())
      .then(data => {
        setCourses(data.courses || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalCourses(data.pagination?.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const openDeleteModal = (courseId: string, courseTitle: string) => {
    setDeleteModal({
      isOpen: true,
      courseId,
      courseTitle,
    });
  };

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModal({
        isOpen: false,
        courseId: null,
        courseTitle: '',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.courseId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/courses/${deleteModal.courseId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setTimeout(() => {
          closeDeleteModal();
          loadCourses(currentPage);
          setIsDeleting(false);
        }, 500);
      } else {
        showToast('error', 'Gagal menghapus course');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('error', 'Terjadi kesalahan');
      setIsDeleting(false);
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
        loadCourses(currentPage);
      } else {
        showToast('error', 'Gagal mengubah status publikasi');
      }
    } catch (error) {
      console.error('Update error:', error);
      showToast('error', 'Terjadi kesalahan');
    }
  };

  if (authLoading || !user || user.role !== UserRole.ADMIN) {
    return (
      <div className="min-h-screen bg-sija-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sija-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold text-sija-text uppercase tracking-wider">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sija-light py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: 'Admin', href: '/admin', icon: <Shield size={16} strokeWidth={2.5} /> },
            { label: 'Courses', icon: <BookOpen size={16} strokeWidth={2.5} /> },
          ]}
        />

        <div className="bg-sija-surface border-2 border-sija-primary shadow-hard p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-purple-500 border-2 border-sija-text shadow-hard">
                  <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-black text-sija-text uppercase tracking-tight">
                  Manage Courses
                </h1>
              </div>
              <p className="text-sija-text/70 font-bold">
                {totalCourses} courses tersedia
              </p>
            </div>
            <Link href="/courses/create">
              <button className="group flex items-center gap-2 px-6 py-3 bg-sija-primary text-white font-bold uppercase tracking-wide border-2 border-sija-text shadow-hard hover:shadow-harder hover:-translate-y-1 transition-all">
                <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" strokeWidth={2.5} />
                Buat Course
              </button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="bg-sija-surface border-2 border-sija-text shadow-hard p-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-sija-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-bold text-sija-text uppercase">Loading courses...</p>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-sija-surface border-2 border-sija-text shadow-hard p-12">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-sija-text/30 mx-auto mb-4" strokeWidth={2} />
              <p className="font-bold text-sija-text uppercase">Tidak ada course</p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden md:block bg-sija-surface border-2 border-sija-text shadow-hard overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-sija-primary border-b-2 border-sija-text">
                      <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">
                        Articles
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">
                        Enrolled
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-sija-text">
                    {courses.map((course, index) => (
                      <tr
                        key={course._id?.toString()}
                        className={`transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-sija-light'
                          } hover:bg-yellow-50`}
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/courses/${course.slug}`}
                            className="font-bold text-sija-primary hover:text-purple-600 transition-colors uppercase text-sm"
                          >
                            {course.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-sm text-sija-text/70 font-bold">
                            <FileText size={14} strokeWidth={2.5} />
                            {course.articles?.length || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => togglePublish(course._id!.toString(), course.published)}
                            className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 font-bold border-2 shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase ${course.published
                                ? 'bg-green-100 text-green-800 border-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-800 border-gray-800 hover:bg-gray-200'
                              }`}
                          >
                            {course.published ? (
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
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-sm text-sija-text/70 font-bold">
                            <UsersIcon size={14} strokeWidth={2.5} />
                            {course.enrolledCount || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-sm text-sija-text/70 font-bold">
                            <Calendar size={14} strokeWidth={2.5} />
                            {formatDate(course.createdAt)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/courses/${course.slug}/edit`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 font-bold text-xs bg-blue-500 text-white border-2 border-blue-500 shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-blue-600 hover:border-blue-600 transition-all uppercase"
                            >
                              <Edit size={12} strokeWidth={2.5} />
                              Edit
                            </Link>
                            <button
                              onClick={() => openDeleteModal(course._id!.toString(), course.title)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 font-bold text-xs bg-red-500 text-white border-2 border-red-500 shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-red-600 hover:border-red-600 transition-all uppercase"
                            >
                              <Trash2 size={12} strokeWidth={2.5} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="md:hidden space-y-4">
              {courses.map((course) => (
                <div
                  key={course._id?.toString()}
                  className="bg-sija-surface border-2 border-sija-text shadow-hard p-4 space-y-3"
                >
                  <Link
                    href={`/courses/${course.slug}`}
                    className="font-black text-lg text-sija-primary hover:text-purple-600 transition-colors uppercase leading-tight block"
                  >
                    {course.title}
                  </Link>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => togglePublish(course._id!.toString(), course.published)}
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 font-bold border-2 uppercase ${course.published
                          ? 'bg-green-100 text-green-800 border-green-800'
                          : 'bg-gray-100 text-gray-800 border-gray-800'
                        }`}
                    >
                      {course.published ? (
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
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-sija-text/70 font-bold">
                    <span className="flex items-center gap-1">
                      <FileText size={12} strokeWidth={2.5} />
                      {course.articles?.length || 0} articles
                    </span>
                    <span className="flex items-center gap-1">
                      <UsersIcon size={12} strokeWidth={2.5} />
                      {course.enrolledCount || 0} enrolled
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} strokeWidth={2.5} />
                      {formatDate(course.createdAt)}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link
                      href={`/courses/${course.slug}/edit`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 font-bold text-xs bg-blue-500 text-white border-2 border-blue-500 shadow-hard-sm hover:bg-blue-600 transition-colors uppercase"
                    >
                      <Edit size={14} strokeWidth={2.5} />
                      Edit
                    </Link>
                    <button
                      onClick={() => openDeleteModal(course._id!.toString(), course.title)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 font-bold text-xs bg-red-500 text-white border-2 border-red-500 shadow-hard-sm hover:bg-red-600 transition-colors uppercase"
                    >
                      <Trash2 size={14} strokeWidth={2.5} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between bg-sija-surface border-2 border-sija-text shadow-hard p-4">
                <div className="text-sm text-sija-text/70 font-bold">
                  Halaman {currentPage} dari {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadCourses(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 font-bold text-sm bg-white border-2 border-sija-text shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => loadCourses(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 font-bold text-sm bg-white border-2 border-sija-text shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {deleteModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-sija-surface border-4 border-sija-text shadow-harder max-w-md w-full p-6">
              <h3 className="text-2xl font-black text-sija-text uppercase mb-4">
                Hapus Course?
              </h3>
              <p className="text-sija-text/70 font-bold mb-6">
                Apakah Anda yakin ingin menghapus course "{deleteModal.courseTitle}"? Artikel yang terkait dengan course ini tidak akan terhapus, tetapi akan kehilangan hubungan dengan course.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 font-bold text-sm bg-white border-2 border-sija-text shadow-hard hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 font-bold text-sm bg-red-500 text-white border-2 border-red-500 shadow-hard hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-red-600 transition-all uppercase disabled:opacity-50"
                >
                  {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}