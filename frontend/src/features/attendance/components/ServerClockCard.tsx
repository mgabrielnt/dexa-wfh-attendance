import { LiveClock } from '@/components/ui/LiveClock';
import { cn } from '@/lib/cn';

const STEPS = [
  'Ambil foto atau upload foto kerja',
  'Klik “Kirim Absen”',
  'Absen tercatat & terlihat oleh HRD',
];

export function ServerClockCard({ serverTime, checkedIn }: { serverTime?: string; checkedIn: boolean }) {
  return (
    <section className="rounded-[28px] bg-ink p-7">
      <LiveClock serverTime={serverTime} />

      <p className="mt-6 rounded-2xl bg-ink-raised px-4 py-3 text-xs font-medium leading-5 text-on-dark-soft">
        ⓘ Tanggal & jam dicatat otomatis oleh server saat absen dikirim.
      </p>

      <h2 className="mt-8 text-sm font-semibold text-white">Cara absen</h2>
      <ol className="mt-4 flex flex-col gap-3">
        {STEPS.map((step, index) => {
          const done = checkedIn || index === 0;
          return (
            <li key={step} className="flex items-center gap-3 text-[13px] font-medium">
              <span
                className={cn(
                  'grid h-8 w-8 place-items-center rounded-full text-[13px] font-bold',
                  done ? 'bg-lime text-ink' : 'bg-ink-line text-white',
                )}
              >
                {index + 1}
              </span>
              <span className={done ? 'text-white' : 'text-on-dark-soft'}>{step}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
