import { ReactNode } from 'react';
import { Icon } from './Icon';

export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-ink px-4 py-2.5 text-xs font-medium text-on-dark-note">
      <Icon name="info" size={14} className="shrink-0" />
      {children}
    </p>
  );
}
