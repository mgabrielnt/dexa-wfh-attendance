import { cn } from '@/lib/cn';
import { Paginated } from '@/types/api';

interface PaginationProps {
  meta: Paginated<unknown>['meta'];
  itemLabel: string;
  onPageChange: (page: number) => void;
}

function visiblePages(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = new Set(
    [1, total, current - 1, current, current + 1].filter((page) => page >= 1 && page <= total),
  );
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((page, index) => (index > 0 && page - sorted[index - 1] > 1 ? [null, page] : [page]));
}

export function Pagination({ meta, itemLabel, onPageChange }: PaginationProps) {
  const { page, limit, total, totalPages } = meta;
  const firstItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const lastItem = Math.min(page * limit, total);

  const pageButton =
    'grid h-8 min-w-8 place-items-center rounded-[10px] border px-2 text-xs font-bold transition';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-5 pt-4">
      <p className="text-xs font-medium text-muted">
        Menampilkan {firstItem}–{lastItem} dari {total} {itemLabel}
      </p>
      <nav aria-label="Halaman" className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Halaman sebelumnya"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={cn(pageButton, 'border-line bg-white disabled:opacity-40')}
        >
          ‹
        </button>
        {visiblePages(page, totalPages).map((value, index) =>
          value === null ? (
            <span key={`gap-${index}`} className="px-1 text-xs text-muted">
              …
            </span>
          ) : (
            <button
              type="button"
              key={value}
              aria-current={value === page ? 'page' : undefined}
              onClick={() => onPageChange(value)}
              className={cn(
                pageButton,
                value === page ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:border-border',
              )}
            >
              {value}
            </button>
          ),
        )}
        <button
          type="button"
          aria-label="Halaman berikutnya"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={cn(pageButton, 'border-line bg-white disabled:opacity-40')}
        >
          ›
        </button>
      </nav>
    </div>
  );
}
