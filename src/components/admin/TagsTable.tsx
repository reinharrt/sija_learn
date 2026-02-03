// ============================================
// src/components/admin/TagsTable.tsx
// Tags Table Component - Reusable table for displaying tags with Dark Mode
// ============================================

import { Trash2, User } from 'lucide-react';

interface Tag {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  usageCount: number;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  } | null;
  createdAt: Date;
}

interface TagsTableProps {
  tags: Tag[];
  onDelete: (tagId: string, tagName: string, usageCount: number) => void;
}

export default function TagsTable({ tags, onDelete }: TagsTableProps) {
  const getCategoryColor = (category: string) => {
    const colors = {
      general: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600',
      technology: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600',
      course: 'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600',
      subject: 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-600',
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  if (tags.length === 0) {
    return (
      <div className="bg-sija-surface border-2 border-sija-border p-12 text-center shadow-hard transition-colors duration-300">
        <p className="text-sija-text font-bold uppercase tracking-wider transition-colors duration-300">
          No tags found
        </p>
      </div>
    );
  }

  return (
    <div className="bg-sija-surface border-2 border-sija-border shadow-hard overflow-hidden transition-colors duration-300">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y-2 divide-sija-border">
          <thead className="bg-sija-light dark:bg-sija-dark/30 transition-colors duration-300">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-sija-text uppercase tracking-wider transition-colors duration-300">
                Tag Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-sija-text uppercase tracking-wider transition-colors duration-300">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-sija-text uppercase tracking-wider transition-colors duration-300">
                Usage
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-sija-text uppercase tracking-wider transition-colors duration-300">
                Created By
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-sija-text uppercase tracking-wider transition-colors duration-300">
                Description
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-sija-text uppercase tracking-wider transition-colors duration-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-sija-surface divide-y-2 divide-sija-border/30 transition-colors duration-300">
            {tags.map((tag) => (
              <tr key={tag._id} className="hover:bg-sija-light dark:hover:bg-sija-dark/20 transition-colors duration-200">
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="px-3 py-1 bg-sija-primary text-white border-2 border-sija-primary inline-block w-fit text-sm font-bold uppercase tracking-wider transition-colors duration-300">
                      {tag.name}
                    </span>
                    <span className="text-xs text-sija-text/50 dark:text-sija-text/40 font-mono transition-colors duration-300">#{tag.slug}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-3 py-1 border-2 font-bold uppercase tracking-wider transition-colors duration-300 ${getCategoryColor(tag.category)}`}>
                    {tag.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-lg font-black ${
                    tag.usageCount > 0 ? 'text-green-600 dark:text-green-400' : 'text-sija-text/40 dark:text-sija-text/30'
                  } transition-colors duration-300`}>
                    {tag.usageCount}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {tag.createdBy ? (
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-sija-primary mt-0.5 flex-shrink-0 transition-colors duration-300" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-sija-text transition-colors duration-300">
                          {tag.createdBy.name}
                        </span>
                        <span className="text-xs text-sija-text/60 dark:text-sija-text/50 transition-colors duration-300">
                          {tag.createdBy.email}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-sija-text/50 dark:text-sija-text/40 italic font-medium transition-colors duration-300">System</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-sija-text/70 dark:text-sija-text/60 font-medium line-clamp-2 transition-colors duration-300">
                    {tag.description || '-'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onDelete(tag._id, tag.name, tag.usageCount)}
                    disabled={tag.usageCount > 0}
                    className={`flex items-center gap-2 px-4 py-2 font-bold border-2 shadow-hard-sm transition-all text-sm uppercase tracking-wider ${
                      tag.usageCount > 0
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-700 cursor-not-allowed'
                        : 'bg-red-500 dark:bg-red-600 text-white border-red-600 dark:border-red-700 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                    } duration-300`}
                    title={tag.usageCount > 0 ? 'Cannot delete tag in use' : 'Delete tag'}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}