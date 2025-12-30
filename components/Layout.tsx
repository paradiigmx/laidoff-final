
import React, { useState, useEffect, useRef } from 'react';
import { AppView, UserProfile } from '../types';
import { getUserProfile } from '../services/storageService';

interface LayoutProps {
  currentView: AppView;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onChangeView: (view: AppView) => void;
  children: React.ReactNode;
  hasResume: boolean;
}

const ProfileWidget: React.FC<{ onEditProfile: () => void }> = ({ onEditProfile }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadProfile = () => {
      const saved = getUserProfile();
      setProfile(saved);
    };
    loadProfile();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ds_profile') {
        loadProfile();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    const handleProfileUpdate = () => loadProfile();
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = profile?.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-colors w-full"
      >
        {profile?.imageUrl ? (
          <img src={profile.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-slate-600" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            {initials}
          </div>
        )}
        <div className="text-left flex-1 min-w-0">
          <div className="text-sm font-bold text-white truncate">{profile?.name || 'Set Up Profile'}</div>
          <div className="text-xs text-slate-400 truncate capitalize">{profile?.jobStatus?.replace('-', ' ') || 'Click to get started'}</div>
        </div>
        <span className="text-slate-400 text-xs">{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4">
            <div className="flex items-center gap-4 mb-4">
              {profile?.imageUrl ? (
                <img src={profile.imageUrl} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-slate-600" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold text-white truncate">{profile?.name || 'Guest User'}</div>
                <div className="text-sm text-slate-400 capitalize truncate">{profile?.jobStatus?.replace('-', ' ') || 'Not set'}</div>
              </div>
            </div>
            {profile?.currentJobTitle && (
              <div className="text-sm text-slate-300 mb-1 truncate">💼 {profile.currentJobTitle}{profile.currentCompany ? ` at ${profile.currentCompany}` : ''}</div>
            )}
            {(profile?.city || profile?.state) && (
              <div className="text-sm text-slate-300 mb-3 truncate">📍 {profile.city ? `${profile.city}, ` : ''}{profile.state || ''}</div>
            )}
            <button
              onClick={() => { setIsOpen(false); onEditProfile(); }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const Layout: React.FC<LayoutProps> = ({ currentView, darkMode, onToggleDarkMode, onChangeView, children, hasResume }) => {
  const navItems = [
    { id: AppView.HOME, label: 'Hub', icon: '🏠' },
    { id: AppView.RESUME, label: 'Resume Lab', icon: '✨' },
    { id: AppView.JOBS, label: 'Job Hunter', icon: '🔍' },
    { id: AppView.MONEY, label: 'Gigs', icon: '💸' },
    { id: AppView.MONETIZATION, label: 'Monetization', icon: '📈' },
    { id: AppView.UNEMPLOYMENT, label: 'Unemployment', icon: '🏛️' },
    { id: AppView.ASSISTANCE, label: 'Assistance', icon: '🤝' },
    { id: AppView.COACH, label: 'Coaching', icon: '🧠' },
    { id: AppView.FOUNDER, label: 'Founder', icon: '🚀' },
    { id: AppView.SETTINGS, label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 dark:bg-slate-900 text-white flex-shrink-0 flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-300 bg-clip-text text-transparent">
            DreamShift
          </h1>
          <p className="text-xs text-slate-400 mt-1">Powered by Gemini 2.5</p>
        </div>

        <div className="p-4 border-b border-slate-700">
          <ProfileWidget onEditProfile={() => onChangeView(AppView.PROFILE)} />
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              title={`Switch to ${item.label}`}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                currentView === item.id
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              {item.id === AppView.FOUNDER && (
                  <span className="ml-auto text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 px-1.5 py-0.5 rounded">NEW</span>
              )}
              {item.id === AppView.COACH && (
                  <span className="ml-auto text-[10px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded">HOT</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700 bg-slate-900/50">
          <div className="text-xs text-slate-500 text-center">
            &copy; {new Date().getFullYear()} DreamShift
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
         <div className="absolute top-0 left-0 w-full h-full opacity-5 dark:opacity-10 pointer-events-none bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]" />
        
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-8 justify-between shadow-sm z-10 flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
            {currentView === AppView.HOME && "Your Personal Hub"}
            {currentView === AppView.RESUME && "AI Resume Enhancer"}
            {currentView === AppView.JOBS && "Smart Job Search"}
            {currentView === AppView.MONEY && "Gig Economy & Income Resources"}
            {currentView === AppView.MONETIZATION && "Online Monetization Channels"}
            {currentView === AppView.UNEMPLOYMENT && "Unemployment & Layoff Resources"}
            {currentView === AppView.ASSISTANCE && "Financial & Healthcare Assistance"}
            {currentView === AppView.FOUNDER && "Founder: Business Starter"}
            {currentView === AppView.PROFILE && "My Career Profile"}
            {currentView === AppView.COACH && "AI Career Coach"}
            {currentView === AppView.SETTINGS && "Application Settings"}
          </h2>
          <div className="flex items-center space-x-6">
             <button 
                onClick={onToggleDarkMode}
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
             >
                {darkMode ? '☀️' : '🌙'}
             </button>
             <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">System Online</span>
             </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
