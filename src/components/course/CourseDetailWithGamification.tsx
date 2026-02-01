// ============================================
// src/components/course/CourseDetailWithGamification.tsx
// Course Detail - EXAMPLE integration dengan gamification
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGamificationContext } from '@/contexts/GamificationContext';
import CourseCompletionHandler from './CourseCompletionHandler';
import UserProgressCard from '../gamification/UserProgressCard';
import { CheckCircle2, Circle, Book, Clock, Trophy } from 'lucide-react';

interface CourseDetailProps {
  course: {
    _id: string;
    title: string;
    description: string;
    thumbnail?: string;
    articles: any[];
    creator: { _id: string; name: string };
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    xpReward?: number;
  };
}

export default function CourseDetailWithGamification({ course }: CourseDetailProps) {
  const { user } = useAuth();
  const { progress } = useGamificationContext();
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isCreator = user?.id === course.creator._id;
  const isEnrolled = !!enrollment && !isCreator;

  useEffect(() => {
    if (user && !isCreator) {
      loadEnrollment();
    } else {
      setLoading(false);
    }
  }, [user, course._id]);

  const loadEnrollment = async () => {
    try {
      const response = await fetch(`/api/enrollments/${course._id}`);
      if (response.ok) {
        const data = await response.json();
        setEnrollment(data.progress);
      }
    } catch (error) {
      console.error('Failed to load enrollment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course._id })
      });

      if (response.ok) {
        await loadEnrollment();
      }
    } catch (error) {
      console.error('Failed to enroll:', error);
    }
  };

  const completedArticles = enrollment?.completedArticles || [];
  const progressPercentage = course.articles.length > 0
    ? Math.round((completedArticles.length / course.articles.length) * 100)
    : 0;

  // Calculate XP reward based on difficulty
  const getXPReward = () => {
    if (course.xpReward) return course.xpReward;
    const baseXP = {
      beginner: 50,
      intermediate: 100,
      advanced: 200
    };
    return baseXP[course.difficulty || 'beginner'] + (course.articles.length * 10);
  };

  return (
    <div className="min-h-screen bg-sija-light py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header */}
            <div className="bg-sija-surface border-2 border-sija-primary shadow-hard p-8">
              {course.thumbnail && (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover border-2 border-sija-primary mb-6"
                />
              )}

              <h1 className="font-display text-4xl font-black text-sija-text uppercase mb-4">
                {course.title}
              </h1>

              <p className="text-sija-text/70 mb-6">{course.description}</p>

              {/* Course Meta */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Book className="w-5 h-5 text-sija-primary" />
                  <span className="text-sm font-medium">
                    {course.articles.length} Articles
                  </span>
                </div>

                {course.difficulty && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-sija-primary" />
                    <span className="text-sm font-medium capitalize">
                      {course.difficulty}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-bold text-amber-700">
                    +{getXPReward()} XP
                  </span>
                </div>
              </div>

              {/* Enrollment Status */}
              {!isCreator && user && (
                <>
                  {!isEnrolled ? (
                    <button
                      onClick={handleEnroll}
                      disabled={loading}
                      className="w-full px-6 py-3 bg-sija-primary text-white font-bold border-2 border-sija-primary shadow-hard hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all uppercase tracking-wider disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Enroll in Course'}
                    </button>
                  ) : (
                    <div className="bg-sija-primary/10 border-2 border-sija-primary p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sija-text">Course Progress</span>
                        <span className="font-mono font-bold text-sija-primary">
                          {progressPercentage}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-sija-surface border-2 border-sija-primary">
                        <div
                          className="h-full bg-sija-primary transition-all duration-500"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Article List */}
            <div className="bg-sija-surface border-2 border-sija-primary shadow-hard p-6">
              <h2 className="font-display text-2xl font-black text-sija-text uppercase mb-4">
                Course Content
              </h2>

              <div className="space-y-2">
                {course.articles.map((article: any, index: number) => {
                  const isCompleted = completedArticles.some(
                    (id: any) => id.toString() === article._id.toString()
                  );

                  return (
                    <div
                      key={article._id}
                      className="flex items-center gap-3 p-4 border-2 border-sija-primary bg-sija-light hover:shadow-hard-sm transition-all"
                    >
                      {isEnrolled && (
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          ) : (
                            <Circle className="w-6 h-6 text-sija-text/30" />
                          )}
                        </div>
                      )}

                      <div className="flex-1">
                        <p className="font-bold text-sija-text">
                          {index + 1}. {article.title}
                        </p>
                        {article.description && (
                          <p className="text-sm text-sija-text/60 mt-1">
                            {article.description}
                          </p>
                        )}
                      </div>

                      <a
                        href={`/articles/${article.slug}`}
                        className="px-4 py-2 border-2 border-sija-primary bg-sija-surface font-bold text-sm hover:bg-sija-primary hover:text-white transition-colors"
                      >
                        Read
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Progress */}
            {user && progress && (
              <UserProgressCard showDetailLink={true} />
            )}

            {/* Course Creator */}
            <div className="bg-sija-surface border-2 border-sija-primary shadow-hard p-6">
              <h3 className="font-display text-xl font-black text-sija-text uppercase mb-4">
                Course Creator
              </h3>
              <p className="font-bold text-sija-text">{course.creator.name}</p>
            </div>
          </div>
        </div>

        {/* Course Completion Handler */}
        {user && isEnrolled && (
          <CourseCompletionHandler
            courseId={course._id}
            totalArticles={course.articles.length}
            completedArticles={completedArticles}
            isEnrolled={isEnrolled}
            isCreator={isCreator}
          />
        )}
      </div>
    </div>
  );
}