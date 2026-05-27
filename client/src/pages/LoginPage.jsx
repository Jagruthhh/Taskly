import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';
import { 
  CheckSquare, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
});

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();

  // Micro-interactions focus states
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  // If already authenticated, redirect straight to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-brand-dark px-4 sm:px-6 lg:px-8 py-12 overflow-y-auto overflow-x-hidden selection:bg-brand-indigo/35">
      {/* Background Gradient Mesh Glows - vibrant enough to show through modal */}
      <div className="absolute top-[5%] left-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[5%] right-[-5%] w-[500px] h-[500px] rounded-full bg-teal-500/15 blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />

      {/* Main Clean Center Login Container */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col justify-center py-6">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-2 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-brand-indigo flex items-center justify-center shadow-indigo-glow group-hover:scale-105 transition-transform duration-300">
              <CheckSquare className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <span className="font-heading font-extrabold text-3xl tracking-wide text-white">
              Taskly
            </span>
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-xl w-full">
          {/* Accent decorative glow overlay */}
          <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-brand-indigo/10 blur-xl pointer-events-none" />
          
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-100 mb-2 text-center tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs text-brand-grayText text-center mb-8 font-medium">Please sign in to access your workspace.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Email Address
              </label>
              <div 
                className={`relative rounded-xl border transition-all duration-200 bg-slate-950/20 ${
                  errors.email 
                    ? 'border-red-500/50' 
                    : emailFocused 
                      ? 'border-brand-indigo/50 shadow-[0_0_12px_rgba(99,102,241,0.15)] bg-slate-950/40' 
                      : 'border-white/5 hover:border-white/10'
                }`}
              >
                <span className={`absolute inset-y-0 left-0 pl-3.5 flex items-center transition-colors duration-200 ${
                  emailFocused ? 'text-brand-indigo' : 'text-slate-500'
                }`}>
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 text-sm rounded-xl text-slate-200 bg-transparent outline-none"
                  {...register('email')}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1.5 font-medium pl-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <a href="#" className="text-xs font-bold text-brand-indigo hover:text-indigo-400 transition-colors">
                  Forgot?
                </a>
              </div>
              <div 
                className={`relative rounded-xl border transition-all duration-200 bg-slate-950/20 ${
                  errors.password 
                    ? 'border-red-500/50' 
                    : passwordFocused 
                      ? 'border-brand-indigo/50 shadow-[0_0_12px_rgba(99,102,241,0.15)] bg-slate-950/40' 
                      : 'border-white/5 hover:border-white/10'
                }`}
              >
                <span className={`absolute inset-y-0 left-0 pl-3.5 flex items-center transition-colors duration-200 ${
                  passwordFocused ? 'text-brand-indigo' : 'text-slate-500'
                }`}>
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-11 pr-4 py-3 text-sm rounded-xl text-slate-200 bg-transparent outline-none"
                  {...register('password')}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1.5 font-medium pl-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-brand-indigo hover:bg-indigo-600 text-white font-bold shadow-indigo-glow hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98] duration-200"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Log In to Account
                  <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Google Sign-In Divider & Button */}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>
          
          <button
            type="button"
            onClick={async () => {
              const res = await useAuthStore.getState().loginWithGoogle();
              if (res.success) navigate('/dashboard');
            }}
            className="w-full py-3 rounded-xl bg-slate-900 border border-white/5 hover:border-brand-indigo/35 text-slate-300 hover:text-white font-bold text-sm transition-all flex items-center justify-center gap-2.5 hover:bg-slate-800/40 active:scale-[0.98] duration-200"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.63 15.01 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3C6.27 7.56 8.91 5.04 12 5.04z" />
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.75-4.87 3.75-8.5z" />
              <path fill="#FBBC05" d="M5.36 14.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.5 6.9C.54 8.84 0 10.96 0 13.2s.54 4.36 1.5 6.3l3.86-3z" />
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.11.75-2.54 1.19-4.3 1.19-3.09 0-5.73-2.52-6.66-5.46L1.5 15.98C3.4 19.85 7.35 23 12 23z" />
            </svg>
            Continue with Google
          </button>

          {/* Prompt to register */}
          <div className="text-center mt-6 pt-6 border-t border-white/5">
            <p className="text-xs sm:text-sm text-brand-grayText">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-brand-indigo hover:text-indigo-400 transition-colors">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
