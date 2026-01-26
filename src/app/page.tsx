'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ArticleCard from '@/components/article/ArticleCard';
import CourseCard from '@/components/course/CourseCard';
import { Article, Course } from '@/types';

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/articles?published=true&limit=6').then(r => r.json()),
      fetch('/api/courses?published=true&limit=4').then(r => r.json()),
    ])
      .then(([articlesData, coursesData]) => {
        setArticles(articlesData.articles || []);
        setCourses(coursesData.courses || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="text-center mb-16 py-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          SIJA Learn
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Platform repositori materi digital dan pusat informasi untuk siswa jurusan 
          Sistem Informatika, Jaringan dan Aplikasi
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/articles"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Jelajahi Artikel
          </Link>
          <Link 
            href="/courses"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Lihat Course
          </Link>
        </div>
      </section>

      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Artikel Terbaru
          </h2>
          <Link 
            href="/articles"
            className="text-blue-600 hover:text-blue-800"
          >
            Lihat Semua →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Belum ada artikel
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article._id?.toString()} article={article} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Course Populer
          </h2>
          <Link 
            href="/courses"
            className="text-blue-600 hover:text-blue-800"
          >
            Lihat Semua →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Belum ada course
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard key={course._id?.toString()} course={course} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-16 bg-blue-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Kategori Artikel
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            href="/articles?category=pelajaran"
            className="bg-white px-6 py-3 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            Pelajaran
          </Link>
          <Link 
            href="/articles?category=tech"
            className="bg-white px-6 py-3 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            Tech
          </Link>
          <Link 
            href="/articles?category=tutorial"
            className="bg-white px-6 py-3 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            Tutorial
          </Link>
        </div>
      </section>
    </div>
  );
}
