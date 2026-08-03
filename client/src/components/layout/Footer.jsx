import React from 'react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white py-6 dark:border-slate-800 dark:bg-slate-900 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:flex md:items-center md:justify-between">
        <div className="flex justify-center space-x-6 md:order-2">
          <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-950/30 dark:text-green-400">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500"></span>
            All Systems Operational
          </span>
        </div>
        <div className="mt-4 md:order-1 md:mt-0">
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Intelligent Civic Response System (ICRS). All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
