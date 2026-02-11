// ============================================
// src/components/article/ArticleCard.tsx
// Article Card - Neobrutalist Design
// ============================================

'use client';

import Link from 'next/link';
import { Article } from '@/types';
import { getImageUrl } from '@/lib/image-utils';
import { Calendar, ArrowRight, FileText, Clock } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  // Format date
  const date = new Date(article.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <Link href={`/articles/${article.slug}`} className="group h-full block">
      <div className="bg-sija-surface border-2 border-sija-primary shadow-hard hover:shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all h-full flex flex-col">
        {/* Banner Image */}
        <div className="relative h-48 border-b-2 border-sija-primary overflow-hidden bg-sija-light">
          {article.banner ? (
            <img
              src={getImageUrl(article.banner)}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-sija-primary/5 pattern-grid-lg">
              <FileText className="w-16 h-16 text-sija-primary/20" />
            </div>
          )}

          {/* Category Badge */}
          {article.category && (
            <div className="absolute top-3 left-3">
              <span className="inline-block px-3 py-1 bg-sija-primary text-white text-xs font-bold uppercase tracking-wider border-2 border-white shadow-md">
                {article.category}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="font-display text-xl font-black text-sija-text uppercase mb-3 leading-tight group-hover:text-sija-primary transition-colors line-clamp-2">
            {article.title}
          </h3>

          <p className="text-sija-text/70 text-sm mb-4 line-clamp-3 flex-1 font-medium">
            {article.description}
          </p>

          <div className="flex items-center justify-between mt-auto pt-4 border-t-2 border-sija-text/10">
            <div className="flex items-center gap-2 text-xs font-bold text-sija-text/50 uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>{date}</span>
            </div>

            <div className="px-3 py-1 flex items-center gap-2 bg-sija-background border-2 border-sija-text text-sija-text text-xs font-bold uppercase tracking-wider group-hover:bg-sija-primary group-hover:border-sija-primary group-hover:text-white transition-all">
              Read
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}