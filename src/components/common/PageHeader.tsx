// src/components/common/PageHeader.tsx

'use client';

import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-white',
  iconBgColor = 'bg-sija-primary border-sija-primary',
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-8 bg-sija-surface border-2 border-sija-border p-6 lg:p-8 shadow-hard transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${iconBgColor} border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-300`}>
            <Icon className={`w-7 h-7 ${iconColor}`} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-black text-sija-primary uppercase transition-colors duration-300">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sija-text/70 dark:text-sija-text/60 font-bold mt-1 text-sm transition-colors duration-300">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}