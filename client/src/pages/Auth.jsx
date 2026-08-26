import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import { AuthService } from '../services/AuthService';

export const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') === 'true') {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend validation: check if inputs are filled
    if (isLogin) {
      if (!email.trim() || !password.trim()) {
        setError('Please fill in both Email and Password fields.');
        return;
      }
    } else {
      if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
        setError('Please fill in all input fields.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Authenticate using the service
        const response = await AuthService.login(email, password);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        
        // Navigate to the main dashboard layout
        navigate('/dashboard');
      } else {
        // Register using the service
        const response = await AuthService.register(name, email, password);
        if (response.success) {
          // Log in automatically after registration
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('user', JSON.stringify(response.user));
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40 transition-colors duration-300">
      
      {/* Decorative blurred background shapes */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Auth Card Container */}
      <div className="w-full max-w-md glassmorphism rounded-2xl shadow-xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 transition-all duration-300 z-10">
        
        {/* Top Branding Section */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg shadow-brand-500/25 mb-4 animate-bounce">
            <span className="text-xl font-black tracking-tighter">IC</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
            {isLogin ? 'Welcome Back to ICRS' : 'Create an Account'}
          </h2>
          <p className="text-sm text-slate-505 dark:text-slate-400 mt-1.5 leading-relaxed">
            {isLogin 
              ? 'Enter credentials to report issues and access your dashboard' 
              : 'Join the Civic Response System to start contributing'
            }
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 text-xs font-semibold rounded-xl bg-red-50 text-red-600 border border-red-150 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30 transition-all duration-200">
              <FiAlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name Field (Signup Mode Only) */}
          {!isLogin && (
            <div className="space-y-1">
              <label htmlFor="name" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-550">
                  <FiUser className="h-4 w-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200/80 bg-white/60 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:focus:border-brand-500 dark:text-white transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-550">
                <FiMail className="h-4 w-4" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200/80 bg-white/60 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:focus:border-brand-500 dark:text-white transition-all duration-200"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Password
              </label>
              {isLogin && (
                <a href="#forgot" className="text-xs font-semibold text-brand-500 hover:text-brand-600 dark:hover:text-brand-400">
                  Forgot Password?
                </a>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-550">
                <FiLock className="h-4 w-4" />
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200/80 bg-white/60 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:focus:border-brand-500 dark:text-white transition-all duration-200"
              />
            </div>
          </div>

          {/* Confirm Password Field (Signup Mode Only) */}
          {!isLogin && (
            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-550">
                  <FiLock className="h-4 w-4" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200/80 bg-white/60 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:focus:border-brand-500 dark:text-white transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 active:scale-[0.98] rounded-xl transition-all duration-200 shadow-md shadow-brand-500/20 disabled:opacity-75 disabled:cursor-not-allowed group cursor-pointer"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <FiArrowRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform duration-200" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Footer Mode */}
        <div className="px-8 py-5 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-250/20 dark:border-slate-800/40 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isLogin ? "Don't have an account yet?" : 'Already have an account?'}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="ml-1.5 font-bold text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 hover:underline cursor-pointer"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
