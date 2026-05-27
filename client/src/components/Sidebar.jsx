import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';
import StreakBadge from './StreakBadge.jsx';
import { 
  CheckSquare, 
  User, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      to: '/profile',
      label: 'Profile Settings',
      icon: User
    }
  ];

  // Safely grab avatar properties
  const avatar = user?.avatar || { initials: 'US', bgColor: '#6366F1', imageUrl: '' };

  return (
    <aside 
      className={`glass-card border-y-0 border-l-0 min-h-screen sticky top-0 flex flex-col z-20 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className={`p-6 border-b border-white/5 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-indigo flex items-center justify-center shadow-indigo-glow">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-xl tracking-wide bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Taskly
            </span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-9 h-9 rounded-lg bg-brand-indigo flex items-center justify-center shadow-indigo-glow">
            <CheckSquare className="w-5.5 h-5.5 text-white" />
          </div>
        )}
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex w-6 h-6 items-center justify-center rounded-md border border-white/10 hover:border-brand-indigo/50 hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User Info Capsule */}
      <div className={`p-4 border-b border-white/5 flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-white/10"
          style={{ backgroundColor: avatar.imageUrl ? 'transparent' : (avatar.bgColor || '#6366F1') }}
        >
          {avatar.imageUrl ? (
            <img 
              src={avatar.imageUrl} 
              alt={user?.name || 'User avatar'} 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fail-safe if image URL is invalid
                e.target.style.display = 'none';
                e.target.parentNode.style.backgroundColor = avatar.bgColor || '#6366F1';
                e.target.parentNode.innerHTML = `<span class="text-white font-bold text-sm">${avatar.initials || 'US'}</span>`;
              }}
            />
          ) : (
            <span className="text-white font-bold text-sm">{avatar.initials || 'US'}</span>
          )}
        </div>
        
        {!isCollapsed && (
          <div className="overflow-hidden flex-1">
            <div className="flex items-center gap-2 max-w-full">
              <h4 className="font-medium text-sm text-slate-200 truncate">{user?.name}</h4>
              <StreakBadge count={user?.streak || 0} />
            </div>
            <p className="text-xs text-brand-grayText truncate">{user?.email}</p>
          </div>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-brand-indigo/15 text-brand-indigo border border-brand-indigo/35 shadow-[0_0_15px_rgba(99,102,241,0.08)]' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/3 border border-transparent'
                } ${isCollapsed ? 'justify-center' : 'justify-start'}`
              }
            >
              <Icon className="w-5.5 h-5.5 shrink-0 group-hover:scale-105 transition-transform" />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer (Logout) */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-red-400 hover:text-red-200 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all group ${
            isCollapsed ? 'justify-center' : 'justify-start'
          }`}
        >
          <LogOut className="w-5.5 h-5.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          {!isCollapsed && <span className="text-sm font-medium">Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
