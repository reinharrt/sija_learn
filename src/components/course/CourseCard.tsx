// ============================================
// src/components/course/CourseCard.tsx
// Course Card Component - Neobrutalist Design (Fixed)
// ============================================

'use client';

import Link from 'next/link';
import { Course } from '@/types';
import { Clock, User, BookOpen, Users, Tag } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface CourseCardProps {
  course: Course & {
    creator?: {
      _id?: any;
      name?: string;
    };
  };
  progress?: {
    percentage: number;
    completed: number;
    total: number;
  };
  showProgress?: boolean;
}

export default function CourseCard({ course, progress, showProgress = false }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.slug}`}>
      <div className="group relative bg-sija-surface border-2 border-sija-primary p-0 h-full flex flex-col hover:-translate-y-2 transition-transform duration-300">
        <div className="absolute inset-0 bg-sija-primary translate-x-2 translate-y-2 -z-10 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform"></div>
        
        {/* Thumbnail - Fixed Cropping Issue */}
        {course.thumbnail && (
          <div className="relative w-full border-b-2 border-sija-primary bg-sija-light overflow-hidden">
            <div className="relative w-full pt-[56.25%]">
              <img 
                src={course.thumbnail} 
                alt={course.title}
                className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            {/* Progress Badge */}
            {showProgress && progress && (
              <div className="absolute top-3 right-3 z-20 bg-white border-2 border-sija-primary px-3 py-1.5 shadow-hard-sm">
                <span className="text-sm font-bold text-sija-primary">
                  {progress.percentage}%
                </span>
              </div>
            )}
          </div>
        )}
        
        <div className="p-6 flex flex-col flex-grow bg-sija-surface z-10 transition-colors duration-300">
          {/* Tags Section */}
          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Tag size={14} className="text-sija-primary flex-shrink-0" />
              {course.tags.slice(0, 2).map((tag, index) => (
                <span 
                  key={`course-tag-${course._id}-${tag}-${index}`}
                  className="font-mono text-xs font-bold uppercase tracking-wider px-2 py-1 bg-sija-light text-sija-primary border border-sija-primary"
                >
                  {tag}
                </span>
              ))}
              {course.tags.length > 2 && (
                <span className="font-mono text-xs font-bold text-sija-text/60">
                  +{course.tags.length - 2}
                </span>
              )}
            </div>
          )}
          
          <h3 className="font-display text-2xl font-bold text-sija-primary mb-3 leading-tight group-hover:text-sija-dark transition-colors">
            {course.title}
          </h3>
          
          <p className="text-sija-text/80 text-sm mb-4 flex-grow font-medium leading-relaxed line-clamp-3">
            {course.description}
          </p>

          {/* Progress Bar for enrolled courses */}
          {showProgress && progress && (
            <div className="mb-4 pb-4 border-b-2 border-dashed border-sija-text/10">
              <div className="w-full bg-sija-light border-2 border-sija-primary h-4 relative overflow-hidden">
                <div
                  className="bg-sija-primary h-full transition-all duration-500 flex items-center justify-center"
                  style={{ width: `${progress.percentage}%` }}
                >
                  {progress.percentage > 20 && (
                    <span className="text-[10px] font-bold text-white">
                      {progress.percentage}%
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs font-bold text-sija-text/70 mt-2">
                {progress.completed}/{progress.total} modules completed
              </p>
            </div>
          )}

          {/* Course Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-sija-text/70">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-sija-primary" />
                <span>Modules</span>
              </div>
              <span className="text-sija-text">{course.articles?.length || 0}</span>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-sija-text/70">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-sija-primary" />
                <span>Students</span>
              </div>
              <span className="text-sija-text">{course.enrolledCount || 0}</span>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-sija-text/70 pt-3 border-t-2 border-dashed border-sija-text/10">
              <div className="flex items-center gap-2">
                <User size={16} className="text-sija-primary" />
                <span>Instructor</span>
              </div>
              <span className="text-sija-text truncate max-w-[150px]" title={course.creator?.name || 'Unknown'}>
                {course.creator?.name || 'Unknown'}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t-2 border-dashed border-sija-text/10">
            <div className="flex items-center gap-2 text-xs font-bold text-sija-text/60">
              <Clock size={14} />
              <span>{formatDate(course.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}