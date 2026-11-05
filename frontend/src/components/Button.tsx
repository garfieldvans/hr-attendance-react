import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-200',
  secondary:
    'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-200',
  ghost: 'text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-200',
  danger: 'border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 focus-visible:ring-rose-100',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
    disabled={disabled || loading}
    {...props}
  >
    {loading && (
      <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
    )}
    {children}
  </button>
);
