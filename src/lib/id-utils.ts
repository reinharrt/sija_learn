// ============================================
// src/lib/id-utils.ts
// ID Utilities - Normalize MongoDB ObjectId for comparison
// ============================================

/**
 * Normalize any ID format to string for safe comparison
 * Handles: ObjectId, string, {_id: ObjectId}, undefined, null
 */
export function normalizeId(id: any): string {
  if (!id) return '';
  
  // Already a string
  if (typeof id === 'string') return id;
  
  // Has _id property (MongoDB object)
  if (id._id) {
    return typeof id._id === 'string' ? id._id : id._id.toString();
  }
  
  // Has toString method (ObjectId)
  if (typeof id.toString === 'function') {
    return id.toString();
  }
  
  // Fallback to String()
  return String(id);
}

/**
 * Compare two IDs safely
 */
export function compareIds(id1: any, id2: any): boolean {
  return normalizeId(id1) === normalizeId(id2);
}

/**
 * Check if user is the author of an entity
 */
export function isAuthor(entityAuthorId: any, userId: any): boolean {
  return compareIds(entityAuthorId, userId);
}

/**
 * Check if ID exists in array of IDs
 */
export function idInArray(targetId: any, idArray: any[]): boolean {
  const normalizedTarget = normalizeId(targetId);
  return idArray.some(id => normalizeId(id) === normalizedTarget);
}

/**
 * Filter array to remove specific ID
 */
export function removeIdFromArray(idArray: any[], idToRemove: any): any[] {
  const normalizedRemove = normalizeId(idToRemove);
  return idArray.filter(id => normalizeId(id) !== normalizedRemove);
}

/**
 * Get unique IDs from array
 */
export function uniqueIds(idArray: any[]): string[] {
  const normalized = idArray.map(id => normalizeId(id));
  return Array.from(new Set(normalized)).filter(id => id !== '');
}

// Example usage:
// import { normalizeId, compareIds, isAuthor } from '@/lib/id-utils';
//
// // Compare author
// if (isAuthor(article.author, user.id)) { ... }
//
// // Check if article in course
// if (idInArray(article._id, course.articles)) { ... }
//
// // Normalize for API
// const articleId = normalizeId(article._id);