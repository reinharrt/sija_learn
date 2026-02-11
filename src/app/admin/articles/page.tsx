// src/app/admin/articles/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import { UserRole, Article } from '@/types';
import { formatDate } from '@/lib/utils';
import ConfirmModal from '@/components/common/ConfirmModal';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { Column } from '@/components/common/DataTable';
import Button from '@/components/common/Button';
import Breadcrumb from '@/components/common/Breadcrumb';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Tag,
  Calendar,
  CheckCircle,
  Circle,
  Shield
} from 'lucide-react';

export default function AdminArticlesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const itemsPerPage = 10;
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    articleId: string | null;
    articleTitle: string;
  }>({
    isOpen: false,
    articleId: null,
    articleTitle: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRole.ADMIN)) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      loadArticles();
    }
  }, [user]);

  const loadArticles = (page: number = 1) => {
    setLoading(true);
    setCurrentPage(page);
    fetch(`/api/articles?page=${page}&limit=${itemsPerPage}`)
      .then(res => res.json())
      .then(data => {
        setArticles(data.articles || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalArticles(data.pagination?.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const openDeleteModal = (articleId: string, articleTitle: string) => {
    setDeleteModal({
      isOpen: true,
      articleId,
      articleTitle,
    });
  };

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModal({
        isOpen: false,
        articleId: null,
        articleTitle: '',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.articleId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/articles/${deleteModal.articleId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setTimeout(() => {
          closeDeleteModal();
          loadArticles(currentPage);
          setIsDeleting(false);
        }, 500);
      } else {
        alert('Gagal menghapus artikel');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Terjadi kesalahan');
      setIsDeleting(false);
    }
  };

  const togglePublish = async (articleId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ published: !currentStatus }),
      });

      if (response.ok) {
        loadArticles(currentPage);
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

  const columns: Column<Article>[] = [
    {
      key: 'thumbnail',
      label: 'Thumbnail',
      width: 'w-32',
      render: (article) => (
        article.banner ? (
          <img
            src={article.banner}
            alt={article.title}
            className="h-16 w-24 object-cover border-2 border-sija-primary shadow-hard-sm"
          />
        ) : (
          <div className="h-16 w-24 bg-sija-text/10 border-2 border-sija-primary flex items-center justify-center">
            <FileText size={24} className="text-sija-text/30" strokeWidth={2.5} />
          </div>
        )
      ),
    },
    {
      key: 'title',
      label: 'Title',
      render: (article) => (
        <div>
          <Link
            href={`/articles/${article.slug}`}
            className="font-display font-bold text-sm text-sija-primary hover:text-green-600 transition-colors uppercase block"
          >
            {article.title}
          </Link>
          {article.description && (
            <p className="text-xs text-sija-text/60 font-bold mt-1 line-clamp-2">{article.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (article) => (
        <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 border-2 border-blue-800 font-bold uppercase">
          <Tag size={12} strokeWidth={2.5} />
          {article.category}
        </span>
      ),
    },
    {
      key: 'published',
      label: 'Status',
      render: (article) => (
        <button
          onClick={() => togglePublish(article._id!.toString(), article.published)}
          className={`inline-flex items-center gap-1 text-xs px-2 py-1 font-bold border-2 shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase ${article.published
              ? 'bg-green-100 text-green-800 border-green-800 hover:bg-green-200'
              : 'bg-gray-100 text-gray-800 border-gray-800 hover:bg-gray-200'
            }`}
        >
          {article.published ? (
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
      key: 'views',
      label: 'Views',
      render: (article) => (
        <span className="inline-flex items-center gap-1 text-sm text-sija-text/70 font-bold">
          <Eye size={14} strokeWidth={2.5} />
          {article.views || 0}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (article) => (
        <span className="inline-flex items-center gap-1 text-sm text-sija-text/70 font-bold">
          <Calendar size={14} strokeWidth={2.5} />
          {formatDate(article.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (article) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/articles/${article.slug}/edit`}
            className="inline-flex items-center gap-1 px-3 py-1.5 font-display font-bold text-xs bg-blue-500 text-white border-2 border-blue-500 shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-blue-600 hover:border-blue-600 transition-all uppercase"
          >
            <Edit size={12} strokeWidth={2.5} />
            Edit
          </Link>
          <button
            onClick={() => openDeleteModal(article._id!.toString(), article.title)}
            className="inline-flex items-center gap-1 px-3 py-1.5 font-display font-bold text-xs bg-red-500 text-white border-2 border-red-500 shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-red-600 hover:border-red-600 transition-all uppercase"
          >
            <Trash2 size={12} strokeWidth={2.5} />
            Delete
          </button>
        </div>
      ),
    },
  ];

  const renderMobileCard = (article: Article, index: number) => (
    <div className="p-4 space-y-3">
      <Link
        href={`/articles/${article.slug}`}
        className="font-display text-lg font-black text-sija-primary hover:text-green-600 transition-colors uppercase leading-tight block"
      >
        {article.title}
      </Link>

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 border-2 border-blue-800 font-bold uppercase">
          <Tag size={12} strokeWidth={2.5} />
          {article.category}
        </span>
        <button
          onClick={() => togglePublish(article._id!.toString(), article.published)}
          className={`inline-flex items-center gap-1 text-xs px-2 py-1 font-bold border-2 uppercase ${article.published
              ? 'bg-green-100 text-green-800 border-green-800'
              : 'bg-gray-100 text-gray-800 border-gray-800'
            }`}
        >
          {article.published ? (
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
          <Eye size={12} strokeWidth={2.5} />
          {article.views || 0}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={12} strokeWidth={2.5} />
          {formatDate(article.createdAt)}
        </span>
      </div>

      <div className="flex gap-2 pt-2">
        <Link
          href={`/articles/${article.slug}/edit`}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 font-display font-bold text-xs bg-blue-500 text-white border-2 border-blue-500 shadow-hard-sm hover:bg-blue-600 transition-colors uppercase"
        >
          <Edit size={14} strokeWidth={2.5} />
          Edit
        </Link>
        <button
          onClick={() => openDeleteModal(article._id!.toString(), article.title)}
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
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin', icon: <Shield size={16} strokeWidth={2.5} /> },
          { label: 'Articles' },
        ]}
      />

      {/* Page Header */}
      <PageHeader
        title="Manage Articles"
        subtitle={`${totalArticles} artikel tersedia`}
        icon={FileText}
        iconBgColor="bg-green-500 border-green-500"
        actions={
          <Link href="/articles/create">
            <Button variant="success" size="md" icon={<Plus size={20} strokeWidth={2.5} />}>
              Buat Artikel
            </Button>
          </Link>
        }
      />

      {/* Data Table */}
      <DataTable
        data={articles}
        columns={columns}
        loading={loading}
        emptyMessage="Tidak ada artikel"
        emptyIcon={<FileText className="w-16 h-16 text-sija-text/30 mx-auto" />}
        pagination={{
          currentPage,
          totalPages,
          totalItems: totalArticles,
          onPageChange: loadArticles,
        }}
        mobileCardRender={renderMobileCard}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Hapus Artikel?"
        message={`Apakah Anda yakin ingin menghapus artikel "${deleteModal.articleTitle}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}