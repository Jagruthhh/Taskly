import React, { useEffect, Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore.js';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

// Premium Error Boundary Component to capture and display runtime crashes
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Taskly Runtime Crash Captured:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 text-slate-100 selection:bg-red-500 selection:text-white">
          <div className="glass-card rounded-3xl p-8 max-w-2xl w-full border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
            <h1 className="font-heading font-extrabold text-2xl text-red-400 mb-2 flex items-center gap-2">
              ⚠️ Taskly Runtime Exception
            </h1>
            <p className="text-sm text-slate-400 mb-6">
              A frontend runtime crash was intercepted. Below is the technical breakdown to help diagnose:
            </p>
            
            <div className="bg-slate-950/80 p-4 rounded-xl border border-white/5 overflow-x-auto font-mono text-xs text-red-300 mb-6 max-h-[250px] leading-relaxed">
              <strong>Error:</strong> {this.state.error?.toString() || 'Unknown Error'}
              {this.state.errorInfo && (
                <pre className="mt-3 text-slate-400 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/';
              }}
              className="px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all"
            >
              Reset Session Cache & Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Protected Route wrapper component
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center text-slate-500 gap-3">
        <div className="w-12 h-12 border-4 border-brand-indigo border-t-transparent rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-widest font-heading font-bold text-brand-indigo animate-pulse">
          Authenticating Session
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  useEffect(() => {
    // Register the auth listener ONCE. Returns an unsubscribe fn for cleanup.
    const unsubscribe = useAuthStore.getState().initAuthListener();
    return () => unsubscribe?.();
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'glass-card text-slate-200 border border-white/5',
            duration: 3500,
            style: {
              background: 'rgba(17, 24, 39, 0.9)',
              backdropFilter: 'blur(8px)',
              color: '#F1F5F9',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            }
          }}
        />

        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
