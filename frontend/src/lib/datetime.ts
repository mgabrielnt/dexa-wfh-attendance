const TIMEZONE = 'Asia/Jakarta';
const LOCALE = 'id-ID';

const formatters = {
  time: new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }),
  shortTime: new Intl.DateTimeFormat('en-GB', { timeZone: TIMEZONE, hour: '2-digit', minute: '2-digit' }),
  longDate: new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
  mediumDate: new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }),
  plainDate: new Intl.DateTimeFormat(LOCALE, {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }),
  month: new Intl.DateTimeFormat(LOCALE, { timeZone: 'UTC', month: 'long', year: 'numeric' }),
  isoDate: new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }),
};

const asDate = (value: string | Date) => (value instanceof Date ? value : new Date(value));

export const formatTime = (value: string | Date) => formatters.time.format(asDate(value));

export const formatShortTime = (value: string | Date) => formatters.shortTime.format(asDate(value));

export const formatLongDate = (value: string | Date) => formatters.longDate.format(asDate(value));

export const formatMediumDate = (value: string | Date) => formatters.mediumDate.format(asDate(value));

export const formatPlainDate = (isoDate: string) =>
  formatters.plainDate.format(new Date(`${isoDate}T00:00:00Z`));

export const formatMonth = (month: string) => formatters.month.format(new Date(`${month}-01T00:00:00Z`));

export const todayIso = (now = new Date()) => formatters.isoDate.format(now);

export const currentMonth = (now = new Date()) => todayIso(now).slice(0, 7);

export function shiftMonth(month: string, delta: number): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  return date.toISOString().slice(0, 7);
}

export const startOfMonthIso = (isoDate: string) => `${isoDate.slice(0, 7)}-01`;
