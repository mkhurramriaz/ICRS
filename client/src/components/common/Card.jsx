import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-all duration-300
        ${hoverEffect ? 'hover:shadow-md hover:-translate-y-0.5' : ''}
        ${className}
      `}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-4 mb-4">
          <div>
            {title && (
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
