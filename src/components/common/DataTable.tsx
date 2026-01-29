// ============================================
// src/components/common/DataTable.tsx
// Data Table Component - Neobrutalist Design with Pagination
// ============================================

'use client';

import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  // Pagination
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
  // Mobile card view
  mobileCardRender?: (item: T, index: number) => ReactNode;
}

export default function DataTable<T extends { _id?: any }>({
  data = [],
  columns,
  loading = false,
  emptyMessage = 'Tidak ada data',
  emptyIcon,
  pagination,
  mobileCardRender,
}: DataTableProps<T>) {
  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  if (loading) {
    return (
      <div className="bg-sija-surface border-2 border-sija-primary p-12 text-center shadow-hard">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sija-primary border-t-transparent"></div>
        <p className="text-sija-text font-bold mt-4">Loading...</p>
      </div>
    );
  }

  if (safeData.length === 0) {
    return (
      <div className="bg-sija-surface border-2 border-sija-primary p-12 text-center shadow-hard">
        {emptyIcon && <div className="mb-4">{emptyIcon}</div>}
        <p className="text-sija-text font-bold text-lg">{emptyMessage}</p>
      </div>
    );
  }

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { currentPage, totalPages, totalItems, onPageChange } = pagination;

    return (
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-sija-surface border-2 border-sija-primary p-4 shadow-hard">
        <p className="text-sm font-bold text-sija-text">
          Halaman {currentPage} dari {totalPages} • Total {totalItems} items
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 font-display font-bold text-xs bg-sija-surface text-sija-primary border-2 border-sija-primary shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
          >
            Previous
          </button>

          {/* Page Numbers */}
          <div className="hidden sm:flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-10 h-10 font-display font-bold text-xs border-2 shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase ${
                    currentPage === pageNum
                      ? 'bg-sija-primary text-white border-sija-primary'
                      : 'bg-sija-surface text-sija-primary border-sija-primary hover:bg-sija-primary/10'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 font-display font-bold text-xs bg-sija-surface text-sija-primary border-2 border-sija-primary shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-sija-surface border-2 border-sija-primary shadow-hard overflow-hidden">
        {/* Mobile View - Card Style */}
        {mobileCardRender && (
          <div className="block lg:hidden">
            {safeData.map((item, index) => (
              <div
                key={item._id?.toString() || index}
                className={`${index !== safeData.length - 1 ? 'border-b-2 border-sija-primary' : ''}`}
              >
                {mobileCardRender(item, index)}
              </div>
            ))}
          </div>
        )}

        {/* Desktop View - Table */}
        <div className={`${mobileCardRender ? 'hidden lg:block' : 'block'} overflow-x-auto`}>
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-sija-primary bg-sija-primary/5">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-4 text-left font-display text-xs font-black text-sija-primary uppercase tracking-wider ${column.className || ''}`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {safeData.map((item, index) => (
                <tr
                  key={item._id?.toString() || index}
                  className={`${
                    index !== safeData.length - 1 ? 'border-b-2 border-sija-primary/20' : ''
                  } hover:bg-sija-primary/5 transition-colors`}
                >
                  {columns.map((column) => (
                    <td key={column.key} className={`px-6 py-4 ${column.className || ''}`}>
                      {column.render
                        ? column.render(item)
                        : String((item as any)[column.key] || '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {renderPagination()}
    </>
  );
}