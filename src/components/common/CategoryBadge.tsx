// ============================================
// src/components/common/CategoryBadge.tsx
// Category Badge with Lucide Icon
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
      className={`inline-flex items-center ${sizeClasses[size]} rounded font-medium border-2 border-gray-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
      style={{ 
        backgroundColor: color + '20',
        color: color
      }}
    >
      <IconComponent className={iconSizes[size]} />
      <span className="text-gray-900 font-bold">{name}</span>
      {showCount !== undefined && (
        <span className="text-gray-600 text-xs">({showCount})</span>
      )}
    </span>
  );
}