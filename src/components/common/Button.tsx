import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F17] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const sizeStyles = {
    xs: 'px-2 py-1 text-xs gap-1.5',
    sm: 'px-3 py-1.5 text-xs font-medium gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-sky-500 hover:bg-sky-450 text-white shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 focus:ring-sky-500 active:scale-[0.98]',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/70 hover:border-slate-600 focus:ring-slate-500',
    danger: 'bg-rose-600/90 hover:bg-rose-600 text-white shadow-lg shadow-rose-600/20 focus:ring-rose-500 active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white focus:ring-slate-500',
    outline: 'bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800/40 hover:text-white hover:border-slate-600 focus:ring-slate-500',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={size === 'xs' || size === 'sm' ? 14 : 16} className="animate-spin text-current" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
