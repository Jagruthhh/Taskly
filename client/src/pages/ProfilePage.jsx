import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore.js';
import Sidebar from '../components/Sidebar.jsx';
import { 
  User, 
  Lock, 
  Settings, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Palette 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { 
    user, 
    stats, 
    fetchProfileStats, 
    updateProfile, 
    changePassword 
  } = useAuthStore();

  // Profile fields state
  const [profileName, setProfileName] = useState('');
  const [avatarInitials, setAvatarInitials] = useState('');
  const [avatarColor, setAvatarColor] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preset background colors for SVG initials avatars
  const AVATAR_COLORS = [
    { value: '#6366F1', label: 'Indigo' },
    { value: '#10B981', label: 'Emerald' },
    { value: '#F59E0B', label: 'Amber' },
    { value: '#EF4444', label: 'Red' },
    { value: '#3B82F6', label: 'Blue' },
    { value: '#EC4899', label: 'Pink' }
  ];

  // Load user data and stats on mount
  useEffect(() => {
    fetchProfileStats();
    if (user) {
      setProfileName(user.name || '');
      const avatar = user.avatar || { initials: 'US', bgColor: '#6366F1', imageUrl: '' };
      setAvatarInitials(avatar.initials || '');
      setAvatarColor(avatar.bgColor || '#6366F1');
      setAvatarUrl(avatar.imageUrl || '');
    }
  }, [user]);

  // Handle profile update submit
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toast.error('Full name is required');
      return;
    }

    const payload = {
      name: profileName,
      avatar: {
        initials: avatarInitials.trim().slice(0, 2).toUpperCase() || 'US',
        bgColor: avatarColor,
        imageUrl: avatarUrl.trim()
      }
    };

    const result = await updateProfile(payload);
    if (result.success) {
      fetchProfileStats();
    }
  };

  // Handle password change submit
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    const result = await changePassword(currentPassword, newPassword);
    if (result.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  // Preview generated initials avatar
  const renderAvatarPreview = () => {
    if (avatarUrl.trim()) {
      return (
        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-brand-indigo shadow-indigo-glow shrink-0 bg-slate-800">
          <img 
            src={avatarUrl} 
            alt="Avatar Preview" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.style.backgroundColor = avatarColor;
              e.target.parentNode.innerHTML = `<span class="text-white font-bold text-2xl">${avatarInitials || 'US'}</span>`;
            }}
          />
        </div>
      );
    }

    return (
      <div 
        className="w-20 h-20 rounded-2xl flex items-center justify-center border-2 border-white/10 shrink-0 font-heading text-2xl font-extrabold text-white transition-all shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
        style={{ backgroundColor: avatarColor || '#6366F1' }}
      >
        {avatarInitials || 'US'}
      </div>
    );
  };

  return (
    <div className="flex bg-brand-dark min-h-screen text-slate-100 relative">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content body */}
      <main className="flex-1 px-4 sm:px-8 py-8 overflow-y-auto max-w-5xl mx-auto w-full">
        
        {/* Page title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-brand-indigo/15 border border-brand-indigo/30 flex items-center justify-center text-brand-indigo">
            <Settings className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">Profile Configurations</h1>
            <p className="text-sm text-brand-grayText">Manage credentials, SVG identities, and monitor task completion stats.</p>
          </div>
        </div>

        {/* Dynamic task statistics board grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {/* Card 1: Completed Tasks */}
          <div className="glass-card rounded-2xl p-5 border border-white/5 flex items-center gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 glow-mesh-2 opacity-50 pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Completed Tasks</p>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">{stats?.completedTasks || 0}</h3>
            </div>
          </div>

          {/* Card 2: Active Tasks */}
          <div className="glass-card rounded-2xl p-5 border border-white/5 flex items-center gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 glow-mesh-1 opacity-50 pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Active Tasks</p>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">{stats?.activeTasks || 0}</h3>
            </div>
          </div>

          {/* Card 3: High Priority items */}
          <div className="glass-card rounded-2xl p-5 border border-white/5 flex items-center gap-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">High Priority Tasks</p>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">{stats?.highPriority || 0}</h3>
            </div>
          </div>
        </section>

        {/* Configuration settings panel split */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Column A: Edit Profile Specifications */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 shadow-glass">
            <h2 className="font-heading font-extrabold text-xl text-white mb-6 flex items-center gap-2">
              <User className="w-5.5 h-5.5 text-brand-indigo" />
              User Specifications
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              
              {/* Avatar Preview & Customizer */}
              <div className="flex items-center gap-4 bg-slate-950/20 p-4 rounded-2xl border border-white/5">
                {renderAvatarPreview()}
                <div>
                  <h4 className="font-semibold text-sm text-slate-200 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-brand-indigo" />
                    SVG Avatar Customizer
                  </h4>
                  <p className="text-xs text-brand-grayText mt-0.5">Toggle background color blocks or add initials.</p>
                </div>
              </div>

              {/* Edit Initials and BG Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Initials
                  </label>
                  <input
                    type="text"
                    maxLength="2"
                    placeholder="JD"
                    value={avatarInitials}
                    onChange={(e) => setAvatarInitials(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl text-slate-200 glass-input font-bold text-sm text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Background Color
                  </label>
                  <div className="flex flex-wrap gap-1.5 justify-center items-center h-full min-h-[42px]">
                    {AVATAR_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setAvatarColor(c.value)}
                        className={`w-6 h-6 rounded-full border transition-all ${
                          avatarColor === c.value 
                            ? 'border-white scale-110 shadow-glass ring-2 ring-brand-indigo/40' 
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Avatar Image URL input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Avatar Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-slate-200 glass-input text-xs"
                />
              </div>

              {/* Full Name input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Display Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-slate-200 glass-input text-sm font-medium"
                  required
                />
              </div>

              {/* Submit Update Profile */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-brand-indigo hover:bg-indigo-600 text-white font-bold transition-all shadow-indigo-glow hover:shadow-[0_0_20px_rgba(99,102,241,0.55)] flex items-center justify-center"
              >
                Save Profile Changes
              </button>

            </form>
          </div>

          {/* Column B: Modify Password */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5 shadow-glass">
            <h2 className="font-heading font-extrabold text-xl text-white mb-6 flex items-center gap-2">
              <Lock className="w-5.5 h-5.5 text-brand-indigo" />
              Security Settings
            </h2>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Current Password *
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-slate-200 glass-input text-sm"
                  required
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  New Password *
                </label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-slate-200 glass-input text-sm"
                  required
                />
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-slate-200 glass-input text-sm"
                  required
                />
              </div>

              {/* Submit password changes */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold border border-white/5 hover:border-brand-indigo/30 transition-all flex items-center justify-center gap-1.5 group pt-3"
              >
                <ShieldCheck className="w-4.5 h-4.5 text-brand-indigo group-hover:scale-105 transition-transform" />
                Change Account Password
              </button>

            </form>
          </div>

        </section>

      </main>
    </div>
  );
}
