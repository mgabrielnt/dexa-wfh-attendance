import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface StatTileProps {
  label: string;
  value: ReactNode;
  caption?: string;
  tone?: 'light' | 'dark' | 'panel';
  className?: string;
}

const toneClasses = {
  light: { box: 'bg-white', label: 'text-muted', value: 'text-ink' },
  dark: { box: 'bg-ink', label: 'text-on-dark', value: 'text-lime' },
  panel: { box: 'bg-ink-soft', label: 'text-on-dark', value: 'text-white' },
};

export function StatTile({ label, value, caption, tone = 'light', className }: StatTileProps) {
  const classes = toneClasses[tone];
  return (
    <div className={cn('rounded-3xl p-5', classes.box, className)}>
      <p className={cn('text-xs font-medium', classes.label)}>{label}</p>
      <p className={cn('mt-2 text-4xl font-bold leading-none', classes.value)}>{value}</p>
      {caption && <p className={cn('mt-3 text-[11px] font-medium', classes.label)}>{caption}</p>}
    </div>
  );
}
