import type { Session } from '../types';

const storageKey = 'attendance.session';

export const readSession = (): Session | null => {
  const stored = localStorage.getItem(storageKey);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as Session;
  } catch {
    localStorage.removeItem(storageKey);
    return null;
  }
};

export const writeSession = (session: Session) => {
  localStorage.setItem(storageKey, JSON.stringify(session));
};

export const clearSession = () => {
  localStorage.removeItem(storageKey);
};
