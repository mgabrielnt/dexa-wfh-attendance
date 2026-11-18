import { useServerClock } from '@/hooks/use-server-clock';
import { formatMediumDate, formatShortTime } from '@/lib/datetime';

const WORK_START_HOUR = 8;
const WORK_END_HOUR = 17;

function progressOf(now: Date): number {
  const [hours, minutes] = formatShortTime(now).split(':').map(Number);
  const elapsed = hours + minutes / 60 - WORK_START_HOUR;
  return Math.min(100, Math.max(0, (elapsed / (WORK_END_HOUR - WORK_START_HOUR)) * 100));
}

export function WorkdayBar() {
  const now = useServerClock();
  const progress = progressOf(now);

  return (
    <div className="flex h-14 flex-1 items-center gap-4 rounded-full bg-ink pl-6 pr-1.5 text-white">
      <span className="text-[15px] font-semibold">Jadwal WFH</span>
      <span className="h-6 w-px bg-ink-edge" />
      <span className="whitespace-nowrap text-[13px] font-medium text-on-dark">{formatMediumDate(now)}</span>

      <div className="relative ml-2 flex h-11 flex-1 items-center justify-between rounded-full bg-lime px-5 text-[13px] font-semibold text-ink">
        <span>08:00 Masuk</span>
        <span className="hidden xl:inline">12:00 Istirahat</span>
        <span>17:00 Pulang</span>
        <span className="absolute inset-y-0 w-0.5 bg-ink" style={{ left: `${progress}%` }}>
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-lime bg-ink px-2 py-0.5 text-[11px] font-bold text-white">
            {formatShortTime(now)}
          </span>
        </span>
      </div>
    </div>
  );
}
