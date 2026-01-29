// ============================================
// src/app/courses/page.tsx
// Courses List Page - Neobrutalist Design with Tag Filtering
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CourseCard from '@/components/course/CourseCard';
import { Course } from '@/types';
import { 
  BookOpen, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Search as SearchIcon,
  X
} from 'lucide-react';

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [allTags, setAllTags] = useState<{ tag: string; count: number }[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const search = searchParams.get('search');

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    loadCourses();
  }, [search, page, selectedTag]);

  const loadTags = async () => {
    try {
      const res = await fetch('/api/tags?type=courses');
      const data = await res.json();
      if (data.tags) {
        setAllTags(data.tags);
      }
    } catch (error) {
      console.error('Load tags error:', error);
    }
  };

  const loadCourses = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('published', 'true');
    params.append('page', page.toString());
    if (search) params.append('search', search);
    if (selectedTag) params.append('tag', selectedTag);

    try {
      const res = await fetch(`/api/courses?${params}`);
      const data = await res.json();
      setCourses(data.courses || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Load courses error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
      setPage(1);
    }
  };

  return (
    <div className="min-h-screen bg-sija-light transition-colors duration-300">
      {/* Hero Section - Fixed Spacing */}
      <section className="relative pt-8 pb-12 px-6 border-b-2 border-sija-primary bg-sija-surface">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-6 mb-6">
            <div className="bg-sija-primary p-4 border-2 border-sija-primary shadow-hard">
              <BookOpen size={32} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-black text-sija-primary mb-3 leading-none uppercase">
                Curriculum
              </h1>
              <p className="text-base md:text-lg text-sija-text font-medium max-w-2xl border-l-4 border-sija-primary pl-4">
                Jelajahi course pembelajaran terstruktur. Industry-standard modules designed to build real-world engineering skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Tags Filter - Neobrutalist Style */}
        {allTags.length > 0 && (
          <div className="mb-12 bg-sija-surface border-2 border-sija-primary p-6 md:p-8 shadow-hard">
            <div className="flex items-center gap-3 mb-6">
              <Filter size={24} className="text-sija-primary" strokeWidth={2.5} />
              <h2 className="font-display text-xl md:text-2xl font-bold text-sija-text uppercase">
                Filter by Tags
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                key="all-courses-btn"
                onClick={() => setSelectedTag(null)}
                className={`px-4 md:px-5 py-2.5 font-bold text-xs md:text-sm uppercase tracking-wider border-2 transition-all ${
                  selectedTag === null
                    ? 'bg-sija-primary text-white border-sija-primary shadow-hard'
                    : 'bg-sija-surface text-sija-text border-sija-text/30 hover:border-sija-primary hover:translate-x-[2px] hover:translate-y-[2px]'
                }`}
              >
                All Courses
              </button>
              {allTags
                .filter(({ tag }) => tag && tag.trim() !== '')
                .slice(0, 20)
                .map(({ tag, count }) => (
                <button
                  key={`tag-filter-${tag}`}
                  onClick={() => handleTagClick(tag)}
                  className={`px-4 md:px-5 py-2.5 font-bold text-xs md:text-sm uppercase tracking-wider border-2 transition-all ${
                    selectedTag === tag
                      ? 'bg-sija-primary text-white border-sija-primary shadow-hard'
                      : 'bg-sija-surface text-sija-text border-sija-text/30 hover:border-sija-primary hover:translate-x-[2px] hover:translate-y-[2px]'
                  }`}
                >
                  {tag} ({count})
                </button>
              ))}
            </div>
            {selectedTag && (
              <div className="mt-6 pt-6 border-t-2 border-dashed border-sija-text/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-sm font-bold text-sija-text">
                  Showing courses tagged with: <span className="text-sija-primary">{selectedTag}</span>
                </p>
                <button
                  onClick={() => setSelectedTag(null)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-500 border-2 border-red-600 shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider"
                >
                  <X size={16} />
                  Clear Filter
                </button>
              </div>
            )}
          </div>
        )}

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-24">
            <div className="inline-block bg-sija-surface border-2 border-sija-primary p-8 shadow-hard">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-sija-primary border-t-transparent mx-auto mb-4"></div>
              <p className="font-bold text-sija-text uppercase tracking-wider">Loading courses...</p>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-block bg-sija-surface border-2 border-sija-primary p-12 shadow-hard max-w-md">
              <div className="w-20 h-20 bg-sija-light border-2 border-sija-primary mx-auto mb-6 flex items-center justify-center">
                <SearchIcon size={40} className="text-sija-primary" />
              </div>
              <h3 className="font-display text-2xl font-bold text-sija-primary mb-3 uppercase">
                No Courses Found
              </h3>
              <p className="text-sija-text font-medium mb-6">
                {selectedTag 
                  ? `Tidak ada course dengan tag "${selectedTag}"`
                  : 'Tidak ada course ditemukan'
                }
              </p>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="px-6 py-3 bg-sija-primary text-white font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider"
                >
                  View All Courses
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {courses.map((course) => (
                <div key={course._id?.toString()}>
                  <CourseCard course={course} />
                </div>
              ))}
            </div>

            {/* Pagination - Neobrutalist Style */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 md:gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 md:px-6 py-3 bg-sija-surface text-sija-text font-bold border-2 border-sija-primary shadow-hard disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:hover:shadow-hard disabled:hover:translate-x-0 disabled:hover:translate-y-0 flex items-center gap-2 uppercase tracking-wider text-sm"
                >
                  <ChevronLeft size={18} />
                  <span className="hidden sm:inline">Prev</span>
                </button>
                <div className="px-4 md:px-6 py-3 bg-sija-primary text-white font-bold border-2 border-sija-primary text-sm md:text-base">
                  Page {page} of {totalPages}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 md:px-6 py-3 bg-sija-surface text-sija-text font-bold border-2 border-sija-primary shadow-hard disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:hover:shadow-hard disabled:hover:translate-x-0 disabled:hover:translate-y-0 flex items-center gap-2 uppercase tracking-wider text-sm"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}