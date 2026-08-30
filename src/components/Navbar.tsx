import React from 'react';
import { Sparkles, Plus, BarChart3, LayoutDashboard, LogIn, LogOut, User, ShieldCheck } from 'lucide-react';
import type { UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'new-entry' | 'insights';
  setActiveTab: (tab: 'dashboard' | 'new-entry' | 'insights') => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  totalEntries: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onSignOut,
  totalEntries,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-50/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 via-amber-700 to-stone-900 flex items-center justify-center text-white shadow-sm shadow-amber-900/10">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold tracking-tight text-stone-900">
                  Personal Gemini Journal
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                  APAC Ideathon
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden md:block">
                AI-Guided Reflection, Brainstorming & Insights
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              id="nav-dashboard-btn"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <button
              id="nav-insights-btn"
              onClick={() => setActiveTab('insights')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'insights'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>Mood Insights</span>
            </button>

            <button
              id="nav-new-entry-btn"
              onClick={() => setActiveTab('new-entry')}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">New Journal</span>
              <span className="sm:hidden">Write</span>
            </button>
          </nav>

          {/* User Profile & Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-full pl-2 pr-3 py-1 text-xs text-stone-700">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-6 h-6 rounded-full object-cover border border-stone-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs">
                      {user.displayName?.[0]?.toUpperCase() || <User className="w-3.5 h-3.5" />}
                    </div>
                  )}
                  <span className="font-medium max-w-[90px] sm:max-w-[120px] truncate">
                    {user.displayName || user.email?.split('@')[0] || 'Guest User'}
                  </span>
                  <div className="hidden sm:flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-full font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Firestore Sync</span>
                  </div>
                </div>

                <button
                  id="signout-btn"
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="signin-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Sync</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
