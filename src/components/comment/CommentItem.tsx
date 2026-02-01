// ============================================
// src/components/comment/CommentItem.tsx
// Comment Item Component - FULL LUCIDE ICONS + Neobrutalist
// ============================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Comment } from '@/types';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import {
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  AlertCircle,
  Calendar,
  Clock
} from 'lucide-react';

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
    <div className="border-2 border-gray-900 p-4 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
      {isEditing ? (
        // Edit Mode
        <div>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-3 border-2 border-gray-900 focus:outline-none focus:border-blue-600 font-medium"
            rows={3}
            disabled={submitting}
            placeholder="Tulis komentar..."
          />

          {error && (
            <div className="bg-red-50 border-2 border-red-600 px-3 py-2 mt-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm font-bold">{error}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleEdit}
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 border-2 border-blue-600 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan
                </>
              )}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-4 py-2 border-2 border-gray-900 font-bold text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <X className="w-4 h-4" />
              Batal
            </button>
          </div>
        </div>
      ) : (
        // View Mode
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={`/profile/${comment.author?._id || comment.userId}`}
              className="font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {comment.author?.name || 'User'}
            </Link>
          </div>
          <p className="text-gray-900 mb-3 font-medium leading-relaxed">{comment.content}</p>

          <div className="flex items-center justify-between pt-3 border-t-2 border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">
                {new Date(comment.createdAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <Clock className="w-3 h-3 ml-1" />
              <span>
                {new Date(comment.createdAt).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                <span className="ml-2 px-2 py-0.5 bg-gray-100 border border-gray-300 text-gray-600 text-xs font-bold italic">
                  EDITED
                </span>
              )}
            </div>

            {(canEdit || canDelete) && (
              <div className="flex gap-2">
                {canEdit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border-2 border-blue-600 font-bold text-xs hover:bg-blue-100 transition-colors uppercase tracking-wider"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border-2 border-red-600 font-bold text-xs hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wider"
                  >
                    {submitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Hapus
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