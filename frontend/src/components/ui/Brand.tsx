import { cn } from '@/lib/cn';

export function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-lime">
        <span className="h-3.5 w-3.5 rounded-full bg-ink" />
      </span>
      <span className={cn('text-xl font-bold', dark ? 'text-white' : 'text-ink')}>PresensiKu</span>
    </div>
  );
}
