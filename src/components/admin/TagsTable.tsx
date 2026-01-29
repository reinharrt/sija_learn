// ============================================
// src/components/admin/TagsTable.tsx
// Tags Table Component - Reusable table for displaying tags
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
      general: 'bg-gray-100 text-gray-700 border-gray-300',
      technology: 'bg-blue-100 text-blue-700 border-blue-300',
      course: 'bg-purple-100 text-purple-700 border-purple-300',
      subject: 'bg-green-100 text-green-700 border-green-300',
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  if (tags.length === 0) {
    return (
      <div className="bg-sija-surface border-2 border-sija-primary p-12 text-center shadow-hard">
        <p className="text-sija-text font-bold uppercase tracking-wider">
          No tags found
        </p>
      </div>
    );
  }

  return (
    <div className="bg-sija-surface border-2 border-sija-primary shadow-hard overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y-2 divide-sija-primary">
          <thead className="bg-sija-light">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-sija-text uppercase tracking-wider">
                Tag Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-sija-text uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-sija-text uppercase tracking-wider">
                Usage
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-sija-text uppercase tracking-wider">
                Created By
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-sija-text uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-sija-text uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-sija-surface divide-y-2 divide-sija-primary/30">
            {tags.map((tag) => (
              <tr key={tag._id} className="hover:bg-sija-light transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="px-3 py-1 bg-sija-primary text-white border-2 border-sija-primary inline-block w-fit text-sm font-bold uppercase tracking-wider">
                      {tag.name}
                    </span>
                    <span className="text-xs text-sija-text/50 font-mono">#{tag.slug}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-3 py-1 border-2 font-bold uppercase tracking-wider ${getCategoryColor(tag.category)}`}>
                    {tag.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-lg font-black ${
                    tag.usageCount > 0 ? 'text-green-600' : 'text-sija-text/40'
                  }`}>
                    {tag.usageCount}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {tag.createdBy ? (
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-sija-primary mt-0.5 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-sija-text">
                          {tag.createdBy.name}
                        </span>
                        <span className="text-xs text-sija-text/60">
                          {tag.createdBy.email}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-sija-text/50 italic font-medium">System</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-sija-text/70 font-medium line-clamp-2">
                    {tag.description || '-'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onDelete(tag._id, tag.name, tag.usageCount)}
                    disabled={tag.usageCount > 0}
                    className={`flex items-center gap-2 px-4 py-2 font-bold border-2 shadow-hard-sm transition-all text-sm uppercase tracking-wider ${
                      tag.usageCount > 0
                        ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                        : 'bg-red-500 text-white border-red-600 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                    }`}
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