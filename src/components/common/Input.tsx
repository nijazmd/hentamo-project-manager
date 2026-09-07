import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-slate-500 pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-[#0B0F17] border border-slate-800 rounded-lg text-slate-100 text-sm placeholder-slate-500 transition-all focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:opacity-50 ${
            leftIcon ? 'pl-9 pr-3 py-2' : 'px-3 py-2'
          } ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1 text-xs text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full bg-[#0B0F17] border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm placeholder-slate-500 transition-all focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:opacity-50 min-h-[90px] ${
          error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : ''
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  className = '',
  children,
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full bg-[#0B0F17] border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-sm transition-all focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:opacity-50 cursor-pointer ${
          error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-rose-400 font-medium">{error}</p>}
    </div>
  );
};
