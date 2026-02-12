// src/components/common/Breadcrumb.tsx

'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export default function Breadcrumb({
  items,
  showHome = true,
  className = ''
}: BreadcrumbProps) {
  const allItems = showHome
    ? [{ label: 'Home', href: '/', icon: <Home size={16} strokeWidth={2.5} /> }, ...items]
    : items;

  return (
    <nav
      className={`mb-6 bg-sija-surface border-2 border-sija-border px-4 py-3 shadow-hard transition-colors duration-300 ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isFirst = index === 0;

          return (
            <li key={index} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 font-bold text-sija-text hover:text-sija-primary transition-colors uppercase tracking-wide group duration-300"
                >
                  {item.icon && (
                    <span className="flex-shrink-0 transition-transform group-hover:scale-110 duration-300">
                      {item.icon}
                    </span>
                  )}
                  <span className={isFirst && item.icon ? 'hidden sm:inline' : ''}>
                    {item.label}
                  </span>
                </Link>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 font-black text-sija-primary uppercase tracking-wide transition-colors duration-300"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span className={isFirst && item.icon ? 'hidden sm:inline' : ''}>
                    {item.label}
                  </span>
                </span>
              )}

              {!isLast && (
                <ChevronRight
                  size={16}
                  strokeWidth={2.5}
                  className="text-sija-text/40 dark:text-sija-text/30 flex-shrink-0 transition-colors duration-300"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}