import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  active?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  active = false,
  glass = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-xl transition-all duration-150 ${
        glass
          ? 'bg-[#111827]/80 backdrop-blur-md border border-white/[0.08]'
          : 'bg-[#111827] border border-slate-800'
      } ${
        hoverable ? 'hover:border-slate-700 hover:bg-[#151E2E] cursor-pointer' : ''
      } ${
        active ? 'border-sky-500/80 ring-1 ring-sky-500/50' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
