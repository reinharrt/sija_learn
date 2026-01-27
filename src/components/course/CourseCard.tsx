// ============================================
// src/components/course/CourseCard.tsx
// Course Card Component - Course preview card
// ============================================

'use client';

import Link from 'next/link';
import { Course } from '@/types';
import { formatDate } from '@/lib/utils';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link 
      href={`/courses/${course.slug}`}
      className="block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
    >
      {course.thumbnail && (
        <img 
          src={course.thumbnail} 
          alt={course.title}
          className="w-full h-48 object-cover"
        />
      )}
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 mb-2">
          {course.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {course.description}
        </p>

        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{course.articles?.length || 0} artikel</span>
          <span>{course.enrolledCount || 0} enrolled</span>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          {formatDate(course.createdAt)}
        </div>
      </div>
    </Link>
  );
}
