import React from 'react';

interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export const Table = <T,>({ data, columns, isLoading, emptyMessage = 'Aucune donnée disponible' }: TableProps<T>) => {
  if (isLoading) {
    return <div className="p-4 text-center">Chargement...</div>;
  }

  if (data.length === 0) {
    return <div className="p-4 text-center border rounded bg-gray-50">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 uppercase font-semibold">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-3">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-gray-50">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="px-6 py-4">{col.accessor(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
