import { ReactNode, useCallback, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { ToastApi, ToastContext } from './toast-context';

type ToastTone = 'success' | 'error';

interface ToastMessage {
  id: number;
  tone: ToastTone;
  text: string;
}

const DISPLAY_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const show = useCallback((tone: ToastTone, text: string) => {
    const id = Date.now() + Math.random();
    setMessages((current) => [...current, { id, tone, text }]);
    setTimeout(() => setMessages((current) => current.filter((message) => message.id !== id)), DISPLAY_MS);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({ success: (text) => show('success', text), error: (text) => show('error', text) }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'max-w-sm rounded-2xl px-4 py-3 text-[13px] font-bold shadow-lg',
              message.tone === 'success'
                ? 'bg-lime text-ink'
                : 'border border-danger-border bg-danger-soft text-danger-ink',
            )}
          >
            {message.tone === 'success' ? '✓ ' : '✕ '}
            {message.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
