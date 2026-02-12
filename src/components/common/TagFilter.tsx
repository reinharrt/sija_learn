// src/components/common/TagFilter.tsx

'use client';

import { LucideIcon, X, Filter } from 'lucide-react';

export interface FilterItem {
    value: string | null;
    label: string;
    icon?: LucideIcon;
}

interface TagFilterProps {
    title?: string;
    items: FilterItem[];
    selectedValue: string | null;
    onChange: (value: string | null) => void;
    loading?: boolean;
    emptyMessage?: string;
}

export default function TagFilter({
    title = 'Filter',
    items,
    selectedValue,
    onChange,
    loading = false,
    emptyMessage = 'Belum ada filter tersedia.',
}: TagFilterProps) {
    const allItem = items.find((item) => item.value === null);
    const filterItems = items.filter((item) => item.value !== null);
    const selectedItem = items.find((item) => item.value === selectedValue);

    return (
        <div className="mb-8 bg-sija-surface border-2 border-sija-border p-6 lg:p-8 shadow-hard transition-colors duration-300">
            {/* Header Filter */}
            <div className="flex items-center gap-3 mb-5">
                <Filter className="w-5 h-5 text-sija-primary transition-colors duration-300" strokeWidth={2.5} />
                <h2 className="font-display text-base md:text-lg font-black text-sija-text uppercase tracking-wider transition-colors duration-300">
                    {title}
                </h2>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex flex-wrap gap-3">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="h-11 animate-pulse bg-sija-light dark:bg-sija-dark/50 border-2 border-sija-border/20 transition-colors duration-300"
                            style={{ width: `${80 + i * 30}px` }}
                        />
                    ))}
                </div>
            ) : filterItems.length === 0 ? (
                /* Empty State */
                <div className="py-6 bg-sija-light dark:bg-sija-dark/30 border-2 border-dashed border-sija-border/40 text-center transition-colors duration-300">
                    <p className="text-sm font-bold text-sija-text/60 dark:text-sija-text/50 transition-colors duration-300">{emptyMessage}</p>
                </div>
            ) : (
                <>
                    {/* Filter Buttons */}
                    <div className="flex flex-wrap gap-3">
                        {/* All Button */}
                        {allItem && (
                            <button
                                onClick={() => onChange(null)}
                                className={`px-5 py-2.5 text-sm font-bold border-2 uppercase tracking-wider transition-all flex items-center gap-2 duration-300 ${selectedValue === null
                                    ? 'bg-sija-primary text-white border-sija-primary shadow-hard'
                                    : 'bg-sija-surface text-sija-text border-sija-border hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] shadow-hard-sm'
                                    }`}
                            >
                                {allItem.icon && <allItem.icon className="w-4 h-4" />}
                                {allItem.label}
                            </button>
                        )}

                        {/* Filter Item Buttons */}
                        {filterItems.map((item) => {
                            const isActive = selectedValue === item.value;
                            const Icon = item.icon;

                            return (
                                <button
                                    key={item.value}
                                    onClick={() => onChange(item.value)}
                                    className={`px-5 py-2.5 text-sm font-bold border-2 uppercase tracking-wider transition-all flex items-center gap-2 duration-300 ${isActive
                                        ? 'bg-sija-primary text-white border-sija-primary shadow-hard'
                                        : 'bg-sija-surface text-sija-text border-sija-border hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] shadow-hard-sm'
                                        }`}
                                >
                                    {Icon && <Icon className="w-4 h-4" />}
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Active Filter Bar */}
                    {selectedValue !== null && selectedItem && (
                        <div className="mt-5 pt-5 border-t-2 border-dashed border-sija-border/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors duration-300">
                            <p className="text-sm font-bold text-sija-text transition-colors duration-300">
                                Menampilkan:{' '}
                                <span className="text-sija-primary">{selectedItem.label}</span>
                            </p>
                            <button
                                onClick={() => onChange(null)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-500 dark:bg-red-600 border-2 border-red-600 dark:border-red-700 shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase tracking-wider duration-300"
                            >
                                <X className="w-4 h-4" />
                                Hapus Filter
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}