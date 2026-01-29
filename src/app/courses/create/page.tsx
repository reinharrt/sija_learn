// ============================================
// src/app/courses/create/page.tsx
// Create Course Page - FULL LUCIDE ICONS + Neobrutalist
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import ImageUpload from '@/components/common/ImageUpload';
import TagInput from '@/components/common/TagInput';
import { 
  Image, 
  FileText, 
  Save, 
  X, 
  Loader2,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Tag
} from 'lucide-react';

export default function CreateCoursePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    published: false,
  });
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== UserRole.COURSE_ADMIN && user.role !== UserRole.ADMIN)) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
    setError('');
  };

  const handleThumbnailUpload = (url: string) => {
    setFormData({
      ...formData,
      thumbnail: url,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!formData.title || !formData.description) {
      setError('Title dan description wajib diisi');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          thumbnail: formData.thumbnail,
          tags,
          published: formData.published,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      router.push(`/courses/${data.slug}`);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 pb-6 border-b-2 border-gray-900">
        <h1 className="text-4xl font-black text-gray-900 mb-2 uppercase">Buat Course Baru</h1>
        <p className="text-gray-600 font-medium">Buat course pembelajaran untuk siswa</p>
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
        {/* Thumbnail */}
        <div className="bg-white p-6 border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2 uppercase">
            <Image className="w-6 h-6" />
            Thumbnail Course
          </h2>
          <ImageUpload
            type="banner"
            label="Upload Thumbnail (Opsional)"
            onUploadSuccess={handleThumbnailUpload}
            currentImage={formData.thumbnail}
            aspectRatio="16/9"
          />
        </div>

        {/* Basic Info */}
        <div className="bg-white p-6 border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2 uppercase">
            <FileText className="w-6 h-6" />
            Informasi Course
          </h2>
          
          <div className="space-y-4">
            <Input
              label="Judul Course"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Contoh: Belajar Linux Debian untuk Pemula"
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
                rows={4}
                placeholder="Jelaskan apa yang akan dipelajari di course ini..."
                required
              />
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </label>
              <TagInput
                tags={tags}
                onChange={setTags}
                placeholder="Tambah tags (contoh: debian, linux, networking)"
                maxTags={10}
              />
              <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Tags membantu user menemukan course. Contoh: debian, linux, server, networking
              </p>
            </div>

            {/* Publish Checkbox */}
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
                Publish course (tampilkan ke publik)
              </label>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-yellow-50 border-2 border-yellow-600 p-4 shadow-[2px_2px_0px_0px_rgba(202,138,4,1)]">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-yellow-900 mb-1">Tips</p>
              <p className="text-sm text-yellow-800 font-medium">
                Setelah course dibuat, Anda bisa menambahkan artikel ke course dari halaman edit course.
              </p>
            </div>
          </div>
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
                Buat Course
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