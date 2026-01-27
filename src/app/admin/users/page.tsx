// ============================================
// src/app/admin/users/page.tsx
// Admin Users - Manage users
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import { UserRole, User } from '@/types';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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

  const loadUsers = () => {
    setLoading(true);
    fetch('/api/users', { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => setUsers(data.users || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        loadUsers();
      } else {
        alert('Gagal menghapus user');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Terjadi kesalahan');
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
        loadUsers();
      } else {
        alert('Gagal mengubah role');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Terjadi kesalahan');
    }
  };

  if (authLoading || loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  if (!user || user.role !== UserRole.ADMIN) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold mb-8">Manage Users</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((u) => (
              <tr key={u._id?.toString()}>
                <td className="px-6 py-4 whitespace-nowrap">{u.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={u.role}
                    onChange={(e) => handleUpdateRole(u._id!.toString(), e.target.value as UserRole)}
                    className="text-sm border rounded px-2 py-1"
                    disabled={u._id?.toString() === user.id}
                  >
                    <option value={UserRole.USER}>User</option>
                    <option value={UserRole.WRITER}>Writer</option>
                    <option value={UserRole.COURSE_ADMIN}>Course Admin</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${u.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {u.isVerified ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(u._id!.toString())}
                    disabled={u._id?.toString() === user.id}
                    className="text-red-600 hover:text-red-900 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada users
          </div>
        )}
      </div>
    </div>
  );
}
