'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CourseDetail from '@/components/course/CourseDetail';
import { Course, Article } from '@/types';

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/courses/${slug}`)
      .then(res => res.json())
      .then(async (courseData) => {
        setCourse(courseData);
        
        if (courseData.articles && courseData.articles.length > 0) {
          const articlesPromises = courseData.articles.map((articleId: any) =>
            fetch(`/api/articles/${articleId}`).then(r => r.json())
          );
          const articlesData = await Promise.all(articlesPromises);
          setArticles(articlesData.filter(a => a._id));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        Loading...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        Course tidak ditemukan
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CourseDetail course={course} articles={articles} />
    </div>
  );
}
