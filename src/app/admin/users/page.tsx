// src/app/admin/users/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import { UserRole, User } from '@/types';
import { formatDate } from '@/lib/utils';
import Breadcrumb from '@/components/common/Breadcrumb';
import PageHeader from '@/components/common/PageHeader';
import DataTable, { Column } from '@/components/common/DataTable';
import ConfirmModal from '@/components/common/ConfirmModal';
import {
  Users,
  Shield,
  Trash2,
  Mail,
  Calendar,
  UserCheck,
  UserX,
  Edit2
} from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const itemsPerPage = 10;
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    userName: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRole.ADMIN)) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      loadUsers();
    }
  }, [user]);

  const loadUsers = (page: number = 1) => {
    setLoading(true);
    setCurrentPage(page);
    fetch(`/api/users?page=${page}&limit=${itemsPerPage}`, {
      headers: getAuthHeaders(),
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalUsers(data.pagination?.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const openDeleteModal = (userId: string, userName: string) => {
    setDeleteModal({
      isOpen: true,
      userId,
      userName,
    });
  };

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModal({
        isOpen: false,
        userId: null,
        userName: '',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.userId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/users/${deleteModal.userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setTimeout(() => {
          closeDeleteModal();
          loadUsers(currentPage);
          setIsDeleting(false);
        }, 500);
      } else {
        alert('Gagal menghapus user');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Terjadi kesalahan');
      setIsDeleting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        loadUsers(currentPage);
      } else {
        alert('Gagal mengubah role');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Terjadi kesalahan');
    }
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-purple-100 text-purple-800 border-purple-800';
      case UserRole.COURSE_ADMIN:
        return 'bg-blue-100 text-blue-800 border-blue-800';
      case UserRole.WRITER:
        return 'bg-green-100 text-green-800 border-green-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-800';
    }
  };

  if (authLoading || !user || user.role !== UserRole.ADMIN) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sija-primary border-t-transparent"></div>
      </div>
    );
  }

  const columns: Column<User>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (u) => (
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-sm text-sija-primary uppercase">
            {u.name}
          </span>
          {u.isVerified ? (
            <UserCheck size={14} className="text-green-600" strokeWidth={2.5} />
          ) : (
            <UserX size={14} className="text-yellow-600" strokeWidth={2.5} />
          )}
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (u) => (
        <span className="inline-flex items-center gap-1 text-sm text-sija-text/70 font-bold">
          <Mail size={14} strokeWidth={2.5} />
          {u.email}
        </span>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (u) => (
        <div className="flex items-center gap-2">
          <select
            value={u.role}
            onChange={(e) => handleUpdateRole(u._id!.toString(), e.target.value as UserRole)}
            disabled={u._id?.toString() === user.id}
            className={`text-xs px-2 py-1.5 border-2 font-bold uppercase shadow-hard-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed font-display ${getRoleBadgeClass(u.role)}`}
          >
            <option value={UserRole.USER}>User</option>
            <option value={UserRole.WRITER}>Writer</option>
            <option value={UserRole.COURSE_ADMIN}>Course Admin</option>
            <option value={UserRole.ADMIN}>Admin</option>
          </select>
        </div>
      ),
    },
    {
      key: 'isVerified',
      label: 'Status',
      render: (u) => (
        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 border-2 font-bold uppercase ${u.isVerified
            ? 'bg-green-100 text-green-800 border-green-800'
            : 'bg-yellow-100 text-yellow-800 border-yellow-800'
          }`}>
          {u.isVerified ? (
            <>
              <UserCheck size={12} strokeWidth={2.5} />
              Verified
            </>
          ) : (
            <>
              <UserX size={12} strokeWidth={2.5} />
              Unverified
            </>
          )}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (u) => (
        <span className="inline-flex items-center gap-1 text-sm text-sija-text/70 font-bold">
          <Calendar size={14} strokeWidth={2.5} />
          {formatDate(u.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (u) => (
        <button
          onClick={() => openDeleteModal(u._id!.toString(), u.name)}
          disabled={u._id?.toString() === user.id}
          className="inline-flex items-center gap-1 px-3 py-1.5 font-display font-bold text-xs bg-red-500 text-white border-2 border-red-500 shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-red-600 hover:border-red-600 transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
        >
          <Trash2 size={12} strokeWidth={2.5} />
          Delete
        </button>
      ),
    },
  ];

  const renderMobileCard = (u: User, index: number) => (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-black text-sija-primary uppercase">
            {u.name}
          </span>
          {u.isVerified ? (
            <UserCheck size={16} className="text-green-600" strokeWidth={2.5} />
          ) : (
            <UserX size={16} className="text-yellow-600" strokeWidth={2.5} />
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={u.role}
          onChange={(e) => handleUpdateRole(u._id!.toString(), e.target.value as UserRole)}
          disabled={u._id?.toString() === user.id}
          className={`text-xs px-2 py-1 border-2 font-bold uppercase font-display ${getRoleBadgeClass(u.role)} disabled:opacity-50`}
        >
          <option value={UserRole.USER}>User</option>
          <option value={UserRole.WRITER}>Writer</option>
          <option value={UserRole.COURSE_ADMIN}>Course Admin</option>
          <option value={UserRole.ADMIN}>Admin</option>
        </select>

        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 border-2 font-bold uppercase ${u.isVerified
            ? 'bg-green-100 text-green-800 border-green-800'
            : 'bg-yellow-100 text-yellow-800 border-yellow-800'
          }`}>
          {u.isVerified ? (
            <>
              <UserCheck size={12} strokeWidth={2.5} />
              Verified
            </>
          ) : (
            <>
              <UserX size={12} strokeWidth={2.5} />
              Unverified
            </>
          )}
        </span>
      </div>

      <div className="flex flex-col gap-2 text-xs text-sija-text/70 font-bold">
        <span className="flex items-center gap-1">
          <Mail size={12} strokeWidth={2.5} />
          {u.email}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={12} strokeWidth={2.5} />
          Joined: {formatDate(u.createdAt)}
        </span>
      </div>

      <button
        onClick={() => openDeleteModal(u._id!.toString(), u.name)}
        disabled={u._id?.toString() === user.id}
        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 font-display font-bold text-xs bg-red-500 text-white border-2 border-red-500 shadow-hard-sm hover:bg-red-600 transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 size={14} strokeWidth={2.5} />
        Delete User
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin', icon: <Shield size={16} strokeWidth={2.5} /> },
          { label: 'Users' },
        ]}
      />

      <PageHeader
        title="Manage Users"
        subtitle={`${totalUsers} pengguna terdaftar`}
        icon={Users}
        iconBgColor="bg-blue-500 border-blue-500"
      />

      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        emptyMessage="Tidak ada pengguna"
        emptyIcon={<Users className="w-16 h-16 text-sija-text/30 mx-auto" />}
        pagination={{
          currentPage,
          totalPages,
          totalItems: totalUsers,
          onPageChange: loadUsers,
        }}
        mobileCardRender={renderMobileCard}
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Hapus User?"
        message={`Apakah Anda yakin ingin menghapus user "${deleteModal.userName}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}