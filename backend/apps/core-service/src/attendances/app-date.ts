const resolveTimeZone = () => process.env.APP_TIMEZONE ?? 'Asia/Jakarta';

const zonedParts = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: resolveTimeZone(),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

const partValue = (parts: Intl.DateTimeFormatPart[], type: string) =>
  Number(parts.find((part) => part.type === type)?.value ?? 0);

const zoneOffsetInMinutes = (date: Date) => {
  const parts = zonedParts(date);
  const asUtc = Date.UTC(
    partValue(parts, 'year'),
    partValue(parts, 'month') - 1,
    partValue(parts, 'day'),
    partValue(parts, 'hour'),
    partValue(parts, 'minute'),
    partValue(parts, 'second'),
  );

  return (asUtc - date.getTime()) / 60000;
};

export const toAppDate = (date: Date) => {
  const parts = zonedParts(date);
  const year = partValue(parts, 'year');
  const month = String(partValue(parts, 'month')).padStart(2, '0');
  const day = String(partValue(parts, 'day')).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const toAppTime = (date: Date) => {
  const parts = zonedParts(date);
  const hour = String(partValue(parts, 'hour')).padStart(2, '0');
  const minute = String(partValue(parts, 'minute')).padStart(2, '0');

  return `${hour}:${minute}`;
};

export const toAppDateTime = (date: string, time: string) => {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const guess = Date.UTC(year, month - 1, day, hour, minute);

  return new Date(guess - zoneOffsetInMinutes(new Date(guess)) * 60000);
};
