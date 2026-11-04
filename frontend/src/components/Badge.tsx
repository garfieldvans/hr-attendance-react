import type { ReactNode } from 'react';

type Tone = 'brand' | 'neutral' | 'success' | 'danger';

const tones: Record<Tone, string> = {
  brand: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  danger: 'bg-rose-50 text-rose-600 ring-rose-100',
};

export const Badge = ({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
  >
    {children}
  </span>
);
