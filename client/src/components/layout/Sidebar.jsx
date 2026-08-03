import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiFileText, FiPlusCircle, FiX, FiInfo } from 'react-icons/fi';

export const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FiGrid },
    { name: 'Complaints Feed', path: '/complaints', icon: FiFileText },
    { name: 'Report Civic Issue', path: '/report', icon: FiPlusCircle }
  ];

  return (
    <>
      {/* Mobile Sidebar Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-45 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-46 flex w-64 flex-col border-r border-slate-200/80 bg-white pt-16 transition-transform duration-350 ease-in-out md:sticky md:top-16 md:z-30 md:h-[calc(100vh-4rem)] md:translate-x-0 dark:border-slate-800 dark:bg-slate-900
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Close Button on Mobile view */}
        <div className="absolute top-4 right-4 md:hidden">
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3.5 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group
                  ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                  }
                `}
              >
                <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Info panel in Sidebar bottom */}
        <div className="p-4 m-4 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800/60 text-xs flex flex-col gap-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-350">
            <FiInfo className="h-4 w-4 text-brand-500" />
            <span>Civic ICRS Portal</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Report civic issues including broken roads, street lights, and open manholes instantly. Computer Vision models will automatically classify uploads in Phase 2.
          </p>
        </div>
      </aside>
    </>
  );
};
