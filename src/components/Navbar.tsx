import { useState } from 'react';
import {
  Music,
  BarChart3,
  RefreshCw,
  WifiOff,
  Lock,
  Settings,
  LogOut,
  Sparkles,
  FileSpreadsheet,
  Clock,
  ListOrdered,
  StickyNote,
  Trophy,
} from 'lucide-react';
import { SyncState, UserAuthProfile } from '../types';
import { soundService } from '../services/audio';
import { MaestrosoLogo } from './MaestrosoLogo';

interface NavbarProps {
  activeTab: 'repertoire' | 'history' | 'analytics';
  onSelectTab: (tab: 'repertoire' | 'history' | 'analytics') => void;
  syncState: SyncState;
  onOpenSyncModal: () => void;
  onTriggerSync: () => void;
  isOnline: boolean;
  userProfile: UserAuthProfile | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenSettings: () => void;
  pinEnabled: boolean;
  onLockApp: () => void;
  onOpenAiAssistant: () => void;
  onOpenTimer: () => void;
  onOpenQuickNotes?: () => void;
  quickNotesCount?: number;
  onOpenMilestones?: () => void;
  unlockedMilestonesCount?: number;
}

export function Navbar({
  activeTab,
  onSelectTab,
  syncState,
  onOpenSyncModal,
  onTriggerSync,
  isOnline,
  userProfile,
  onSignIn,
  onSignOut,
  onOpenSettings,
  pinEnabled,
  onLockApp,
  onOpenAiAssistant,
  onOpenTimer,
  onOpenQuickNotes,
  quickNotesCount = 0,
  onOpenMilestones,
  unlockedMilestonesCount = 0,
}: NavbarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-xl border-b border-[#DE72B5]/20 px-3 sm:px-6 py-2.5 sm:py-3"
      style={{
        background: 'linear-gradient(180deg, rgba(29, 15, 34, 0.96) 0%, rgba(24, 11, 29, 0.92) 100%)',
        boxShadow: '0 4px 20px -2px rgba(15, 5, 19, 0.7)',
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-2.5">
        {/* Top Row: Brand, Desktop Nav Tabs, and Quick Action Icons */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          {/* Brand & Desktop Tab Navigation */}
          <div className="flex items-center gap-3 lg:gap-6 min-w-0 shrink">
            <div
              onClick={() => onSelectTab('repertoire')}
              className="cursor-pointer select-none shrink-0 transition-transform active:scale-95 min-w-0"
              title="Maestroso — Piano Practice Tracker"
            >
              <MaestrosoLogo size="md" showSubtitle={true} />
            </div>

            {/* Desktop Navigation Tabs (Hidden on Mobile, shown on MD and up) */}
            <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-[#2D1A36]/80 border border-[#B63E88]/30 shadow-inner shrink-0">
              <button
                id="nav-repertoire-tab"
                onClick={() => {
                  soundService.playSlideClick();
                  onSelectTab('repertoire');
                }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'repertoire'
                    ? 'majestic-btn-primary font-bold'
                    : 'text-[#B8A9C2] hover:text-white hover:bg-[#40234D]/60'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Repertoire</span>
              </button>

              <button
                id="nav-history-tab"
                onClick={() => {
                  soundService.playSlideClick();
                  onSelectTab('history');
                }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'majestic-btn-primary font-bold'
                    : 'text-[#B8A9C2] hover:text-white hover:bg-[#40234D]/60'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Practice Log</span>
              </button>

              <button
                id="nav-analytics-tab"
                onClick={() => {
                  soundService.playSlideClick();
                  onSelectTab('analytics');
                }}
                title="View Practice Progress & Analytics Charts"
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'analytics'
                    ? 'majestic-btn-primary font-bold shadow-md ring-1 ring-[#DE72B5]/50'
                    : 'text-[#B8A9C2] hover:text-white hover:bg-[#40234D]/60'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-[#DE72B5]" />
                <span>Progress &amp; Charts</span>
              </button>
            </nav>
          </div>

          {/* Right Actions: Quick Notes, Timer, AI Assistant, Sync status, Lock, User, Settings */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Milestones & Honors Button */}
            {onOpenMilestones && (
              <button
                id="nav-milestones-btn"
                onClick={() => {
                  soundService.playSlideClick();
                  onOpenMilestones();
                }}
                className="majestic-btn-secondary px-2 sm:px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 shrink-0 text-amber-200 border-amber-500/30"
                title="Milestones, Achievements & Celebrations"
              >
                <Trophy className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">Honors</span>
                {unlockedMilestonesCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-bold flex items-center justify-center -ml-0.5">
                    {unlockedMilestonesCount}
                  </span>
                )}
              </button>
            )}

            {/* Quick Notes Trigger Button */}
            {onOpenQuickNotes && (
              <button
                id="nav-quick-notes-btn"
                onClick={() => {
                  soundService.playSlideClick();
                  onOpenQuickNotes();
                }}
                className="majestic-btn-secondary px-2 sm:px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 shrink-0 relative"
                title="Open Practice Quick Notes & Ephemeral Feed"
              >
                <StickyNote className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">Notes</span>
                {quickNotesCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#B63E88] text-white text-[9px] font-bold flex items-center justify-center -ml-0.5">
                    {quickNotesCount > 9 ? '9+' : quickNotesCount}
                  </span>
                )}
              </button>
            )}

            {/* Quick Practice Timer Button */}
            <button
              id="nav-timer-btn"
              onClick={() => {
                soundService.playSlideClick();
                onOpenTimer();
              }}
              className="majestic-btn-silver px-2 sm:px-3 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 shrink-0"
              title="Launch Practice Timer & Metronome"
            >
              <Clock className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Timer</span>
            </button>

            {/* AI Chat Assistant Trigger Button */}
            <button
              id="nav-ai-assistant-btn"
              onClick={() => {
                soundService.playSlideClick();
                onOpenAiAssistant();
              }}
              className="majestic-btn-primary px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-95 shrink-0"
              title="Open AI Practice Chat Assistant"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden md:inline">AI Chat</span>
            </button>

            {/* Sheets Sync Status Badge */}
            <button
              id="nav-sync-status-btn"
              onClick={onOpenSyncModal}
              className={`majestic-btn-secondary px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                syncState.isSyncing ? 'text-amber-300 border-amber-500/50' : ''
              }`}
              title="Google Sheets sync status"
            >
              {isOnline ? (
                <FileSpreadsheet className="w-4 h-4 text-[#DE72B5]" />
              ) : (
                <WifiOff className="w-4 h-4 text-amber-400" />
              )}
              <span className="hidden xl:inline">
                {syncState.isSyncing ? 'Syncing...' : isOnline ? 'Sheets' : 'Offline'}
              </span>
              <RefreshCw
                onClick={(e) => {
                  e.stopPropagation();
                  onTriggerSync();
                }}
                className={`w-3 h-3 text-[#B8A9C2] hover:text-white hidden xs:inline-block ${
                  syncState.isSyncing ? 'animate-spin text-amber-300' : ''
                }`}
              />
            </button>

            {/* PIN Lock Trigger */}
            {pinEnabled && (
              <button
                id="lock-app-btn"
                onClick={onLockApp}
                title="Lock with PIN"
                className="majestic-btn-secondary p-1.5 sm:p-2 rounded-xl text-[#B8A9C2] hover:text-white transition-colors shrink-0"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            )}

            {/* User Sign In / Profile */}
            {userProfile ? (
              <div className="relative shrink-0">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-xl border border-[#B63E88]/40 hover:border-[#DE72B5] transition-colors bg-[#2D1A36]"
                  title="User Profile & Settings"
                >
                  {userProfile.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt={userProfile.displayName || 'User'}
                      className="w-6 h-6 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-[#B63E88] text-white flex items-center justify-center text-xs font-bold">
                      {userProfile.displayName?.[0] || 'U'}
                    </div>
                  )}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 majestic-card rounded-2xl p-2.5 shadow-2xl z-50 text-xs text-white">
                    <div className="px-2.5 py-2 border-b border-[#4D2B5B]">
                      <p className="font-bold text-white truncate">{userProfile.displayName}</p>
                      <p className="text-[11px] text-[#B8A9C2] truncate">{userProfile.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenSyncModal();
                      }}
                      className="w-full text-left px-2.5 py-2 hover:bg-[#40234D] rounded-xl transition-colors flex items-center gap-2 mt-1"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#DE72B5]" />
                      Google Sheets Sync
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-2.5 py-2 hover:bg-rose-900/40 text-rose-300 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="google-sign-in-btn"
                onClick={onSignIn}
                className="majestic-btn-secondary px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 shrink-0"
                title="Sign in with Google"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Settings Button */}
            <button
              id="nav-settings-btn"
              onClick={onOpenSettings}
              title="Maestroso Settings"
              className="majestic-btn-secondary p-1.5 sm:p-2 rounded-xl text-[#B8A9C2] hover:text-white shrink-0"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs (Dedicated Segmented Control on Mobile) */}
        <nav className="md:hidden grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#201026]/90 border border-[#DE72B5]/25 shadow-inner">
          <button
            id="nav-repertoire-tab-mobile"
            onClick={() => {
              soundService.playSlideClick();
              onSelectTab('repertoire');
            }}
            className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'repertoire'
                ? 'majestic-btn-primary font-bold shadow-sm'
                : 'text-[#B8A9C2] hover:text-white hover:bg-[#40234D]/60'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span className="truncate">Repertoire</span>
          </button>

          <button
            id="nav-history-tab-mobile"
            onClick={() => {
              soundService.playSlideClick();
              onSelectTab('history');
            }}
            className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'majestic-btn-primary font-bold shadow-sm'
                : 'text-[#B8A9C2] hover:text-white hover:bg-[#40234D]/60'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span className="truncate">Log</span>
          </button>

          <button
            id="nav-analytics-tab-mobile"
            onClick={() => {
              soundService.playSlideClick();
              onSelectTab('analytics');
            }}
            title="View Practice Progress & Analytics Charts"
            className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'majestic-btn-primary font-bold shadow-sm ring-1 ring-[#DE72B5]/50'
                : 'text-[#B8A9C2] hover:text-white hover:bg-[#40234D]/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#DE72B5]" />
            <span className="truncate">Charts</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
