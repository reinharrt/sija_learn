// ============================================
// src/components/course/EnhancedCourseCard.tsx
// Enhanced Course Card - WITH GAMIFICATION INFO
// ============================================

'use client';

import Link from 'next/link';
import { Book, Clock, Users, Trophy, CheckCircle2 } from 'lucide-react';
import XPRewardBadge from '../gamification/XPRewardBadge';
import { calculateCourseXP, getDifficultyDisplay, getDifficultyColor, estimateCourseTime } from '@/lib/xp-calculator';

interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  articles: any[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  enrolledCount?: number;
  xpReward?: number;
}

interface EnhancedCourseCardProps {
  course: Course;
  enrollment?: {
    completedArticles: string[];
    percentage: number;
  };
  showProgress?: boolean;
}

export default function EnhancedCourseCard({ 
  course, 
  enrollment,
  showProgress = false 
}: EnhancedCourseCardProps) {
  const articleCount = course.articles?.length || 0;
  const xpReward = course.xpReward || calculateCourseXP(course.difficulty, articleCount);
  const isCompleted = enrollment && enrollment.percentage === 100;

  return (
    <Link href={`/courses/${course.slug}`}>
      <div className="bg-sija-surface border-2 border-sija-primary shadow-hard hover:shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all group h-full flex flex-col">
        {/* Thumbnail */}
        {course.thumbnail ? (
          <div className="relative h-48 border-b-2 border-sija-primary overflow-hidden">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Completion Badge */}
            {isCompleted && (
              <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 border-2 border-white shadow-lg flex items-center gap-1 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                COMPLETED
              </div>
            )}
            
            {/* XP Badge */}
            <div className="absolute bottom-3 left-3">
              <XPRewardBadge xp={xpReward} size="md" />
            </div>
          </div>
        ) : (
          <div className="h-48 bg-sija-primary/10 border-b-2 border-sija-primary flex items-center justify-center">
            <Book className="w-16 h-16 text-sija-primary/40" />
          </div>
        )}

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Difficulty Badge */}
          {course.difficulty && (
            <div className="mb-3">
              <span className={`
                inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider border-2
                ${getDifficultyColor(course.difficulty)}
              `}>
                {getDifficultyDisplay(course.difficulty)}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="font-display text-xl font-black text-sija-text uppercase mb-2 group-hover:text-sija-primary transition-colors line-clamp-2">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-sija-text/70 text-sm mb-4 line-clamp-2 flex-1">
            {course.description}
          </p>

          {/* Meta Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-4 text-sm text-sija-text/60">
              <div className="flex items-center gap-1">
                <Book className="w-4 h-4" />
                <span className="font-medium">{articleCount} articles</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{estimateCourseTime(articleCount, course.difficulty)}</span>
              </div>
              
              {course.enrolledCount !== undefined && course.enrolledCount > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{course.enrolledCount}</span>
                </div>
              )}
            </div>

            {/* Progress Bar (if enrolled) */}
            {showProgress && enrollment && (
              <div className="mt-3 pt-3 border-t-2 border-sija-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-sija-text uppercase tracking-wider">
                    Progress
                  </span>
                  <span className="text-xs font-mono font-bold text-sija-primary">
                    {enrollment.percentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-sija-surface border-2 border-sija-primary">
                  <div
                    className="h-full bg-sija-primary transition-all duration-500"
                    style={{ width: `${enrollment.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-sija-text/60 mt-1">
                  {enrollment.completedArticles.length} of {articleCount} articles completed
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}