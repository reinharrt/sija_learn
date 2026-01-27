// ============================================
// src/app/courses/create/page.tsx
// Course Create Page - Create new course
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import ImageUpload from '@/components/common/ImageUpload';
import { UserRole, Article } from '@/types';

export default function CreateCoursePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    published: false,
  });
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [availableArticles, setAvailableArticles] = useState<Article[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== UserRole.COURSE_ADMIN && user.role !== UserRole.ADMIN))) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // 🆕 Load ALL published articles (public + course-only)
    fetch('/api/articles?published=true&limit=100')
      .then(res => res.json())
      .then(data => setAvailableArticles(data.articles || []))
      .catch(console.error);
  }, []);

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

  const toggleArticle = (articleId: string) => {
    setSelectedArticles(prev =>
      prev.includes(articleId)
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...formData,
          articles: selectedArticles,
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
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold mb-8">Buat Course Baru</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thumbnail Upload */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Thumbnail Course</h2>
          <ImageUpload
            type="banner"
            label="Upload Thumbnail (Opsional)"
            onUploadSuccess={handleThumbnailUpload}
            currentImage={formData.thumbnail}
            aspectRatio="16/9"
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Informasi Course</h2>
          
          <div className="space-y-4">
            <Input
              label="Judul Course"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Judul course..."
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
                placeholder="Deskripsi course..."
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">Publish course</label>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Pilih Artikel ({selectedArticles.length} dipilih)
          </h2>
          
          {/* 🆕 Info about article types */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tips:</strong> Anda bisa menambahkan artikel <strong>PUBLIC</strong> (bisa diakses semua orang) 
              atau <strong>COURSE-ONLY</strong> (hanya bisa diakses via course).
            </p>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableArticles.length === 0 ? (
              <p className="text-gray-500">Tidak ada artikel tersedia</p>
            ) : (
              availableArticles.map((article) => (
                <div
                  key={article._id?.toString()}
                  className="flex items-start p-3 border rounded hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedArticles.includes(article._id?.toString() || '')}
                    onChange={() => toggleArticle(article._id?.toString() || '')}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{article.title}</h3>
                      {/* 🆕 Show article type badge */}
                      <span className={`text-xs px-2 py-1 rounded ${
                        article.type === 'public' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {article.type === 'public' ? '🌐 Public' : '🔒 Course Only'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{article.description}</p>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1 inline-block">
                      {article.category}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Menyimpan...' : 'Simpan Course'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}