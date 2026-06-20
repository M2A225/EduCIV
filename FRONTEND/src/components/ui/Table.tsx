import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  rowKey?: (row: T, index: number) => string | number;
  virtualizeThreshold?: number;
  onRowClick?: (row: T) => void;
}

function LoadingState() {
  return (
    <div className="p-12 text-center">
      <div className="inline-flex items-center gap-3 text-text-muted">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span>Chargement...</span>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-12 text-center border border-border rounded-xl bg-surface/30">
      <p className="text-text-muted text-sm">{message}</p>
    </div>
  );
}

function NonVirtualTable<T>({ data, columns, rowKey, onRowClick }: {
  data: T[];
  columns: Column<T>[];
  rowKey?: (row: T, index: number) => string | number;
  onRowClick?: (row: T) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-primary/5 text-primary uppercase font-heading font-bold text-xs tracking-widest sticky top-0 z-10">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={`px-6 py-4 border-b border-primary/10 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-primary/5">
          {data.map((row, rowIdx) => (
            <tr
              key={rowKey?.(row, rowIdx) ?? rowIdx}
              className={`hover:bg-primary/5 transition-colors duration-200 group ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx} className={`px-6 py-4 text-text/80 group-hover:text-text ${col.className || ''}`}>
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VirtualTable<T>({ data, columns, rowKey, onRowClick, estimatedRowHeight = 52 }: {
  data: T[];
  columns: Column<T>[];
  rowKey?: (row: T, index: number) => string | number;
  onRowClick?: (row: T) => void;
  estimatedRowHeight?: number;
}) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan: 20,
  });

  return (
    <div ref={parentRef} className="overflow-auto max-h-[600px]">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-primary/5 text-primary uppercase font-heading font-bold text-xs tracking-widest sticky top-0 z-10">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={`px-6 py-4 border-b border-primary/10 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-primary/5" style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = data[virtualRow.index];
            return (
              <tr
                key={rowKey?.(row, virtualRow.index) ?? virtualRow.index}
                className={`hover:bg-primary/5 transition-colors duration-200 group ${onRowClick ? 'cursor-pointer' : ''}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`px-6 py-4 text-text/80 group-hover:text-text ${col.className || ''}`}>
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Table<T>({
  data,
  columns,
  isLoading,
  emptyMessage = 'Aucune donnée disponible',
  rowKey,
  virtualizeThreshold = 100,
  onRowClick,
}: TableProps<T>) {
  if (isLoading) return <LoadingState />;
  if (!Array.isArray(data) || data.length === 0) return <EmptyState message={emptyMessage} />;

  if (data.length >= virtualizeThreshold) {
    return <VirtualTable data={data} columns={columns} rowKey={rowKey} onRowClick={onRowClick} />;
  }

  return <NonVirtualTable data={data} columns={columns} rowKey={rowKey} onRowClick={onRowClick} />;
}
