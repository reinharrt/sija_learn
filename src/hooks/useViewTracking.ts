// ============================================
// src/hooks/useViewTracking.ts
// Custom Hook - Track article/course views with anti-spam
// ============================================

import { useEffect, useRef } from 'react';

interface ViewTrackingOptions {
  entityType: 'article' | 'course';
  entityId: string;
  cooldownMinutes?: number; // Default: 60 minutes
}

export function useViewTracking({ 
  entityType, 
  entityId, 
  cooldownMinutes = 60 
}: ViewTrackingOptions) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once per mount
    if (hasTracked.current) return;

    const trackView = async () => {
      const viewKey = `viewed-${entityType}-${entityId}`;
      
      // Check if recently viewed
      if (checkRecentView(viewKey, cooldownMinutes)) {
        return; // Don't track again
      }

      // Mark as viewed
      markAsViewed(viewKey);
      hasTracked.current = true;
    };

    trackView();
  }, [entityType, entityId, cooldownMinutes]);

  return null;
}

// Check if entity was viewed recently
function checkRecentView(key: string, cooldownMinutes: number): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const viewData = localStorage.getItem(key);
    if (!viewData) return false;

    const { timestamp } = JSON.parse(viewData);
    const cooldownMs = cooldownMinutes * 60 * 1000;
    const expiryTime = Date.now() - cooldownMs;
    
    return timestamp > expiryTime;
  } catch {
    return false;
  }
}

// Mark entity as viewed
function markAsViewed(key: string): void {
  if (typeof window === 'undefined') return;
  
  const viewData = {
    timestamp: Date.now(),
  };
  
  try {
    localStorage.setItem(key, JSON.stringify(viewData));
  } catch (error) {
    console.error('Failed to mark as viewed:', error);
  }
}

// Export utility functions for manual use
export const viewTrackingUtils = {
  checkRecentView,
  markAsViewed,
  clearViewHistory: () => {
    if (typeof window === 'undefined') return;
    
    // Clear all view tracking data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('viewed-')) {
        localStorage.removeItem(key);
      }
    });
  },
};