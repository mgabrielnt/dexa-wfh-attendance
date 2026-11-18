import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'success' | 'muted' | 'dark' | 'white';
type DotTone = 'neutral' | 'success' | 'danger' | 'muted' | 'lime';

interface ChipProps {
  tone?: Tone;
  dot?: boolean;
  dotTone?: DotTone;
  size?: 'sm' | 'md';
  className?: string;
  children: ReactNode;
}

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-soft text-body-light',
  success: 'bg-lime-soft text-lime-ink',
  muted: 'bg-soft text-muted',
  dark: 'bg-ink text-lime',
  white: 'bg-white text-body border border-border',
};

const defaultDotTone: Record<Tone, DotTone> = {
  neutral: 'neutral',
  success: 'success',
  muted: 'muted',
  dark: 'lime',
  white: 'neutral',
};

const dotClasses: Record<DotTone, string> = {
  neutral: 'bg-muted',
  success: 'bg-success',
  danger: 'bg-danger',
  muted: 'bg-muted-light',
  lime: 'bg-lime',
};

export function Chip({
  tone = 'neutral',
  dot = false,
  dotTone,
  size = 'sm',
  className,
  children,
}: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl font-semibold',
        size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-2 text-xs',
        toneClasses[tone],
        className,
      )}
    >
      {dot && (
        <span className={cn('h-[7px] w-[7px] rounded-full', dotClasses[dotTone ?? defaultDotTone[tone]])} />
      )}
      {children}
    </span>
  );
}

interface FilterChipProps {
  selected?: boolean;
  dotClassName?: string;
  onClick: () => void;
  children: ReactNode;
}

export function FilterChip({ selected = false, dotClassName, onClick, children }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-2xl bg-white px-4 text-xs transition',
        selected
          ? 'border border-ink font-semibold text-ink'
          : 'border border-transparent font-medium text-body hover:border-border',
      )}
    >
      {dotClassName && <span className={cn('h-[7px] w-[7px] rounded-full', dotClassName)} />}
      {children}
    </button>
  );
}
