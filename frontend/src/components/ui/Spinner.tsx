import { cn } from '@/lib/cn';

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Memuat"
      className={cn(
        'inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent',
        className,
      )}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="grid min-h-screen place-items-center text-muted">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
