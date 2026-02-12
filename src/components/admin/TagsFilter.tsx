// src/components/admin/TagsFilter.tsx

import { Filter, RefreshCw } from 'lucide-react';

interface TagsFilterProps {
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  sortBy: 'usage' | 'name' | 'date';
  setSortBy: (sort: 'usage' | 'name' | 'date') => void;
  onRefresh: () => void;
}

export default function TagsFilter({
  filterCategory,
  setFilterCategory,
  sortBy,
  setSortBy,
  onRefresh,
}: TagsFilterProps) {
  return (
    <div className="bg-sija-surface border-2 border-sija-border p-6 shadow-hard-sm transition-colors duration-300">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Category Filter */}
        <div className="flex items-center gap-3 flex-1">
          <Filter className="w-5 h-5 text-sija-primary flex-shrink-0 transition-colors duration-300" />
          <label className="text-sm font-bold text-sija-text uppercase tracking-wider whitespace-nowrap transition-colors duration-300">
            Category:
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="flex-1 min-w-[150px] px-4 py-2 bg-sija-background border-2 border-sija-border font-bold text-sija-text focus:outline-none focus:ring-2 focus:ring-sija-primary transition-colors duration-300"
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="technology">Technology</option>
            <option value="course">Course</option>
            <option value="subject">Subject</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-3 flex-1">
          <label className="text-sm font-bold text-sija-text uppercase tracking-wider whitespace-nowrap transition-colors duration-300">
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="flex-1 min-w-[150px] px-4 py-2 bg-sija-background border-2 border-sija-border font-bold text-sija-text focus:outline-none focus:ring-2 focus:ring-sija-primary transition-colors duration-300"
          >
            <option value="usage">Most Used</option>
            <option value="name">Alphabetical</option>
            <option value="date">Newest</option>
          </select>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 bg-sija-surface text-sija-text px-6 py-2 font-bold border-2 border-sija-border shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider text-sm whitespace-nowrap duration-300"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
    </div>
  );
}