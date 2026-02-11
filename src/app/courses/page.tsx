

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CourseCard from '@/components/course/CourseCard';
import PageHeader from '@/components/common/PageHeader';
import TagFilter, { FilterItem } from '@/components/common/TagFilter';
import { Course } from '@/types';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Search as SearchIcon,
} from 'lucide-react';

interface TagData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
}

function CoursesContent() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [allTags, setAllTags] = useState<TagData[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tagsLoading, setTagsLoading] = useState(true);
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
    setTagsLoading(true);
    try {
      const res = await fetch('/api/tags?type=courses');
      const data = await res.json();
      setAllTags(Array.isArray(data.tags) ? data.tags : []);
    } catch (error) {
      console.error('Load tags error:', error);
      setAllTags([]);
    } finally {
      setTagsLoading(false);
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


  const tagFilterItems: FilterItem[] = [
    { value: null, label: 'All Courses' },
    ...allTags.map((tag) => ({
      value: tag.slug,
      label: tag.name,
    })),
  ];

  const handleTagChange = (value: string | null) => {
    setSelectedTag(value);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Curriculum"
        subtitle="Jelajahi course pembelajaran terstruktur. Industry-standard modules designed to build real-world engineering skills."
        icon={BookOpen}
      />
      <TagFilter
        title="Filter by Tags"
        items={tagFilterItems}
        selectedValue={selectedTag}
        onChange={handleTagChange}
        loading={tagsLoading}
        emptyMessage="Belum ada tags tersedia. Tags akan muncul setelah course dengan tags dibuat."
      />
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-sija-primary border-t-transparent"></div>
          <p className="text-sija-text font-bold uppercase tracking-wider mt-4">
            Loading Courses...
          </p>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-sija-surface border-2 border-sija-primary p-12 text-center shadow-hard">
          <div className="w-24 h-24 bg-sija-light border-2 border-sija-primary mx-auto mb-6 flex items-center justify-center">
            <SearchIcon className="w-12 h-12 text-sija-primary" />
          </div>
          <p className="text-sija-text font-bold text-xl mb-4 uppercase tracking-wide">
            No Courses Found
          </p>
          <p className="text-sija-text/60 font-medium mb-6">
            {selectedTag
              ? `Tidak ada course dengan tag "${allTags.find((t) => t.slug === selectedTag)?.name || selectedTag}"`
              : 'Tidak ada course ditemukan'}
          </p>
          {selectedTag && (
            <button
              onClick={() => handleTagChange(null)}
              className="px-6 py-3 bg-sija-primary text-white font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider"
            >
              View All Courses
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {courses.map((course) => (
              <CourseCard key={course._id?.toString()} course={course as any} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-6 py-3 bg-sija-primary text-white font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-hard disabled:hover:translate-x-0 disabled:hover:translate-y-0 flex items-center gap-2 uppercase tracking-wider"
              >
                <ChevronLeft className="w-5 h-5" />
                Prev
              </button>

              <div className="bg-sija-surface border-2 border-sija-primary px-6 py-3 shadow-hard-sm">
                <span className="font-bold text-sija-text uppercase tracking-wider">
                  Page{' '}
                  <span className="text-sija-primary font-black">{page}</span> of{' '}
                  <span className="text-sija-primary font-black">
                    {totalPages}
                  </span>
                </span>
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-6 py-3 bg-sija-primary text-white font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-hard disabled:hover:translate-x-0 disabled:hover:translate-y-0 flex items-center gap-2 uppercase tracking-wider"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-sija-primary border-t-transparent"></div>
          <p className="text-sija-text font-bold uppercase tracking-wider mt-4">
            Loading Courses...
          </p>
        </div>
      }
    >
      <CoursesContent />
    </Suspense>
  );
}