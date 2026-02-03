// ============================================
// src/components/common/CategoryBadge.tsx
// Category Badge with Lucide Icon and Dark Mode
// ============================================

'use client';

import { 
  Folder, 
  BookOpen, 
  Code, 
  Laptop, 
  Palette, 
  Wrench, 
  FileText, 
  Rocket, 
  Zap, 
  Target, 
  Star,
  Lightbulb,
  Coffee
} from 'lucide-react';

interface CategoryBadgeProps {
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: number;
}

const iconMap: Record<string, any> = {
  Folder,
  BookOpen,
  Code,
  Laptop,
  Palette,
  Wrench,
  FileText,
  Rocket,
  Zap,
  Target,
  Star,
  Lightbulb,
  Coffee,
};

export default function CategoryBadge({ 
  name, 
  slug, 
  icon = 'Folder', 
  color = '#3B82F6',
  size = 'md',
  showCount
}: CategoryBadgeProps) {
  const IconComponent = iconMap[icon] || Folder;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <span 
      className={`inline-flex items-center ${sizeClasses[size]} font-medium border-2 border-sija-border shadow-hard-sm transition-colors duration-300`}
      style={{ 
        backgroundColor: color + '20',
        color: color
      }}
    >
      <IconComponent className={iconSizes[size]} />
      <span className="text-sija-text font-bold transition-colors duration-300">{name}</span>
      {showCount !== undefined && (
        <span className="text-sija-text/60 dark:text-sija-text/50 text-xs transition-colors duration-300">({showCount})</span>
      )}
    </span>
  );
}