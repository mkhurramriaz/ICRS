import React, { useState, useEffect } from 'react';
import { FiSun, FiMoon, FiMenu, FiBell, FiAlertCircle, FiLogOut } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('icrs_theme') === 'dark' ||
      (!('icrs_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    // Load dynamic user info if authenticated
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user details:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('icrs_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('icrs_theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 dark:border-slate-800 dark:bg-slate-900/85 backdrop-blur-md transition-colors duration-200 shadow-xs">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left Side: Menu Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 active:scale-95 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Toggle Navigation Sidebar"
          >
            <FiMenu className="h-5 w-5" />
          </button>
          
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/20">
              <span className="text-base font-black tracking-tighter">IC</span>
            </div>
            <span className="hidden text-lg font-black tracking-tight text-slate-850 sm:block dark:text-white">
              ICRS <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider ml-1">Phase 1</span>
            </span>
          </Link>
        </div>

        {/* Right Side: Quick controls */}
        <div className="flex items-center gap-3">
          {/* AI Banner Badge */}
          <div className="hidden items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400 md:flex">
            <FiAlertCircle className="h-3.5 w-3.5" />
            <span>AI Verification: Simulated</span>
          </div>

          {/* Theme Toggler */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-xl p-2.5 text-slate-500 border border-slate-200/50 hover:bg-slate-100 hover:text-slate-800 active:scale-95 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all duration-200"
            aria-label="Toggle Dark/Light Mode"
          >
            {darkMode ? <FiSun className="h-4.5 w-4.5" /> : <FiMoon className="h-4.5 w-4.5" />}
          </button>

          {/* Notifications Placeholder */}
          <div className="relative">
            <button
              className="rounded-xl p-2.5 text-slate-500 border border-slate-200/50 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all duration-200"
              aria-label="View notifications"
            >
              <FiBell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500"></span>
              </span>
            </button>
          </div>

          {/* User profile avatar info & Logout button */}
          <div className="flex items-center gap-3 pl-1 border-l border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-500 to-emerald-450 p-[1.5px] shadow-sm">
                <img
                  src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"}
                  alt="Citizen Profile"
                  className="h-full w-full rounded-[10px] object-cover bg-white"
                />
              </div>
              <div className="hidden flex-col text-left md:flex">
                <span className="text-xs font-bold leading-none text-slate-800 dark:text-slate-200">
                  {user?.name || "Khurram Shahzad"}
                </span>
                <span className="text-[10px] leading-none text-slate-400 mt-0.5 capitalize">
                  {user?.role || "Citizen"}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-xl p-2.5 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-95 border border-transparent hover:border-red-200/30 transition-all duration-200 cursor-pointer"
              aria-label="Logout"
              title="Logout"
            >
              <FiLogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
