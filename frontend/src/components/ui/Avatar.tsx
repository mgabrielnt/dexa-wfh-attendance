import { cn } from '@/lib/cn';

const PALETTE = [
  'bg-avatar-peach text-avatar-peach-ink',
  'bg-avatar-sky text-avatar-sky-ink',
  'bg-avatar-rose text-avatar-rose-ink',
  'bg-avatar-sage text-avatar-sage-ink',
  'bg-avatar-lilac text-avatar-lilac-ink',
  'bg-avatar-sand text-avatar-sand-ink',
];

const sizeClasses = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-[13px]',
  lg: 'h-[52px] w-[52px] text-base',
};

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/);
  return ((words[0]?.[0] ?? '') + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase();
}

function colorOf(name: string): string {
  const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

interface AvatarProps {
  name: string;
  size?: keyof typeof sizeClasses;
  muted?: boolean;
  className?: string;
}

export function Avatar({ name, size = 'md', muted = false, className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold',
        sizeClasses[size],
        muted ? 'bg-avatar-neutral text-body-light' : colorOf(name),
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
