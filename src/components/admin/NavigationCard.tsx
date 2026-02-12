// src/components/admin/NavigationCard.tsx

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
    blue: 'border-blue-500 dark:border-blue-400 hover:shadow-hard',
    green: 'border-green-500 dark:border-green-400 hover:shadow-hard',
    purple: 'border-purple-500 dark:border-purple-400 hover:shadow-hard',
    orange: 'border-orange-500 dark:border-orange-400 hover:shadow-hard',
    pink: 'border-pink-500 dark:border-pink-400 hover:shadow-hard',
  }[color];

  const iconColorClasses = {
    blue: 'bg-blue-500 dark:bg-blue-600 border-blue-700 dark:border-blue-800',
    green: 'bg-green-500 dark:bg-green-600 border-green-700 dark:border-green-800',
    purple: 'bg-purple-500 dark:bg-purple-600 border-purple-700 dark:border-purple-800',
    orange: 'bg-orange-500 dark:bg-orange-600 border-orange-700 dark:border-orange-800',
    pink: 'bg-pink-500 dark:bg-pink-600 border-pink-700 dark:border-pink-800',
  }[color];

  return (
    <Link
      href={href}
      className={`group bg-sija-surface ${colorClasses} border-2 p-6 shadow-hard-sm transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 ${iconColorClasses} border-2 flex items-center justify-center transition-colors duration-300`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <ArrowRight
          className="w-6 h-6 text-sija-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"
        />
      </div>
      <h2 className="font-display text-xl font-bold text-sija-text mb-2 uppercase transition-colors duration-300">
        {title}
      </h2>
      <p className="text-sija-text/70 dark:text-sija-text/60 text-sm font-medium transition-colors duration-300">
        {description}
      </p>
    </Link>
  );
}