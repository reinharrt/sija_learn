// ============================================
// src/components/admin/CreateTagModal.tsx
// Create Tag Modal Component - Neobrutalist Design with Dark Mode
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
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 transition-colors duration-300">
      <div className="bg-sija-surface border-2 border-sija-border shadow-hard max-w-md w-full p-6 transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-sija-border transition-colors duration-300">
          <h2 className="font-display text-2xl font-black text-sija-primary uppercase transition-colors duration-300">
            Create New Tag
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-red-500 dark:bg-red-600 border-2 border-red-600 dark:border-red-700 flex items-center justify-center hover:bg-red-600 dark:hover:bg-red-700 transition-colors duration-300"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Tag Name */}
          <div>
            <label className="block text-sm font-bold text-sija-text mb-2 uppercase tracking-wider transition-colors duration-300">
              Tag Name <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              type="text"
              value={newTag.name}
              onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
              className="w-full px-4 py-3 bg-sija-background border-2 border-sija-border font-medium text-sija-text placeholder:text-sija-text/50 focus:outline-none focus:ring-2 focus:ring-sija-primary transition-colors duration-300"
              placeholder="e.g., javascript, react, networking"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-sija-text mb-2 uppercase tracking-wider transition-colors duration-300">
              Category
            </label>
            <select
              value={newTag.category}
              onChange={(e) => setNewTag({ ...newTag, category: e.target.value })}
              className="w-full px-4 py-3 bg-sija-background border-2 border-sija-border font-bold text-sija-text focus:outline-none focus:ring-2 focus:ring-sija-primary transition-colors duration-300"
            >
              <option value="general">General</option>
              <option value="technology">Technology</option>
              <option value="course">Course</option>
              <option value="subject">Subject</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-sija-text mb-2 uppercase tracking-wider transition-colors duration-300">
              Description (Optional)
            </label>
            <textarea
              value={newTag.description}
              onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
              className="w-full px-4 py-3 bg-sija-background border-2 border-sija-border font-medium text-sija-text placeholder:text-sija-text/50 focus:outline-none focus:ring-2 focus:ring-sija-primary resize-none transition-colors duration-300"
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
              className="flex-1 bg-sija-surface text-sija-text px-6 py-3 font-bold border-2 border-sija-border shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}