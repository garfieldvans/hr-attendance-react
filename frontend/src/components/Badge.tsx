import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';

type Tone = 'brand' | 'neutral' | 'success' | 'danger';

const tones: Record<Tone, string> = {
  brand: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  danger: 'bg-rose-50 text-rose-600 ring-rose-100',
};

export const Badge = ({
  tone = 'neutral',
  icon: Icon,
  children,
}: {
  tone?: Tone;
  icon?: IconType;
  children: ReactNode;
}) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
  >
    {Icon && <Icon className="size-3 shrink-0" aria-hidden="true" />}
    {children}
  </span>
);
