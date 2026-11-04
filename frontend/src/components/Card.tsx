import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  padded?: boolean;
  children: ReactNode;
}

export const Card = ({ title, description, action, padded = true, children }: CardProps) => (
  <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
    {(title || action) && (
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          {title && <h2 className="text-sm font-semibold text-slate-800">{title}</h2>}
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
        {action}
      </header>
    )}
    <div className={padded ? 'p-5' : ''}>{children}</div>
  </section>
);
