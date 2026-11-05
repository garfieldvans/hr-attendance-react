const fullDateFormat = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const shortDateFormat = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const timeFormat = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
});

export const toDateInputValue = (date: Date) => date.toLocaleDateString('en-CA');

export const todayValue = () => toDateInputValue(new Date());

const parseDate = (value: string) => new Date(`${value}T00:00:00`);

export const formatFullDate = (value: string) => fullDateFormat.format(parseDate(value));

export const formatShortDate = (value: string) => shortDateFormat.format(parseDate(value));

export const formatTime = (value: string) => timeFormat.format(new Date(value));
