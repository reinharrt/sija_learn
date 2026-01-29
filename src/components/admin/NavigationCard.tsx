// ============================================
// src/components/admin/NavigationCard.tsx
// Navigation Card Component - Admin page navigation
// ============================================

import Link from 'next/link';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface NavigationCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
}

export default function NavigationCard({ 
  href, 
  icon: Icon, 
  title, 
  description, 
  color 
}: NavigationCardProps) {
  const colorClasses = {
    blue: 'border-blue-500 hover:shadow-hard',
    green: 'border-green-500 hover:shadow-hard',
    purple: 'border-purple-500 hover:shadow-hard',
    orange: 'border-orange-500 hover:shadow-hard',
    pink: 'border-pink-500 hover:shadow-hard',
  }[color];

  const iconColorClasses = {
    blue: 'bg-blue-500 border-blue-700',
    green: 'bg-green-500 border-green-700',
    purple: 'bg-purple-500 border-purple-700',
    orange: 'bg-orange-500 border-orange-700',
    pink: 'bg-pink-500 border-pink-700',
  }[color];

  return (
    <Link 
      href={href}
      className={`group bg-sija-surface ${colorClasses} border-2 p-6 shadow-hard-sm transition-all`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 ${iconColorClasses} border-2 flex items-center justify-center`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <ArrowRight 
          className="w-6 h-6 text-sija-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" 
        />
      </div>
      <h2 className="font-display text-xl font-bold text-sija-text mb-2 uppercase">
        {title}
      </h2>
      <p className="text-sija-text/70 text-sm font-medium">
        {description}
      </p>
    </Link>
  );
}