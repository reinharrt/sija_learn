// ============================================
// src/app/courses/[slug]/edit/page.tsx
// Edit Course Page - Neobrutalist Design with Enhanced Features
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth, getAuthHeaders } from '@/contexts/AuthContext';
import { UserRole, Article, Course } from '@/types';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import ImageUpload from '@/components/common/ImageUpload';
import TagInput from '@/components/common/TagInput';
import CategorySelector from '@/components/article/CategorySelector';
import ArticleSelector from '@/components/course/ArticleSelector';
import DifficultySelector from '@/components/course/DifficultySelector';
import XPPreview from '@/components/course/XPPreview';
import { CourseDifficulty } from '@/lib/gamification';
import {
  BookOpen,
  Image as ImageIcon,
  FileText,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Tag,
  Trash2,
  List,
  Filter,
  Globe,
  Lock,
  Plus,
  Edit,
  Star
} from 'lucide-react';

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
    category: '',
    published: false,
  });
  const [tags, setTags] = useState<string[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [availableArticles, setAvailableArticles] = useState<Article[]>([]);
  const [difficulty, setDifficulty] = useState<CourseDifficulty | undefined>(undefined);
  const [customXP, setCustomXP] = useState<number | undefined>(undefined);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showArticleSelector, setShowArticleSelector] = useState(false);

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
            category: data.category || '',
            published: data.published,
          });
          setTags(data.tags || []);
          setSelectedArticles(data.articles?.map((id: any) => id.toString()) || []);
          setDifficulty(data.difficulty);
          setCustomXP(data.xpReward);
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

  // Load ALL published articles
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
    setSuccess('');
  };

  const handleThumbnailUpload = (url: string) => {
    setFormData({ ...formData, thumbnail: url });
  };

  const handleCategoryChange = (categorySlug: string) => {
    setFormData({ ...formData, category: categorySlug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/courses/${course?._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...formData,
          tags,
          articles: selectedArticles,
          difficulty,
          xpReward: customXP,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setSuccess('Course berhasil diupdate!');
      setTimeout(() => {
        router.push(`/courses/${slug}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus course ini? Tindakan ini tidak dapat dibatalkan!')) {
      return;
    }

    setDeleting(true);
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
      setDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-sija-light dark:bg-gray-950 flex items-center justify-center">
        <div className="bg-sija-surface dark:bg-gray-900 border-2 border-sija-primary dark:border-white p-8 shadow-hard">
          <Loader2 className="w-12 h-12 animate-spin text-sija-primary dark:text-yellow-400 mx-auto mb-4" />
          <p className="font-bold text-sija-text dark:text-white uppercase tracking-wider">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (error && !course)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-sija-light dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <section className="relative pt-8 pb-12 px-6 border-b-2 border-sija-primary dark:border-white bg-sija-surface dark:bg-gray-900 transition-colors">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-6">
            <div className="bg-blue-500 p-4 border-2 border-blue-700 shadow-hard">
              <BookOpen size={32} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-4xl md:text-5xl font-black text-sija-primary dark:text-yellow-400 mb-3 leading-none uppercase">
                Edit Course
              </h1>
              <p className="text-base md:text-lg text-sija-text dark:text-gray-300 font-medium border-l-4 border-blue-500 pl-4">
                Update informasi dan konten course
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Success Alert */}
        {success && (
          <div className="bg-green-100 border-2 border-green-500 p-6 mb-8 shadow-hard">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <div>
                <p className="font-bold text-green-900 uppercase tracking-wider mb-1">Success</p>
                <p className="text-green-800 font-medium">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-100 border-2 border-red-500 p-6 mb-8 shadow-hard">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <div>
                <p className="font-bold text-red-900 uppercase tracking-wider mb-1">Error</p>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Thumbnail */}
          <div className="bg-sija-surface dark:bg-gray-900 border-2 border-sija-primary dark:border-white p-6 md:p-8 shadow-hard transition-colors">
            <h2 className="font-display text-2xl font-bold text-sija-text dark:text-white mb-6 uppercase flex items-center gap-3 border-b-2 border-dashed border-sija-text/10 dark:border-gray-700 pb-4">
              <div className="p-2 bg-sija-primary border-2 border-sija-primary">
                <ImageIcon className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              Thumbnail Course
            </h2>
            <ImageUpload
              type="banner"
              label="Upload Thumbnail"
              onUploadSuccess={handleThumbnailUpload}
              currentImage={formData.thumbnail}
              aspectRatio="16/9"
            />
          </div>

          {/* Basic Info */}
          <div className="bg-sija-surface dark:bg-gray-900 border-2 border-sija-primary dark:border-white p-6 md:p-8 shadow-hard transition-colors">
            <h2 className="font-display text-2xl font-bold text-sija-text dark:text-white mb-6 uppercase flex items-center gap-3 border-b-2 border-dashed border-sija-text/10 dark:border-gray-700 pb-4">
              <div className="p-2 bg-green-500 border-2 border-green-700">
                <FileText className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              Informasi Course
            </h2>

            <div className="space-y-6">
              <Input
                label="Judul Course"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />

              <div>
                <label className="block text-sm font-bold text-sija-text dark:text-white mb-2 uppercase tracking-wider">
                  Deskripsi <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-sija-primary dark:border-white bg-sija-surface dark:bg-gray-800 text-sija-text dark:text-white focus:outline-none focus:ring-2 focus:ring-sija-primary dark:focus:ring-yellow-400 font-medium transition-colors"
                  rows={5}
                  required
                />
              </div>

              <CategorySelector
                selectedCategory={formData.category}
                onChange={handleCategoryChange}
              />
            </div>
          </div>

          {/* Articles Selection */}
          <div className="bg-sija-surface dark:bg-gray-900 border-2 border-sija-primary dark:border-white p-6 md:p-8 shadow-hard transition-colors">
            <h2 className="font-display text-2xl font-bold text-sija-text dark:text-white mb-6 uppercase flex items-center gap-3 border-b-2 border-dashed border-sija-text/10 dark:border-gray-700 pb-4">
              <div className="p-2 bg-purple-500 border-2 border-purple-700">
                <List className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              Artikel Course
            </h2>

            {/* Open Selector Button */}
            <button
              type="button"
              onClick={() => setShowArticleSelector(true)}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-500 text-white font-bold border-2 border-blue-700 shadow-hard hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all uppercase tracking-wider mb-6"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
              Pilih / Edit Artikel ({selectedArticles.length} dipilih)
            </button>

            {/* Selected Articles Display */}
            {selectedArticles.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-sija-text dark:text-white uppercase tracking-wider text-sm">
                    {selectedArticles.length} Artikel Dipilih
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedArticles([])}
                    className="px-3 py-1 bg-red-500 text-white font-bold text-xs border-2 border-red-700 shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase"
                  >
                    <X className="w-3 h-3 inline mr-1" strokeWidth={2.5} />
                    Hapus Semua
                  </button>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto border-2 border-sija-primary dark:border-white p-4 bg-sija-light dark:bg-gray-800">
                  {selectedArticles.map((articleId, index) => {
                    const article = availableArticles.find(a => a._id?.toString() === articleId);
                    if (!article) return null;

                    return (
                      <div
                        key={articleId}
                        className="flex items-center gap-3 p-3 bg-sija-surface dark:bg-gray-900 border-2 border-sija-text/20 dark:border-gray-700"
                      >
                        <div className="w-8 h-8 bg-sija-primary border-2 border-sija-primary flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sija-text dark:text-white text-sm truncate">
                            {article.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 font-bold border ${article.type === 'public'
                              ? 'bg-green-100 text-green-900 border-green-500'
                              : 'bg-purple-100 text-purple-900 border-purple-500'
                              }`}>
                              {article.type === 'public' ? (
                                <><Globe className="w-2 h-2 inline mr-1" /> Public</>
                              ) : (
                                <><Lock className="w-2 h-2 inline mr-1" /> Course</>
                              )}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedArticles(prev => prev.filter(id => id !== articleId))}
                          className="p-2 bg-red-500 text-white border-2 border-red-700 shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                        >
                          <X className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-100 dark:bg-yellow-900/20 border-2 border-yellow-500 p-8 text-center">
                <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                <p className="font-bold text-yellow-900 dark:text-yellow-300 uppercase tracking-wider mb-2">
                  Belum ada artikel dipilih
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-400 font-medium">
                  Klik tombol di atas untuk memilih artikel
                </p>
              </div>
            )}
          </div>

          {/* XP & Difficulty Settings */}
          <div className="bg-sija-surface dark:bg-gray-900 border-2 border-sija-primary dark:border-white p-6 md:p-8 shadow-hard transition-colors">
            <h2 className="font-display text-2xl font-bold text-sija-text dark:text-white mb-6 uppercase flex items-center gap-3 border-b-2 border-dashed border-sija-text/10 dark:border-gray-700 pb-4">
              <div className="p-2 bg-yellow-500 border-2 border-yellow-700">
                <Star className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              XP & Difficulty Settings
            </h2>

            <div className="space-y-6">
              {/* Difficulty Selector */}
              <DifficultySelector
                value={difficulty}
                onChange={setDifficulty}
              />

              {/* Custom XP Override */}
              <div>
                <label className="block text-sm font-bold text-sija-text dark:text-white mb-2 uppercase tracking-wider">
                  Custom XP Reward (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={customXP || ''}
                  onChange={(e) => setCustomXP(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Kosongkan untuk menggunakan nilai otomatis"
                  className="w-full px-4 py-3 border-2 border-sija-primary dark:border-white bg-sija-surface dark:bg-gray-800 text-sija-text dark:text-white focus:outline-none focus:ring-2 focus:ring-sija-primary dark:focus:ring-yellow-400 font-medium transition-colors"
                />
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 font-medium">
                  💡 Kosongkan field ini untuk menggunakan perhitungan otomatis berdasarkan difficulty dan jumlah artikel
                </p>
              </div>

              {/* XP Preview */}
              <XPPreview
                difficulty={difficulty}
                articleCount={selectedArticles.length}
                customXP={customXP}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="bg-sija-surface dark:bg-gray-900 border-2 border-sija-primary dark:border-white p-6 md:p-8 shadow-hard transition-colors">
            <h2 className="font-display text-2xl font-bold text-sija-text dark:text-white mb-6 uppercase flex items-center gap-3 border-b-2 border-dashed border-sija-text/10 dark:border-gray-700 pb-4">
              <div className="p-2 bg-blue-500 border-2 border-blue-700">
                <Tag className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              Tags
            </h2>
            <TagInput
              tags={tags}
              onChange={setTags}
              placeholder="Tambah tags"
              maxTags={10}
            />
          </div>

          {/* Publish Settings */}
          <div className="bg-sija-surface dark:bg-gray-900 border-2 border-sija-primary dark:border-white p-6 md:p-8 shadow-hard transition-colors">
            <div className="flex items-start gap-4 p-4 bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-700">
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleChange}
                className="w-5 h-5 mt-0.5 border-2 border-sija-primary dark:border-white accent-sija-primary"
                id="published"
              />
              <label htmlFor="published" className="cursor-pointer flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                  <span className="font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                    Publish Course
                  </span>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-400 font-medium">
                  Course akan terlihat oleh publik
                </p>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
              loading={submitting}
              icon={<Save className="w-5 h-5" strokeWidth={2.5} />}
              className="flex-1"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
            <button
              type="button"
              onClick={() => router.push(`/courses/${slug}`)}
              disabled={submitting}
              className="px-8 py-4 border-2 border-sija-primary dark:border-white bg-sija-surface dark:bg-gray-800 text-sija-text dark:text-white font-bold shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" strokeWidth={2.5} />
              Batal
            </button>
          </div>

          {/* Danger Zone */}
          <div className="pt-8 border-t-2 border-dashed border-sija-text/10 dark:border-gray-700">
            <div className="bg-red-100 dark:bg-red-900/20 border-2 border-red-500 p-6 shadow-hard">
              <div className="flex items-start gap-4 mb-4">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <div>
                  <p className="font-bold text-red-900 dark:text-red-300 uppercase tracking-wider mb-1">
                    ⚠️ Danger Zone
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-400 font-medium">
                    Menghapus course akan menghapus semua data terkait. Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white border-2 border-red-700 font-bold shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 uppercase tracking-wider"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" strokeWidth={2.5} />
                    Hapus Course
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Article Selector Modal */}
      {showArticleSelector && (
        <ArticleSelector
          selectedArticles={selectedArticles}
          onSelectionChange={setSelectedArticles}
          onClose={() => setShowArticleSelector(false)}
        />
      )}
    </div>
  );
}