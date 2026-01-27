// ============================================
// src/components/comment/CommentItem.tsx
// Comment Item Component - Single comment display
// ============================================

'use client';

import { useState } from 'react';
import { Comment } from '@/types';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface CommentItemProps {
  comment: Comment;
  onUpdate: () => void;
  onDelete: () => void;
}

export default function CommentItem({ comment, onUpdate, onDelete }: CommentItemProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Check if user can edit/delete
  const isOwner = user && comment.userId.toString() === user.id;
  const isAdmin = user && user.role === UserRole.ADMIN;
  const canEdit = isOwner;
  const canDelete = isOwner || isAdmin;

  const handleEdit = async () => {
    if (!editContent.trim() || editContent.trim().length < 3) {
      setError('Komentar terlalu pendek (minimal 3 karakter)');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/comments/${comment._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: editContent.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengubah komentar');
      }

      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus komentar ini?')) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/comments/${comment._id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menghapus komentar');
      }

      onDelete();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
    setError('');
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      {isEditing ? (
        // Edit Mode
        <div>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={submitting}
          />
          
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleEdit}
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={submitting}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm hover:bg-gray-300 disabled:opacity-50"
            >
              Batal
            </button>
          </div>
        </div>
      ) : (
        // View Mode
        <div>
          <p className="text-gray-700 mb-3">{comment.content}</p>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
              {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                <span className="ml-2 text-gray-400 italic">(diedit)</span>
              )}
            </p>

            {(canEdit || canDelete) && (
              <div className="flex gap-3">
                {canEdit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    ✏️ Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    disabled={submitting}
                    className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                  >
                    🗑️ Hapus
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}