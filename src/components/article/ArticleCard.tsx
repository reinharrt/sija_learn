// ============================================
// src/components/article/ArticleCard.tsx
// Article Card Component - Article preview card
// ============================================

'use client';

import Link from 'next/link';
import { Article } from '@/types';
import { formatDate } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link 
      href={`/articles/${article.slug}`}
      className="block border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
          {article.title}
        </h3>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {article.category}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {article.description}
      </p>

      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {article.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{formatDate(article.createdAt)}</span>
        <span>{article.views || 0} views</span>
      </div>
    </Link>
  );
}
