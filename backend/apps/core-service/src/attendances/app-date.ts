const resolveTimeZone = () => process.env.APP_TIMEZONE ?? 'Asia/Jakarta';

export const toAppDate = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: resolveTimeZone(),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
