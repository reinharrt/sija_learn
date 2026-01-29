// ============================================
// src/components/article/CategorySelector.tsx
// Category Selector - FULL LUCIDE ICONS + Neobrutalist
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  X, 
  Folder, 
  BookOpen, 
  Code, 
  Laptop, 
  Palette, 
  Wrench, 
  FileText, 
  Rocket, 
  Zap, 
  Target, 
  Star, 
  Lightbulb, 
  Coffee,
  Loader2,
  AlertCircle,
  Save,
  Eye
} from 'lucide-react';
import { getAuthHeaders } from '@/contexts/AuthContext';

interface Category {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  usageCount: number;
}

interface CategorySelectorProps {
  selectedCategory: string;
  onChange: (categorySlug: string) => void;
}

export default function CategorySelector({ selectedCategory, onChange }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: 'Folder',
    color: '#3B82F6',
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Load categories error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      setError('Nama kategori wajib diisi');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newCategory),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat category');
      }

      await loadCategories();
      onChange(data.slug);

      setNewCategory({
        name: '',
        description: '',
        icon: 'Folder',
        color: '#3B82F6',
      });
      setShowModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const colorOptions = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Red', value: '#EF4444' },
  ];

  const iconOptions = [
    { name: 'Folder', icon: Folder },
    { name: 'BookOpen', icon: BookOpen },
    { name: 'Laptop', icon: Laptop },
    { name: 'Palette', icon: Palette },
    { name: 'Wrench', icon: Wrench },
    { name: 'FileText', icon: FileText },
    { name: 'Rocket', icon: Rocket },
    { name: 'Zap', icon: Zap },
    { name: 'Target', icon: Target },
    { name: 'Star', icon: Star },
    { name: 'Code', icon: Code },
    { name: 'Lightbulb', icon: Lightbulb },
    { name: 'Coffee', icon: Coffee },
  ];

  const renderIcon = (iconName: string, className: string = 'w-5 h-5') => {
    const iconOption = iconOptions.find(opt => opt.name === iconName);
    if (iconOption) {
      const IconComponent = iconOption.icon;
      return <IconComponent className={className} />;
    }
    return <Folder className={className} />;
  };

  if (loading) {
    return (
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Kategori <span className="text-red-600">*</span>
        </label>
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 border-2 border-gray-300"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-bold text-gray-900 mb-2">
        Kategori <span className="text-red-600">*</span>
      </label>

      <div className="flex gap-2">
        <select
          value={selectedCategory}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-3 border-2 border-gray-900 focus:outline-none focus:border-blue-600 font-bold"
          required
        >
          <option value="">Pilih Kategori</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name} ({cat.usageCount})
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 border-2 border-blue-600 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          title="Buat Kategori Baru"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
        <Folder className="w-3 h-3" />
        Pilih kategori yang sesuai atau buat yang baru
      </p>

      {/* Create Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-2 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b-2 border-gray-900 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2 uppercase">
                  <Folder className="w-6 h-6" />
                  Buat Kategori
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-200 transition-colors border-2 border-transparent hover:border-gray-900"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {error && (
                <div className="bg-red-50 border-2 border-red-600 px-4 py-3 mb-4 shadow-[2px_2px_0px_0px_rgba(220,38,38,1)]">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="font-bold text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                {/* Category Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Nama Kategori <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-900 focus:outline-none focus:border-blue-600 font-medium"
                    placeholder="e.g., Web Development"
                    minLength={2}
                    maxLength={50}
                  />
                </div>

                {/* Icon Selector */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {iconOptions.map((iconOpt) => {
                      const IconComponent = iconOpt.icon;
                      return (
                        <button
                          key={iconOpt.name}
                          type="button"
                          onClick={() => setNewCategory({ ...newCategory, icon: iconOpt.name })}
                          className={`p-3 border-2 transition-all flex items-center justify-center ${
                            newCategory.icon === iconOpt.name
                              ? 'border-blue-600 bg-blue-50 shadow-[2px_2px_0px_0px_rgba(59,130,246,1)]'
                              : 'border-gray-900 hover:bg-gray-50'
                          }`}
                          title={iconOpt.name}
                        >
                          <IconComponent className="w-5 h-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Selector */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Warna
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() =>
                          setNewCategory({ ...newCategory, color: color.value })
                        }
                        className={`w-12 h-12 border-2 transition-all ${
                          newCategory.color === color.value
                            ? 'border-gray-900 scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            : 'border-gray-900 opacity-60 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Deskripsi (Opsional)
                  </label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, description: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-900 focus:outline-none focus:border-blue-600 font-medium"
                    rows={3}
                    placeholder="Deskripsi singkat kategori..."
                    maxLength={200}
                  />
                </div>

                {/* Preview */}
                <div className="bg-gray-50 border-2 border-gray-900 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="w-4 h-4 text-gray-600" />
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Preview</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-3 border-2 border-gray-900"
                      style={{ backgroundColor: newCategory.color + '30' }}
                    >
                      {renderIcon(newCategory.icon, 'w-6 h-6')}
                    </div>
                    <div>
                      <p className="font-black text-gray-900">{newCategory.name || 'Nama Kategori'}</p>
                      {newCategory.description && (
                        <p className="text-sm text-gray-600 font-medium">{newCategory.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t-2 border-gray-900 bg-gray-50">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={creating || !newCategory.name.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 border-2 border-blue-600 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Membuat...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Buat Kategori
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={creating}
                  className="px-6 py-3 border-2 border-gray-900 font-bold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wider"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}