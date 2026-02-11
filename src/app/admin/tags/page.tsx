// src/app/admin/tags/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Tags, ArrowLeft, Plus, BookOpen, FileText, TrendingUp, Hash, Shield } from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';
import TagsTable from '@/components/admin/TagsTable';
import TagsFilter from '@/components/admin/TagsFilter';
import CreateTagModal from '@/components/admin/CreateTagModal';
import Breadcrumb from '@/components/common/Breadcrumb';

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

export default function AdminTagsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'usage' | 'name' | 'date'>('usage');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTag, setNewTag] = useState({
    name: '',
    description: '',
    category: 'general',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRole.ADMIN)) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      loadTags();
    }
  }, [user, filterCategory]);

  const loadTags = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCategory !== 'all') {
        params.append('category', filterCategory);
      }
      params.append('limit', '1000');
      params.append('populate', 'creator');

      const response = await fetch(`/api/tags?${params}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setTags(data.tags || []);
    } catch (error) {
      console.error('Load tags error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTag.name.trim()) {
      alert('Tag name is required!');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newTag),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create tag');
      }

      alert('Tag created successfully!');
      setShowCreateModal(false);
      setNewTag({ name: '', description: '', category: 'general' });
      loadTags();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTag = async (
    tagId: string,
    tagName: string,
    usageCount: number
  ) => {
    if (usageCount > 0) {
      alert(
        `Cannot delete tag "${tagName}" because it's being used in ${usageCount} items.`
      );
      return;
    }

    if (!confirm(`Delete tag "${tagName}"?`)) return;

    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete tag');
      }

      alert('Tag deleted successfully!');
      loadTags();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const sortedTags = [...tags].sort((a, b) => {
    switch (sortBy) {
      case 'usage':
        return b.usageCount - a.usageCount;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const activeTags = tags.filter((t) => t.usageCount > 0).length;
  const unusedTags = tags.filter((t) => t.usageCount === 0).length;
  const totalUsage = tags.reduce((sum, t) => sum + t.usageCount, 0);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sija-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user || user.role !== UserRole.ADMIN) {
    return null;
  }

  const statCards = [
    { label: 'Total Tags', value: tags.length, icon: Hash, color: 'blue' as const },
    { label: 'Active Tags', value: activeTags, icon: FileText, color: 'green' as const },
    { label: 'Unused Tags', value: unusedTags, icon: BookOpen, color: 'orange' as const },
    { label: 'Total Usage', value: totalUsage, icon: TrendingUp, color: 'purple' as const },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb
        items={[
          { label: 'Admin', href: '/admin', icon: <Shield size={16} strokeWidth={2.5} /> },
          { label: 'Tags', icon: <Tags size={16} strokeWidth={2.5} /> },
        ]}
      />

      <div className="mb-8">
        <div className="bg-sija-surface border-2 border-sija-primary p-8 shadow-hard">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sija-primary border-2 border-sija-primary flex items-center justify-center">
                <Tags className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="font-display text-4xl md:text-5xl font-black text-sija-primary uppercase">
                  Tag Management
                </h1>
                <p className="text-sija-text/70 font-bold mt-1">
                  Kelola tags untuk artikel dan course
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-sija-primary text-white px-6 py-3 font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider text-sm"
            >
              <Plus className="w-5 h-5" />
              Create Tag
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mb-6">
        <TagsFilter
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onRefresh={loadTags}
        />
      </div>

      <TagsTable tags={sortedTags} onDelete={handleDeleteTag} />

      <CreateTagModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTag}
        newTag={newTag}
        setNewTag={setNewTag}
        creating={creating}
      />
    </div>
  );
}