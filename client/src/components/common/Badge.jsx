import React from 'react';

export const Badge = ({
  children,
  variant = 'slate',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center font-semibold rounded-full tracking-wide';
  
  const variants = {
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350',
    primary: 'bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-350',
    success: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-350',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-350',
    danger: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-350',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-350',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-350'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] leading-3',
    md: 'px-2.5 py-1 text-xs leading-4',
    lg: 'px-3 py-1.5 text-sm leading-5'
  };

  return (
    <span
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
