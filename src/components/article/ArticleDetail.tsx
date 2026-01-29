// ============================================
// src/components/article/ArticleDetail.tsx
// Article Detail Component - NEOBRUTALIST STYLE
// ============================================

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Article, BlockType } from '@/types';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Eye, Tag, Calendar, Edit } from 'lucide-react';

interface ArticleDetailProps {
  article: Article;
}

export default function ArticleDetail({ article }: ArticleDetailProps) {
  const { user } = useAuth();

  // 🔥 FIX: Normalize IDs for comparison
  const normalizeId = (id: any): string => {
    if (!id) return '';
    if (typeof id === 'string') return id;
    if (id._id) return id._id.toString();
    if (id.toString) return id.toString();
    return String(id);
  };

  // Check if user can edit
  const canEdit = user && (
    normalizeId(article.author) === normalizeId(user.id) || 
    user.role === UserRole.ADMIN
  );

  const renderBlock = (block: any) => {
    switch (block.type) {
      case BlockType.TEXT:
        return (
          <p className="text-sija-text leading-relaxed mb-4 font-medium">
            {block.content}
          </p>
        );

      case BlockType.HEADING: {
        const level = block.metadata?.level || 2;
        const content = block.content;
        
        // Render heading based on level with neobrutalist style
        switch (level) {
          case 1:
            return <h1 className="font-display text-4xl font-black text-sija-primary mb-6 uppercase border-l-4 border-sija-primary pl-4">{content}</h1>;
          case 2:
            return <h2 className="font-display text-3xl font-black text-sija-text mb-4 uppercase">{content}</h2>;
          case 3:
            return <h3 className="font-display text-2xl font-bold text-sija-text mb-3 uppercase">{content}</h3>;
          default:
            return <h4 className="font-display text-xl font-bold text-sija-text mb-2">{content}</h4>;
        }
      }

      case BlockType.IMAGE:
        return (
          <div className="my-6 border-4 border-sija-primary shadow-hard overflow-hidden">
            <img 
              src={block.content} 
              alt={block.metadata?.alt || 'Image'}
              className="w-full h-auto"
            />
            {block.metadata?.alt && (
              <div className="bg-sija-light border-t-4 border-sija-primary p-3">
                <p className="text-sm text-sija-text font-bold text-center uppercase tracking-wider">
                  {block.metadata.alt}
                </p>
              </div>
            )}
          </div>
        );

      case BlockType.CODE:
        return (
          <pre className="bg-gray-900 text-gray-100 p-6 border-4 border-sija-primary shadow-hard overflow-x-auto mb-6 font-mono">
            <code className={`language-${block.metadata?.language || 'text'}`}>
              {block.content}
            </code>
          </pre>
        );

      case BlockType.QUOTE:
        return (
          <blockquote className="border-l-8 border-sija-primary bg-sija-light p-6 my-6 shadow-hard">
            <p className="text-sija-text font-bold text-lg italic">
              "{block.content}"
            </p>
          </blockquote>
        );

      case BlockType.LIST:
        const items = block.content.split('\n').filter((item: string) => item.trim());
        return (
          <ul className="mb-6 space-y-3">
            {items.map((item: string, index: number) => (
              <li key={index} className="flex items-start gap-3">
                <span className="bg-sija-primary text-white font-bold px-3 py-1 border-2 border-sija-primary shadow-hard-sm text-sm mt-1">
                  {index + 1}
                </span>
                <span className="text-sija-text font-medium flex-1 pt-1">{item}</span>
              </li>
            ))}
          </ul>
        );

      default:
        return null;
    }
  };

  return (
    <article className="max-w-4xl mx-auto">
      {/* Banner Image */}
      {article.banner && (
        <div className="mb-8 -mx-4 sm:-mx-6 lg:-mx-8 border-4 border-sija-primary shadow-hard overflow-hidden">
          <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
            <Image
              src={article.banner}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      <header className="mb-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="bg-sija-primary text-white font-bold px-4 py-2 border-2 border-sija-primary shadow-hard-sm uppercase tracking-wider text-sm">
              {article.category}
            </span>
            <div className="flex items-center gap-2 text-sija-text font-bold">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatDate(article.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-sija-text font-bold">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{article.views || 0}</span>
            </div>
          </div>

          {canEdit && (
            <Link
              href={`/articles/${article.slug}/edit`}
              className="inline-flex items-center gap-2 bg-sija-primary text-white px-4 py-2 border-2 border-sija-primary font-bold shadow-hard hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider text-sm"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          )}
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-black text-sija-primary mb-6 uppercase leading-tight">
          {article.title}
        </h1>

        <p className="text-lg md:text-xl text-sija-text font-medium border-l-4 border-sija-primary pl-6 py-2">
          {article.description}
        </p>

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {article.tags.map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center gap-1 bg-sija-light text-sija-text px-3 py-1 border-2 border-sija-text font-bold shadow-hard-sm uppercase tracking-wider text-xs"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="prose max-w-none">
        {article.blocks
          .sort((a, b) => a.order - b.order)
          .map((block) => (
            <div key={block.id}>
              {renderBlock(block)}
            </div>
          ))}
      </div>
    </article>
  );
}