import { useServerClock } from '@/hooks/use-server-clock';
import { formatLongDate, formatTime } from '@/lib/datetime';

export function LiveClock({ serverTime }: { serverTime?: string }) {
  const now = useServerClock(serverTime);

  return (
    <div>
      <p className="text-[13px] font-medium text-on-dark">Waktu sekarang</p>
      <time
        dateTime={now.toISOString()}
        className="mt-2 block text-6xl font-bold tracking-tight text-lime tabular-nums sm:text-7xl"
      >
        {formatTime(now)}
      </time>
      <p className="mt-4 text-[17px] font-semibold text-white">{formatLongDate(now)} · WIB</p>
    </div>
  );
}
