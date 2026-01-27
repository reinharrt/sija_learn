// ============================================
// src/app/courses/[slug]/edit/page.tsx
// Course Edit Page - Edit existing course
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import ImageUpload from '@/components/common/ImageUpload';
import { UserRole, Article, Course } from '@/types';

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { user, loading: authLoading } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    published: false,
  });
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [availableArticles, setAvailableArticles] = useState<Article[]>([]);
  const [articleTypeFilter, setArticleTypeFilter] = useState<'all' | 'public' | 'course-only'>('all');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load course data
  useEffect(() => {
    if (slug) {
      fetch(`/api/courses/${slug}`)
        .then(res => res.json())
        .then(data => {
          setCourse(data);
          setFormData({
            title: data.title,
            description: data.description,
            thumbnail: data.thumbnail || '',
            published: data.published,
          });
          // Convert ObjectId array to string array
          setSelectedArticles(data.articles?.map((id: any) => id.toString()) || []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Load error:', err);
          setError('Gagal memuat course');
          setLoading(false);
        });
    }
  }, [slug]);

  // Check permission
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    
    if (!authLoading && course && user) {
      const isCreator = course.creator.toString() === user.id;
      const isAdmin = user.role === UserRole.ADMIN;
      
      if (!isCreator && !isAdmin) {
        setError('Anda tidak memiliki akses untuk mengedit course ini');
      }
    }
  }, [user, authLoading, course, router]);

  // Load ALL published articles (public + course-only)
  useEffect(() => {
    fetch('/api/articles?published=true&limit=200')
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

  const selectAllVisible = () => {
    const visibleArticles = getFilteredArticles();
    const visibleIds = visibleArticles.map(a => a._id?.toString() || '');
    const newSelected = [...new Set([...selectedArticles, ...visibleIds])];
    setSelectedArticles(newSelected);
  };

  const deselectAllVisible = () => {
    const visibleArticles = getFilteredArticles();
    const visibleIds = visibleArticles.map(a => a._id?.toString() || '');
    setSelectedArticles(prev => prev.filter(id => !visibleIds.includes(id)));
  };

  const getFilteredArticles = () => {
    if (articleTypeFilter === 'all') return availableArticles;
    return availableArticles.filter(a => a.type === articleTypeFilter);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/courses/${course?._id}`, {
        method: 'PUT',
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

      router.push(`/courses/${slug}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus course ini? Aksi ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${course?._id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      router.push('/courses');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (authLoading || loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  if (error && !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <div className="mt-4">
          <Button onClick={() => router.back()}>Kembali</Button>
        </div>
      </div>
    );
  }

  const filteredArticles = getFilteredArticles();
  const publicCount = availableArticles.filter(a => a.type === 'public').length;
  const courseOnlyCount = availableArticles.filter(a => a.type === 'course-only').length;
  const selectedPublicCount = selectedArticles.filter(id => 
    availableArticles.find(a => a._id?.toString() === id && a.type === 'public')
  ).length;
  const selectedCourseOnlyCount = selectedArticles.filter(id => 
    availableArticles.find(a => a._id?.toString() === id && a.type === 'course-only')
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Edit Course</h1>
        <Button variant="danger" onClick={handleDelete}>
          Hapus Course
        </Button>
      </div>

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

        {/* Basic Info */}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="mr-2 w-4 h-4"
                id="published"
              />
              <label htmlFor="published" className="text-sm text-gray-700 cursor-pointer">
                Publish course
              </label>
            </div>
          </div>
        </div>

        {/* Articles Selection */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">
              Pilih Artikel
            </h2>
            
            {/* Stats */}
            <div className="flex gap-4 text-sm mb-4">
              <div className="bg-blue-50 px-3 py-2 rounded">
                <span className="font-medium text-blue-900">Total dipilih: {selectedArticles.length}</span>
              </div>
              <div className="bg-green-50 px-3 py-2 rounded">
                <span className="text-green-900">🌐 Public: {selectedPublicCount}</span>
              </div>
              <div className="bg-purple-50 px-3 py-2 rounded">
                <span className="text-purple-900">🔒 Course-Only: {selectedCourseOnlyCount}</span>
              </div>
            </div>
          </div>
          
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 mb-2">
              💡 <strong>Tips Memilih Artikel:</strong>
            </p>
            <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
              <li><strong>PUBLIC</strong> ({publicCount} artikel): Bisa diakses semua orang tanpa harus enroll</li>
              <li><strong>COURSE-ONLY</strong> ({courseOnlyCount} artikel): Hanya bisa diakses setelah enroll course</li>
              <li>Anda bisa menggabungkan keduanya untuk membuat learning path yang fleksibel</li>
            </ul>
          </div>

          {/* Filter & Actions */}
          <div className="flex flex-wrap gap-3 mb-4">
            {/* Filter Tabs */}
            <div className="flex gap-2 flex-1">
              <button
                type="button"
                onClick={() => setArticleTypeFilter('all')}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  articleTypeFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Semua ({availableArticles.length})
              </button>
              <button
                type="button"
                onClick={() => setArticleTypeFilter('public')}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  articleTypeFilter === 'public'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🌐 Public ({publicCount})
              </button>
              <button
                type="button"
                onClick={() => setArticleTypeFilter('course-only')}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  articleTypeFilter === 'course-only'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔒 Course-Only ({courseOnlyCount})
              </button>
            </div>

            {/* Bulk Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllVisible}
                className="px-3 py-2 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
              >
                ✓ Pilih Semua
              </button>
              <button
                type="button"
                onClick={deselectAllVisible}
                className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
              >
                ✗ Hapus Semua
              </button>
            </div>
          </div>

          {/* Articles List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto border rounded-lg p-4">
            {filteredArticles.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Tidak ada artikel {articleTypeFilter !== 'all' ? articleTypeFilter : ''} tersedia
              </p>
            ) : (
              filteredArticles.map((article) => {
                const isSelected = selectedArticles.includes(article._id?.toString() || '');
                
                return (
                  <div
                    key={article._id?.toString()}
                    className={`flex items-start p-3 border rounded transition-colors ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleArticle(article._id?.toString() || '')}
                      className="mt-1 mr-3 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-medium text-gray-900">{article.title}</h3>
                        
                        {/* Type Badge */}
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          article.type === 'public' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {article.type === 'public' ? '🌐 Public' : '🔒 Course Only'}
                        </span>
                        
                        {/* Category Badge */}
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {article.category}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">{article.description}</p>
                      
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {article.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Selected Summary */}
          {selectedArticles.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">
                📝 Artikel yang dipilih: {selectedArticles.length}
              </p>
              <div className="flex gap-4 text-xs">
                <span className="text-green-700">
                  ✓ {selectedPublicCount} Public
                </span>
                <span className="text-purple-700">
                  ✓ {selectedCourseOnlyCount} Course-Only
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(`/courses/${slug}`)}
          >
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}