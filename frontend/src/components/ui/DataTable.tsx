import { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  isRowHighlighted?: (row: T) => boolean;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  emptyMessage = 'Belum ada data',
  isRowHighlighted,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'label-caps border-b border-line px-3 pb-3 first:pl-6 last:pr-6',
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center text-muted">
                <Spinner />
              </td>
            </tr>
          )}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center text-sm font-medium text-muted">
                {emptyMessage}
              </td>
            </tr>
          )}
          {!loading &&
            rows.map((row) => (
              <tr key={rowKey(row)} className={cn('group', isRowHighlighted?.(row) && '[&>td]:bg-lime-tint')}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'border-b border-line px-3 py-4 align-middle text-[13px] group-last:border-b-0',
                      'first:rounded-l-2xl first:pl-6 last:rounded-r-2xl last:pr-6',
                      column.className,
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
