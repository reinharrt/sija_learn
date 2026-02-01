// ============================================
// src/app/page.tsx
// Home Page - Neobrutalist Landing Page
// ============================================

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ArticleCard from '@/components/article/ArticleCard';
import CourseCard from '@/components/course/CourseCard';
import { Article, Course } from '@/types';
import { ArrowRight, MousePointer2, Box, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen">
      {/* Hero Section - Adjusted spacing */}
      <section className="relative -mt-4 pt-12 pb-16 md:pt-20 md:pb-24 px-6 overflow-hidden border-b-2 border-sija-primary bg-sija-surface transition-colors duration-300">
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="inline-block bg-sija-light border-2 border-sija-primary px-4 py-2 mb-6 shadow-hard-sm">
              <span className="font-display font-bold text-sija-primary uppercase tracking-wider text-sm">
                Open Registration • Gen. 14
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black text-sija-primary leading-[0.9] mb-6">
              CREATE <br />
              <span className="text-outline-blue">CONNECT</span> <br />
              COMPILE
            </h1>
            <p className="max-w-xl text-base md:text-lg text-sija-text font-medium mb-8 leading-relaxed border-l-4 border-sija-primary pl-6">
              The digital HQ for <span className="font-bold text-sija-primary">SIJA SMKN 1 Cimahi</span>.
              Where code meets creativity and students become engineers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/courses" className="flex items-center justify-center gap-2 px-8 py-4 bg-sija-primary text-white font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all uppercase tracking-wider text-sm">
                Start Learning
                <ArrowRight size={20} strokeWidth={3} />
              </Link>
              <Link href="/articles" className="flex items-center justify-center gap-2 px-8 py-4 bg-sija-surface text-sija-primary font-bold border-2 border-sija-primary shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider text-sm">
                Explore Articles
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative hidden lg:block h-full min-h-[400px]">
            <div className="absolute inset-0 bg-sija-light border-2 border-sija-primary shadow-hard flex items-center justify-center overflow-hidden transition-colors duration-300">
              <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-sija-primary"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-sija-primary"></div>
              <div className="text-center p-8">
                <div className="text-9xl font-black text-sija-primary/10 dark:text-sija-primary/20 select-none transition-colors duration-300">SIJA</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-sija-surface border-2 border-sija-primary p-6 shadow-hard rotate-3 hover:rotate-0 transition-transform duration-300">
                    <MousePointer2 size={48} className="text-sija-primary mx-auto mb-2" />
                    <div className="font-display font-bold text-xl text-sija-text">Interactive<br />Learning</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section - Adjusted spacing */}
      <section className="py-16 md:py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b-2 border-sija-text/10 pb-6">
            <div className="relative">
              <div className="absolute -left-6 top-1 w-2 h-full bg-sija-primary"></div>
              <h2 className="font-display text-3xl md:text-4xl font-black text-sija-text mb-2 uppercase">
                Curriculum
              </h2>
              <p className="text-base md:text-lg text-sija-text/60 font-medium max-w-lg">
                Industry-standard modules designed to build real-world engineering skills.
              </p>
            </div>
            <Link href="/courses" className="group flex items-center gap-2 px-6 py-3 border-2 border-sija-text font-bold text-sija-text hover:bg-sija-text hover:text-sija-surface transition-all uppercase tracking-wider text-sm">
              View All <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-sija-primary mx-auto mb-3" />
              <p className="text-sija-text font-bold uppercase tracking-wider">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 bg-sija-surface border-2 border-sija-primary">
              <p className="text-sija-text font-bold uppercase tracking-wider">Belum ada course</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map((course) => (
                <CourseCard key={course._id?.toString()} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Articles Section - Adjusted spacing */}
      <section className="py-16 md:py-20 px-6 bg-sija-surface border-y-2 border-sija-primary transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between mb-10 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-3 text-sija-primary">
                <Box size={20} strokeWidth={2.5} />
                <span className="font-mono font-bold uppercase tracking-wider text-sm">Knowledge Base</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-black text-sija-text uppercase">
                Latest Insights
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-sija-primary mx-auto mb-3" />
              <p className="text-sija-text font-bold uppercase tracking-wider">Loading articles...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12 bg-sija-light border-2 border-sija-primary">
              <p className="text-sija-text font-bold uppercase tracking-wider">Belum ada artikel</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {articles.slice(0, 3).map((article) => (
                <ArticleCard key={article._id?.toString()} article={article} />
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link href="/articles" className="inline-flex items-center gap-2 font-display text-lg font-bold text-sija-text border-b-4 border-sija-primary hover:text-sija-primary transition-colors pb-1 uppercase tracking-wider">
              View Archive <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - Adjusted spacing */}
      <section className="py-16 md:py-20 px-6 bg-sija-primary text-white">
        <div className="max-w-5xl mx-auto text-center border-2 border-white/20 p-8 md:p-12 bg-sija-primary relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <h2 className="relative font-display text-3xl md:text-5xl font-black mb-6 leading-tight uppercase">
            Ready to Debug <br /> Your Future?
          </h2>
          <p className="relative text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto font-medium">
            Join the SIJA SMKN 1 Cimahi ecosystem. Access resources, connect with alumni, and ship code.
          </p>
          <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-8 py-4 bg-white text-sija-primary font-bold text-base border-2 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider">
              Apply for Access
            </Link>
            <Link href="/login" className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold text-base hover:bg-white/10 transition-colors uppercase tracking-wider">
              Student Portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}