// ============================================
// src/components/admin/QuickActions.tsx
// Quick Actions Component - Quick action buttons
// ============================================

import Link from 'next/link';
import { Plus, RefreshCw } from 'lucide-react';

interface QuickActionsProps {
  onRefresh: () => void;
  refreshing: boolean;
}

export default function QuickActions({ onRefresh, refreshing }: QuickActionsProps) {
  return (
    <div className="bg-sija-surface border-2 border-sija-primary p-6 shadow-hard">
      <h2 className="font-display text-2xl font-bold text-sija-text mb-4 uppercase flex items-center gap-2">
        <Plus className="w-6 h-6" />
        Quick Actions
      </h2>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/articles/create"
          className="flex items-center gap-2 bg-sija-primary text-white px-6 py-3 font-bold border-2 border-sija-primary shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider text-sm"
        >
          <Plus className="w-4 h-4" />
          New Article
        </Link>
        <Link
          href="/courses/create"
          className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 font-bold border-2 border-green-600 shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider text-sm"
        >
          <Plus className="w-4 h-4" />
          New Course
        </Link>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 bg-sija-light text-sija-text px-6 py-3 font-bold border-2 border-sija-primary shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>
    </div>
  );
}