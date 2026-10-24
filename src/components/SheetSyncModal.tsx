import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  X,
  Download,
} from 'lucide-react';
import { SyncState, UserAuthProfile } from '../types';
import { extractSpreadsheetId } from '../services/sheets';
import { soundService } from '../services/audio';

interface SheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: SyncState;
  onUpdateSpreadsheetId: (newId: string) => void;
  onTriggerSync: () => Promise<void>;
  userProfile: UserAuthProfile | null;
  onSignInWithGoogle: () => void;
  isOnline: boolean;
  onExportLocalBackup: () => void;
}

export function SheetSyncModal({
  isOpen,
  onClose,
  syncState,
  onUpdateSpreadsheetId,
  onTriggerSync,
  userProfile,
  onSignInWithGoogle,
  isOnline,
  onExportLocalBackup,
}: SheetSyncModalProps) {
  const [inputUrl, setInputUrl] = useState(syncState.sheetUrl || syncState.spreadsheetId);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveId = (e: FormEvent) => {
    e.preventDefault();
    const extracted = extractSpreadsheetId(inputUrl);
    if (!extracted) {
      setFeedbackMsg({ type: 'error', text: 'Please enter a valid Google Sheets URL or ID' });
      return;
    }
    onUpdateSpreadsheetId(extracted);
    setFeedbackMsg({ type: 'success', text: 'Spreadsheet connection updated successfully!' });
    soundService.playHabitComplete();
  };

  const handleSyncClick = async () => {
    setFeedbackMsg(null);
    await onTriggerSync();
  };

  const spreadsheetWebUrl = `https://docs.google.com/spreadsheets/d/${syncState.spreadsheetId}/edit`;

  return (
    <AnimatePresence>
      <motion.div
        id="sheet-sync-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#100713]/85 backdrop-blur-md p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg majestic-card rounded-3xl p-6 shadow-2xl text-slate-100 relative my-auto border border-[#DE72B5]/30"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#DE72B5]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#B63E88] to-[#4A1037] border border-[#DE72B5]/40 flex items-center justify-center text-white shadow-md">
                <FileSpreadsheet className="w-5 h-5 text-[#FFBBE2]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white font-serif uppercase tracking-wider">Google Sheets Sync</h2>
                <p className="text-xs text-[#DDD8E2]">Live two-way sync with your practice spreadsheet</p>
              </div>
            </div>

            <button
              id="close-sync-modal-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#2D1A36] hover:bg-[#40234D] text-[#B8A9C2] hover:text-white flex items-center justify-center transition-colors border border-[#4D2B5B]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Online / Offline & Sync Banner */}
          <div className="my-4 p-3.5 rounded-2xl bg-[#1D0F22]/90 border border-[#4D2B5B] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {isOnline ? (
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Wifi className="w-4 h-4" />
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <WifiOff className="w-4 h-4" />
                </div>
              )}
              <div>
                <span className="text-xs font-semibold text-white block">
                  {isOnline ? 'Online Mode • Live Sync' : 'Offline Mode • Local Queue Active'}
                </span>
                <span className="text-[11px] text-[#B8A9C2]">
                  {syncState.pendingChangesCount > 0
                    ? `${syncState.pendingChangesCount} changes queued locally`
                    : 'All entries saved to cloud and sheet'}
                </span>
              </div>
            </div>

            <button
              id="modal-sync-now-btn"
              disabled={syncState.isSyncing || !isOnline}
              onClick={handleSyncClick}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95 ${
                syncState.isSyncing
                  ? 'bg-[#2D1A36] text-[#8F7D99] cursor-not-allowed border border-[#4D2B5B]'
                  : 'majestic-btn-primary'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncState.isSyncing ? 'animate-spin' : ''}`} />
              {syncState.isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>

          {/* Feedback message */}
          {feedbackMsg && (
            <div
              className={`text-xs rounded-xl p-3 mb-4 flex items-center gap-2 border ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-950/40 text-rose-300 border-rose-500/30'
              }`}
            >
              {feedbackMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* Google Account Authentication Status */}
          <div className="bg-[#1D0F22]/90 rounded-2xl p-4 border border-[#4D2B5B] mb-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Google Account Authorization</span>
              {userProfile ? (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-medium">
                  Connected
                </span>
              ) : (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#40234D] text-[#DE72B5] border border-[#DE72B5]/30 font-medium">
                  Authorization Needed
                </span>
              )}
            </div>

            {userProfile ? (
              <div className="flex items-center justify-between text-xs text-[#DDD8E2] pt-1">
                <span>Signed in as: <strong className="text-white">{userProfile.email}</strong></span>
              </div>
            ) : (
              <div className="pt-1">
                <p className="text-xs text-[#DDD8E2] mb-2">
                  Sign in with Google to allow Maestroso to read and sync your piano practice logs and repertoire spreadsheet data.
                </p>
                <button
                  id="modal-google-auth-btn"
                  onClick={onSignInWithGoogle}
                  className="w-full py-2.5 bg-[#2D1A36] hover:bg-[#40234D] border border-[#4D2B5B] text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  Connect with Google
                </button>
              </div>
            )}
          </div>

          {/* Linked Spreadsheet Configuration */}
          <form onSubmit={handleSaveId} className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-white">Spreadsheet Link or ID</label>
                <a
                  href={spreadsheetWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#DE72B5] hover:text-[#FFBBE2] flex items-center gap-1 font-medium underline underline-offset-2"
                >
                  Open in Google Sheets <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                id="spreadsheet-url-input"
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/1NX2T9FN97xh4TzpZniYfIg6l7eJqNd1CpJ-v2X8Dnps..."
                className="w-full bg-[#100713] border border-[#4D2B5B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#DE72B5] font-mono"
              />
            </div>

            <div className="flex gap-2">
              <button
                id="save-sheet-url-btn"
                type="submit"
                className="px-4 py-2 bg-[#2D1A36] hover:bg-[#40234D] text-white text-xs font-semibold rounded-xl border border-[#4D2B5B] transition-colors"
              >
                Save Spreadsheet ID
              </button>
            </div>
          </form>

          {/* Offline Backup Export */}
          <div className="mt-5 pt-4 border-t border-[#DE72B5]/20 flex items-center justify-between">
            <span className="text-xs text-[#DDD8E2]">Offline JSON Backup</span>
            <button
              id="export-backup-btn"
              onClick={onExportLocalBackup}
              className="px-3 py-1.5 rounded-xl bg-[#2D1A36] hover:bg-[#40234D] text-white text-xs font-medium border border-[#4D2B5B] flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#DE72B5]" />
              Download Local Backup
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
