// ============================================
// src/app/articles/create/page.tsx
// Article Create Page - FULL LUCIDE ICONS (No Emojis)
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import BlockEditor from '@/components/article/BlockEditor';
import ImageUpload from '@/components/common/ImageUpload';
import CategorySelector from '@/components/article/CategorySelector';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { ContentBlock, ArticleType, UserRole } from '@/types';
import { 
  Image, 
  FileText, 
  BookOpen, 
  Lock, 
  CheckCircle, 
  Save, 
  X, 
  Loader2,
  AlertCircle,
  Globe,
  LockKeyhole,
  Tag
} from 'lucide-react';

export default function CreateArticlePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    banner: '',
    category: '',
    type: ArticleType.PUBLIC,
    tags: '',
    published: false,
  });
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== UserRole.WRITER && user.role !== UserRole.COURSE_ADMIN && user.role !== UserRole.ADMIN))) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
    setError('');
  };

  const handleBannerUpload = (url: string) => {
    setFormData({
      ...formData,
      banner: url,
    });
  };

  const handleCategoryChange = (categorySlug: string) => {
    setFormData({
      ...formData,
      category: categorySlug,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (blocks.length === 0) {
      setError('Artikel harus memiliki minimal 1 block konten');
      setSubmitting(false);
      return;
    }

    if (!formData.category) {
      setError('Kategori wajib dipilih');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          banner: formData.banner,
          category: formData.category,
          type: formData.type,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
          blocks,
          published: formData.published,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      router.push(`/articles/${data.slug}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-900 font-bold uppercase tracking-wider">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 pb-6 border-b-2 border-gray-900">
        <h1 className="text-4xl font-black text-gray-900 mb-2 uppercase">Buat Artikel Baru</h1>
        <p className="text-gray-600 font-medium">Tulis dan bagikan pengetahuan Anda</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-2 border-red-600 px-4 py-3 mb-6 shadow-[2px_2px_0px_0px_rgba(220,38,38,1)]">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="font-bold text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner Upload */}
        <div className="bg-white p-6 border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2 uppercase">
            <Image className="w-6 h-6" />
            Banner Artikel
          </h2>
          <ImageUpload
            type="banner"
            label="Upload Banner (Opsional)"
            onUploadSuccess={handleBannerUpload}
            currentImage={formData.banner}
            aspectRatio="16/9"
          />
        </div>

        {/* Basic Info */}
        <div className="bg-white p-6 border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2 uppercase">
            <FileText className="w-6 h-6" />
            Informasi Dasar
          </h2>
          
          <div className="space-y-4">
            <Input
              label="Judul"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Judul artikel..."
              required
            />

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Deskripsi <span className="text-red-600">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-900 focus:outline-none focus:border-blue-600 font-medium"
                rows={3}
                placeholder="Deskripsi singkat artikel..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Selector */}
              <CategorySelector
                selectedCategory={formData.category}
                onChange={handleCategoryChange}
              />

              {/* Article Type */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Tipe Artikel <span className="text-red-600">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-900 focus:outline-none focus:border-blue-600 font-bold"
                  required
                >
                  <option value={ArticleType.PUBLIC}>
                    Public - Bisa diakses semua orang
                  </option>
                  <option value={ArticleType.COURSE_ONLY}>
                    Course Only - Hanya via enrollment
                  </option>
                </select>
                <div className="flex items-start gap-3 mt-2 p-3 bg-gray-50 border-l-4 border-gray-900">
                  {formData.type === ArticleType.PUBLIC ? (
                    <>
                      <Globe className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-gray-900 mb-1">Public Access</p>
                        <p className="text-xs text-gray-700">
                          Artikel akan tampil di halaman artikel & bisa ditambah ke course
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <LockKeyhole className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-gray-900 mb-1">Course Only</p>
                        <p className="text-xs text-gray-700">
                          Artikel hanya bisa diakses via course yang enrolled
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="react, javascript, tutorial (pisahkan dengan koma)"
                className="w-full px-4 py-3 border-2 border-gray-900 focus:outline-none focus:border-blue-600 font-medium"
              />
              <p className="mt-2 text-xs text-gray-600 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Gunakan koma untuk memisahkan tags
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2 p-3 bg-blue-50 border-2 border-blue-600">
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleChange}
                className="w-5 h-5 border-2 border-gray-900"
                id="published"
              />
              <label htmlFor="published" className="text-sm font-bold text-gray-900 cursor-pointer flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                Publish artikel sekarang
              </label>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white p-6 border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2 uppercase">
            <FileText className="w-6 h-6" />
            Konten Artikel
          </h2>
          <BlockEditor blocks={blocks} onChange={setBlocks} />
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 border-2 border-blue-600 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Simpan Artikel
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-900 font-bold hover:bg-gray-100 transition-colors uppercase tracking-wider"
          >
            <X className="w-5 h-5" />
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}