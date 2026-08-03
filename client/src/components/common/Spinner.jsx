import React from 'react';
import { ImSpinner2 } from 'react-icons/im';

export const Spinner = ({
  size = 'md',
  fullPage = false,
  message,
  className = ''
}) => {
  const sizes = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const spinnerContent = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <ImSpinner2 className={`animate-spin text-brand-500 ${sizes[size]}`} />
      {message && (
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {message}
        </span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/60 dark:bg-slate-950/80 backdrop-blur-sm">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};
