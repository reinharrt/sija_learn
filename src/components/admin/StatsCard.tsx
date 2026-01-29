// ============================================
// src/components/admin/StatsCard.tsx
// Stats Card Component - Reusable stats display
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
    blue: 'bg-blue-100 border-blue-500',
    green: 'bg-green-100 border-green-500',
    purple: 'bg-purple-100 border-purple-500',
    orange: 'bg-orange-100 border-orange-500',
    pink: 'bg-pink-100 border-pink-500',
  }[color];

  const iconColorClasses = {
    blue: 'bg-blue-500 border-blue-700 text-white',
    green: 'bg-green-500 border-green-700 text-white',
    purple: 'bg-purple-500 border-purple-700 text-white',
    orange: 'bg-orange-500 border-orange-700 text-white',
    pink: 'bg-pink-500 border-pink-700 text-white',
  }[color];

  return (
    <div className={`${colorClasses} border-2 p-6 shadow-hard-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${iconColorClasses} border-2 flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-4xl font-black text-sija-primary">
          {value}
        </div>
      </div>
      <div className="text-sm font-bold text-sija-text/70 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}