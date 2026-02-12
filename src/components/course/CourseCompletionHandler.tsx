// src/components/course/CourseCompletionHandler.tsx

'use client';

import { useEffect, useState } from 'react';
import { useGamificationContext } from '@/contexts/GamificationContext';

interface CourseCompletionHandlerProps {
  courseId: string;
  totalArticles: number;
  completedArticles: string[];
  isEnrolled: boolean;
  isCreator: boolean;
}

export default function CourseCompletionHandler({
  courseId,
  totalArticles,
  completedArticles,
  isEnrolled,
  isCreator
}: CourseCompletionHandlerProps) {
  const { completeCourse } = useGamificationContext();
  const [hasCompletedCourse, setHasCompletedCourse] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Only process if:
    // 1. User is enrolled (not creator)
    // 2. All articles are completed
    // 3. Haven't processed completion yet
    // 4. Not currently processing
    if (
      isEnrolled &&
      !isCreator &&
      totalArticles > 0 &&
      completedArticles.length === totalArticles &&
      !hasCompletedCourse &&
      !isProcessing
    ) {
      handleCourseCompletion();
    }
  }, [completedArticles.length, totalArticles, isEnrolled, isCreator]);

  const handleCourseCompletion = async () => {
    setIsProcessing(true);

    try {
      const result = await completeCourse(courseId);

      if (result) {
        setHasCompletedCourse(true);
        console.log('Course completed! XP awarded:', result.xpGained);
      }
    } catch (error: any) {
      // Check if error is due to quiz requirements
      if (error.message && error.message.includes('quiz')) {
        console.log('Quiz requirements not met:', error.message);
        // Don't show error to user here, they'll see it in their progress
      } else {
        console.error('Failed to process course completion:', error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // This component doesn't render anything
  return null;
}