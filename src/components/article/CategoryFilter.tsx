// ============================================
// src/components/article/CategoryFilter.tsx
// Category Filter with Lucide Icons
// ============================================

'use client';

import { useState, useEffect } from 'react';
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
  Coffee,
  Grid
} from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  usageCount: number;
}

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
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

export default function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories?minUsage=0');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Load categories error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {/* All Articles */}
      <button
        onClick={() => onSelectCategory(null)}
        className={`inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-900 font-bold whitespace-nowrap transition-all ${
          selectedCategory === null
            ? 'bg-gray-900 text-white shadow-none translate-x-[2px] translate-y-[2px]'
            : 'bg-white text-gray-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
        }`}
      >
        <Grid className="w-4 h-4" />
        Semua
      </button>

      {/* Category Filters */}
      {categories.map((cat) => {
        const IconComponent = iconMap[cat.icon || 'Folder'] || Folder;
        const isSelected = selectedCategory === cat.slug;

        return (
          <button
            key={cat.slug}
            onClick={() => onSelectCategory(cat.slug)}
            className={`inline-flex items-center gap-2 px-4 py-2 border-2 font-bold whitespace-nowrap transition-all ${
              isSelected
                ? 'border-gray-900 shadow-none translate-x-[2px] translate-y-[2px]'
                : 'border-gray-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
            }`}
            style={{
              backgroundColor: isSelected ? cat.color : cat.color + '20',
              color: isSelected ? 'white' : cat.color,
            }}
          >
            <IconComponent className="w-4 h-4" />
            <span>{cat.name}</span>
            <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-600'}`}>
              ({cat.usageCount})
            </span>
          </button>
        );
      })}
    </div>
  );
}