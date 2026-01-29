// ============================================
// src/components/article/ArticleCard.tsx
// Article Card Component - Neobrutalist Design (Responsive)
// ============================================

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types';
import { ArrowUpRight, Eye, Tag, User as UserIcon, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ArticleCardProps {
  article: Article & {
    author?: {
      _id?: any;
      name?: string;
    };
  };
}

export default function ArticleCard({ article }: ArticleCardProps) {
  // Extract text content from blocks for preview
  const getPreviewText = () => {
    if (!article.blocks || article.blocks.length === 0) return 'No content available';
    
    const textBlocks = article.blocks
      .filter(block => block.type === 'text' || block.type === 'heading')
      .slice(0, 2);
    
    return textBlocks.map(block => block.content).join(' ').substring(0, 150) + '...';
  };

  return (
    <Link href={`/articles/${article.slug}`} className="block h-full">
      <article className="group flex flex-col bg-sija-surface border-2 border-sija-primary hover:shadow-hard transition-all cursor-pointer h-full">
        {/* Image Section */}
        <div className="w-full h-48 sm:h-56 flex-shrink-0 relative overflow-hidden border-b-2 border-sija-primary">
          <div className="relative w-full h-full">
            <Image 
              src={article.banner || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"} 
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="absolute top-3 left-3 z-20">
            <span className="font-mono text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-sija-primary text-white border-2 border-sija-primary shadow-hard-sm">
              {article.category || 'Article'}
            </span>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="flex-grow p-4 sm:p-6 flex flex-col justify-between bg-sija-surface transition-colors duration-300">
          <div className="flex-grow">
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4 text-xs font-bold text-sija-text/60">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="flex-shrink-0" />
                <span className="whitespace-nowrap">{formatDate(article.createdAt || new Date())}</span>
              </div>
              {article.author && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <div className="flex items-center gap-1.5">
                    <UserIcon size={14} className="text-sija-primary flex-shrink-0" />
                    <span className="text-sija-primary truncate max-w-[150px]">
                      {article.author.name || 'Anonymous'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Title */}
            <h3 className="font-display text-xl sm:text-2xl font-bold text-sija-text group-hover:text-sija-primary transition-colors mb-2 sm:mb-3 leading-tight line-clamp-2">
              {article.title}
            </h3>

            {/* Description */}
            <p className="text-sm sm:text-base text-sija-text/70 font-medium leading-relaxed mb-3 sm:mb-4 line-clamp-3">
              {article.description || getPreviewText()}
            </p>

            {/* Tags Section */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                <Tag size={14} className="text-sija-primary flex-shrink-0" />
                {article.tags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index}
                    className="font-mono text-xs font-bold uppercase tracking-wider px-2 py-1 bg-sija-light text-sija-text border border-sija-text/20 hover:border-sija-primary hover:text-sija-primary transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 sm:pt-4 border-t-2 border-dashed border-sija-text/10 mt-auto">
            <div className="flex items-center gap-2 text-xs font-bold text-sija-text/60">
              <Eye size={16} className="flex-shrink-0" />
              <span className="whitespace-nowrap">{article.views || 0} views</span>
            </div>
            <div className="flex items-center gap-2 text-sija-primary font-bold text-sm group-hover:gap-3 transition-all whitespace-nowrap">
              <span className="hidden sm:inline">Read Article</span>
              <span className="sm:hidden">Read</span>
              <ArrowUpRight size={18} strokeWidth={2.5} className="flex-shrink-0" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}