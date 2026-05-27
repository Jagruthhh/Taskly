import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';
import { 
  CheckSquare, 
  ArrowRight, 
  Shield, 
  Sparkles, 
  Layers, 
  ListFilter 
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  // If already logged in, skip landing and head straight to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col bg-brand-dark">
      {/* Background glowing gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full glow-mesh-1 animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full glow-mesh-2 animate-pulse-slow pointer-events-none" />

      {/* Header / Navbar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-indigo flex items-center justify-center shadow-indigo-glow">
            <CheckSquare className="w-5.5 h-5.5 text-white" />
          </div>
          <span className="font-heading font-bold text-2xl tracking-wide bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Taskly
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            to="/login" 
            className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-xl transition-all hover:bg-white/5 border border-transparent hover:border-white/5"
          >
            Log In
          </Link>
          <Link 
            to="/register" 
            className="text-sm font-semibold bg-brand-indigo hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl shadow-indigo-glow hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all flex items-center gap-1.5"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-6 py-12 text-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border border-brand-indigo/35 text-xs text-brand-indigo font-bold tracking-wider uppercase mb-8 animate-float">
          <Sparkles className="w-3.5 h-3.5" />
          Next-Gen Productive Experience
        </div>

        {/* Hero title */}
        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl md:text-7xl leading-tight mb-6 bg-gradient-to-b from-white via-slate-100 to-slate-500 bg-clip-text text-transparent tracking-tight max-w-4xl">
          Streamline your day, <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-indigo via-purple-400 to-brand-teal bg-clip-text text-transparent">
            one task at a time.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-400 max-w-2xl leading-relaxed mb-10">
          Meet Taskly. A beautifully responsive, glassmorphic task manager designed to keep you organized, fluid, and ahead of schedule with zero clutter.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 w-full max-w-md">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-indigo hover:bg-indigo-600 text-white font-bold shadow-indigo-glow hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all flex items-center justify-center gap-2"
          >
            Create Your Account
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-card text-slate-200 hover:text-white font-semibold hover:border-white/20 transition-all flex items-center justify-center"
          >
            Try Live Demo
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {/* Card 1 */}
          <div className="glass-card rounded-3xl p-6 border border-white/5 relative overflow-hidden group hover:border-brand-indigo/35 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 glow-mesh-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-brand-indigo/10 flex items-center justify-center text-brand-indigo mb-5 border border-brand-indigo/20">
              <ListFilter className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-100 mb-2">Smart Sorting</h3>
            <p className="text-sm text-brand-grayText leading-relaxed">
              Filter tasks effortlessly by categories, custom priority indicators, and real-time title search.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card rounded-3xl p-6 border border-white/5 relative overflow-hidden group hover:border-brand-teal/35 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 glow-mesh-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal mb-5 border border-brand-teal/20">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-100 mb-2">Drag & Drop</h3>
            <p className="text-sm text-brand-grayText leading-relaxed">
              Organize priorities visually. Reorder tasks instantly in real-time with responsive touch-friendly drag handles.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card rounded-3xl p-6 border border-white/5 relative overflow-hidden group hover:border-purple-500/35 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-5 border border-purple-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-100 mb-2">Secure Syncing</h3>
            <p className="text-sm text-brand-grayText leading-relaxed">
              Rest assured your items are stored safely behind production-grade JWT and encrypted credential walls.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-grayText gap-4">
        <span>© {new Date().getFullYear()} Taskly Inc. Built with React & Node.js.</span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Contact Support</a>
        </div>
      </footer>
    </div>
  );
}
