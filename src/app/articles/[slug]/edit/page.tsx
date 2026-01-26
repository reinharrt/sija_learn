'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import BlockEditor from '@/components/article/BlockEditor';
import ImageUpload from '@/components/common/ImageUpload';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { ContentBlock, ArticleCategory, ArticleType, UserRole, Article } from '@/types';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { user, loading: authLoading } = useAuth();
  
  const [article, setArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    banner: '',
    category: ArticleCategory.PELAJARAN,
    type: ArticleType.PUBLIC,
    tags: '',
    published: false,
  });
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load article data
  useEffect(() => {
    if (slug) {
      fetch(`/api/articles/${slug}`)
        .then(res => res.json())
        .then(data => {
          setArticle(data);
          setFormData({
            title: data.title,
            description: data.description,
            banner: data.banner || '',
            category: data.category,
            type: data.type || ArticleType.PUBLIC,
            tags: data.tags ? data.tags.join(', ') : '',
            published: data.published,
          });
          setBlocks(data.blocks || []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Load error:', err);
          setError('Gagal memuat artikel');
          setLoading(false);
        });
    }
  }, [slug]);

  // Check permission
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    
    if (!authLoading && article && user) {
      const isAuthor = article.author.toString() === user.id;
      const isAdmin = user.role === UserRole.ADMIN;
      
      if (!isAuthor && !isAdmin) {
        setError('Anda tidak memiliki akses untuk mengedit artikel ini');
      }
    }
  }, [user, authLoading, article, router]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (blocks.length === 0) {
      setError('Artikel harus memiliki minimal 1 block konten');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/articles/${article?._id}`, {
        method: 'PUT',
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

      router.push(`/articles/${slug}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus artikel ini? Aksi ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      const response = await fetch(`/api/articles/${article?._id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      router.push('/articles');
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

  if (error && !article) {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Edit Artikel</h1>
        <Button variant="danger" onClick={handleDelete}>
          Hapus Artikel
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner Upload */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Banner Artikel</h2>
          <ImageUpload
            type="banner"
            label="Upload Banner (Opsional)"
            onUploadSuccess={handleBannerUpload}
            currentImage={formData.banner}
            aspectRatio="16/9"
          />
        </div>

        {/* Basic Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Informasi Dasar</h2>
          
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Deskripsi singkat artikel..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={ArticleCategory.PELAJARAN}>Pelajaran</option>
                  <option value={ArticleCategory.TECH}>Tech</option>
                  <option value={ArticleCategory.TUTORIAL}>Tutorial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipe Artikel <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={ArticleType.PUBLIC}>Public - Bisa diakses semua orang</option>
                  <option value={ArticleType.COURSE_ONLY}>Course Only - Hanya via enrollment</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.type === ArticleType.PUBLIC 
                    ? '✓ Artikel akan tampil di halaman artikel & bisa ditambah ke course'
                    : '🔒 Artikel hanya bisa diakses via course yang enrolled'}
                </p>
              </div>
            </div>

            <Input
              label="Tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="react, javascript, tutorial (pisahkan dengan koma)"
            />

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
                Publish artikel
              </label>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Konten Artikel</h2>
          <BlockEditor blocks={blocks} onChange={setBlocks} />
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
            onClick={() => router.push(`/articles/${slug}`)}
          >
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}