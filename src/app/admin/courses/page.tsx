// src/app/admin/courses/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import { UserRole, Course } from '@/types';
import { formatDate } from '@/lib/utils';
import Breadcrumb from '@/components/common/Breadcrumb';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { Column } from '@/components/common/DataTable';
import Button from '@/components/common/Button';
import ConfirmModal from '@/components/common/ConfirmModal';
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
        alert('Gagal menghapus course');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Terjadi kesalahan');
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
        alert('Gagal mengubah status publikasi');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Terjadi kesalahan');
    }
  };

  if (authLoading || !user || user.role !== UserRole.ADMIN) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sija-primary border-t-transparent"></div>
      </div>
    );
  }

  const columns: Column<Course>[] = [
    {
      key: 'title',
      label: 'Title',
      render: (course) => (
        <Link
          href={`/courses/${course.slug}`}
          className="font-display font-bold text-sm text-sija-primary hover:text-purple-600 transition-colors uppercase"
        >
          {course.title}
        </Link>
      ),
    },
    {
      key: 'articles',
      label: 'Articles',
      render: (course) => (
        <span className="inline-flex items-center gap-1 text-sm text-sija-text/70 font-bold">
          <FileText size={14} strokeWidth={2.5} />
          {course.articles?.length || 0}
        </span>
      ),
    },
    {
      key: 'published',
      label: 'Status',
      render: (course) => (
        <button
          onClick={() => togglePublish(course._id!.toString(), course.published)}
          className={`inline-flex items-center gap-1 text-xs px-2 py-1 font-bold border-2 shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase ${course.published
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
      ),
    },
    {
      key: 'enrolledCount',
      label: 'Enrolled',
      render: (course) => (
        <span className="inline-flex items-center gap-1 text-sm text-sija-text/70 font-bold">
          <UsersIcon size={14} strokeWidth={2.5} />
          {course.enrolledCount || 0}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (course) => (
        <span className="inline-flex items-center gap-1 text-sm text-sija-text/70 font-bold">
          <Calendar size={14} strokeWidth={2.5} />
          {formatDate(course.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (course) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/courses/${course.slug}/edit`}
            className="inline-flex items-center gap-1 px-3 py-1.5 font-display font-bold text-xs bg-blue-500 text-white border-2 border-blue-500 shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-blue-600 hover:border-blue-600 transition-all uppercase"
          >
            <Edit size={12} strokeWidth={2.5} />
            Edit
          </Link>
          <button
            onClick={() => openDeleteModal(course._id!.toString(), course.title)}
            className="inline-flex items-center gap-1 px-3 py-1.5 font-display font-bold text-xs bg-red-500 text-white border-2 border-red-500 shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-red-600 hover:border-red-600 transition-all uppercase"
          >
            <Trash2 size={12} strokeWidth={2.5} />
            Delete
          </button>
        </div>
      ),
    },
  ];

  const renderMobileCard = (course: Course, index: number) => (
    <div className="p-4 space-y-3">
      <Link
        href={`/courses/${course.slug}`}
        className="font-display text-lg font-black text-sija-primary hover:text-purple-600 transition-colors uppercase leading-tight block"
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
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 font-display font-bold text-xs bg-blue-500 text-white border-2 border-blue-500 shadow-hard-sm hover:bg-blue-600 transition-colors uppercase"
        >
          <Edit size={14} strokeWidth={2.5} />
          Edit
        </Link>
        <button
          onClick={() => openDeleteModal(course._id!.toString(), course.title)}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 font-display font-bold text-xs bg-red-500 text-white border-2 border-red-500 shadow-hard-sm hover:bg-red-600 transition-colors uppercase"
        >
          <Trash2 size={14} strokeWidth={2.5} />
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin', icon: <Shield size={16} strokeWidth={2.5} /> },
          { label: 'Courses' },
        ]}
      />

      <PageHeader
        title="Manage Courses"
        subtitle={`${totalCourses} courses tersedia`}
        icon={BookOpen}
        iconBgColor="bg-purple-500 border-purple-500"
        actions={
          <Link href="/courses/create">
            <Button variant="primary" size="md" icon={<Plus size={20} strokeWidth={2.5} />}>
              Buat Course
            </Button>
          </Link>
        }
      />

      <DataTable
        data={courses}
        columns={columns}
        loading={loading}
        emptyMessage="Tidak ada course"
        emptyIcon={<BookOpen className="w-16 h-16 text-sija-text/30 mx-auto" />}
        pagination={{
          currentPage,
          totalPages,
          totalItems: totalCourses,
          onPageChange: loadCourses,
        }}
        mobileCardRender={renderMobileCard}
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Hapus Course?"
        message={`Apakah Anda yakin ingin menghapus course "${deleteModal.courseTitle}"? Artikel yang terkait dengan course ini tidak akan terhapus, tetapi akan kehilangan hubungan dengan course.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}