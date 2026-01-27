// ============================================
// src/components/article/ArticleDetail.tsx
// Article Detail Component - Full article display
// ============================================

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Article, BlockType } from '@/types';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface ArticleDetailProps {
  article: Article;
}

export default function ArticleDetail({ article }: ArticleDetailProps) {
  const { user } = useAuth();

  // Check if user can edit
  const canEdit = user && (
    article.author.toString() === user.id || 
    user.role === UserRole.ADMIN
  );

  const renderBlock = (block: any) => {
    switch (block.type) {
      case BlockType.TEXT:
        return (
          <p className="text-gray-700 leading-relaxed mb-4">
            {block.content}
          </p>
        );

      case BlockType.HEADING: {
        const level = block.metadata?.level || 2;
        const content = block.content;
        
        // Render heading based on level with proper typing
        switch (level) {
          case 1:
            return <h1 className="text-3xl font-bold mb-4">{content}</h1>;
          case 2:
            return <h2 className="text-2xl font-bold mb-3">{content}</h2>;
          case 3:
            return <h3 className="text-xl font-semibold mb-2">{content}</h3>;
          default:
            return <h4 className="text-lg font-semibold mb-2">{content}</h4>;
        }
      }

      case BlockType.IMAGE:
        return (
          <div className="my-6">
            <img 
              src={block.content} 
              alt={block.metadata?.alt || 'Image'}
              className="max-w-full h-auto rounded-lg"
            />
            {block.metadata?.alt && (
              <p className="text-sm text-gray-500 text-center mt-2">
                {block.metadata.alt}
              </p>
            )}
          </div>
        );

      case BlockType.CODE:
        return (
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
            <code className={`language-${block.metadata?.language || 'text'}`}>
              {block.content}
            </code>
          </pre>
        );

      case BlockType.QUOTE:
        return (
          <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 italic text-gray-700">
            {block.content}
          </blockquote>
        );

      case BlockType.LIST:
        const items = block.content.split('\n').filter((item: string) => item.trim());
        return (
          <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700">
            {items.map((item: string, index: number) => (
              <li key={index}>{item}</li>
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
        <div className="mb-8 -mx-4 sm:-mx-6 lg:-mx-8">
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded">
              {article.category}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(article.createdAt)}
            </span>
            <span className="text-sm text-gray-500">
              👁️ {article.views || 0} views
            </span>
          </div>

          {canEdit && (
            <Link
              href={`/articles/${article.slug}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              ✏️ Edit Artikel
            </Link>
          )}
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>

        <p className="text-lg text-gray-600">
          {article.description}
        </p>

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.map((tag, index) => (
              <span 
                key={index}
                className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded"
              >
                #{tag}
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