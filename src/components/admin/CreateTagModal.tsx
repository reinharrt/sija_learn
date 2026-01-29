// ============================================
// src/components/admin/CreateTagModal.tsx
// Create Tag Modal Component
// ============================================

import { X } from 'lucide-react';

interface CreateTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newTag: {
    name: string;
    description: string;
    category: string;
  };
  setNewTag: (tag: any) => void;
  creating: boolean;
}

export default function CreateTagModal({
  isOpen,
  onClose,
  onSubmit,
  newTag,
  setNewTag,
  creating,
}: CreateTagModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-sija-surface border-2 border-sija-primary shadow-hard max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-sija-primary">
          <h2 className="font-display text-2xl font-black text-sija-primary uppercase">
            Create New Tag
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-red-500 border-2 border-red-600 flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Tag Name */}
          <div>
            <label className="block text-sm font-bold text-sija-text mb-2 uppercase tracking-wider">
              Tag Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newTag.name}
              onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
              className="w-full px-4 py-3 bg-sija-light border-2 border-sija-primary font-medium text-sija-text placeholder:text-sija-text/50 focus:outline-none focus:ring-2 focus:ring-sija-primary"
              placeholder="e.g., javascript, react, networking"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-sija-text mb-2 uppercase tracking-wider">
              Category
            </label>
            <select
              value={newTag.category}
              onChange={(e) => setNewTag({ ...newTag, category: e.target.value })}
              className="w-full px-4 py-3 bg-sija-light border-2 border-sija-primary font-bold text-sija-text focus:outline-none focus:ring-2 focus:ring-sija-primary"
            >
              <option value="general">General</option>
              <option value="technology">Technology</option>
              <option value="course">Course</option>
              <option value="subject">Subject</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-sija-text mb-2 uppercase tracking-wider">
              Description (Optional)
            </label>
            <textarea
              value={newTag.description}
              onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
              className="w-full px-4 py-3 bg-sija-light border-2 border-sija-primary font-medium text-sija-text placeholder:text-sija-text/50 focus:outline-none focus:ring-2 focus:ring-sija-primary resize-none"
              rows={3}
              placeholder="Brief description of this tag..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={creating}
              className="flex-1 bg-sija-primary text-white px-6 py-3 font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              {creating ? 'Creating...' : 'Create Tag'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-sija-light text-sija-text px-6 py-3 font-bold border-2 border-sija-primary shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}