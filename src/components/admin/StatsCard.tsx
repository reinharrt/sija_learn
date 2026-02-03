// ============================================
// src/components/admin/StatsCard.tsx
// Stats Card Component - Reusable stats display with Dark Mode
// ============================================

import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
}

export default function StatsCard({ label, value, icon: Icon, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-950/30 border-blue-500 dark:border-blue-400',
    green: 'bg-green-100 dark:bg-green-950/30 border-green-500 dark:border-green-400',
    purple: 'bg-purple-100 dark:bg-purple-950/30 border-purple-500 dark:border-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-950/30 border-orange-500 dark:border-orange-400',
    pink: 'bg-pink-100 dark:bg-pink-950/30 border-pink-500 dark:border-pink-400',
  }[color];

  const iconColorClasses = {
    blue: 'bg-blue-500 dark:bg-blue-600 border-blue-700 dark:border-blue-800 text-white',
    green: 'bg-green-500 dark:bg-green-600 border-green-700 dark:border-green-800 text-white',
    purple: 'bg-purple-500 dark:bg-purple-600 border-purple-700 dark:border-purple-800 text-white',
    orange: 'bg-orange-500 dark:bg-orange-600 border-orange-700 dark:border-orange-800 text-white',
    pink: 'bg-pink-500 dark:bg-pink-600 border-pink-700 dark:border-pink-800 text-white',
  }[color];

  return (
    <div className={`${colorClasses} border-2 p-6 shadow-hard-sm transition-colors duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${iconColorClasses} border-2 flex items-center justify-center transition-colors duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-4xl font-black text-sija-primary transition-colors duration-300">
          {value}
        </div>
      </div>
      <div className="text-sm font-bold text-sija-text/70 dark:text-sija-text/60 uppercase tracking-wider transition-colors duration-300">
        {label}
      </div>
    </div>
  );
}