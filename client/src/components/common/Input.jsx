import React from 'react';

export const Input = ({
  label,
  id,
  type = 'text',
  error,
  icon: Icon = null,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
        <input
          id={id}
          type={type}
          className={`block w-full rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-2
            ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5
            ${
              error
                ? 'border-red-500 bg-red-50/50 text-red-950 focus:border-red-500 focus:ring-red-500/20 dark:bg-red-950/20 dark:text-red-100'
                : 'border-slate-200 bg-white text-slate-900 focus:border-brand-500 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
            }
          `}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs font-medium text-red-500 dark:text-red-400 mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
};
