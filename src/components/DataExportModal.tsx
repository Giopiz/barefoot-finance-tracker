import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  Database,
  Upload,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  HardDriveDownload,
} from 'lucide-react';
import { useBarefootStore } from '../store/useBarefootStore';
import {
  exportExpensesToCSV,
  exportVaultToJSON,
  validateAndParseBackup,
} from '../utils/exportUtils';

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataExportModal: React.FC<DataExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const storeState = useBarefootStore((state) => state);
  const theme = useBarefootStore((state) => state.theme);
  const restoreFromBackup = useBarefootStore((state) => state.restoreFromBackup);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    try {
      exportExpensesToCSV(storeState.expenses, storeState.paycheck.framework);
      setNotification({
        type: 'success',
        message: `Successfully exported ${storeState.expenses.length} expenses to CSV!`,
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to export CSV.',
      });
    }
  };

  const handleExportJSON = () => {
    try {
      exportVaultToJSON(storeState);
      setNotification({
        type: 'success',
        message: 'Complete offline Vault backup downloaded (JSON)!',
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to export backup.',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = validateAndParseBackup(content);
        restoreFromBackup(parsed);

        setNotification({
          type: 'success',
          message: 'Vault restored successfully from backup! 🎉',
        });
        setTimeout(() => {
          setNotification(null);
          onClose();
        }, 1200);
      } catch (err: any) {
        setNotification({
          type: 'error',
          message: err.message || 'Failed to restore backup file.',
        });
      }
    };
    reader.onerror = () => {
      setNotification({
        type: 'error',
        message: 'Could not read selected file.',
      });
    };
    reader.readAsText(file);

    // Reset file input value so user can upload again if needed
    e.target.value = '';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm rounded-3xl border shadow-2xl p-6 relative transition-all duration-200 overflow-hidden ${
          theme === 'dark'
            ? 'bg-[#131b2e] border-white/10 text-white shadow-black/80'
            : 'bg-white border-black/10 text-slate-900 shadow-slate-300/60'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Ember & Emerald glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#ff5a36]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#10b981]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#ff5a36]/15 border border-[#ff5a36]/30 flex items-center justify-center text-[#ff5a36]">
              <HardDriveDownload className="w-4 h-4" />
            </div>
            <div>
              <h2 id="export-modal-title" className="text-base font-bold font-display tracking-tight leading-snug">
                Data Sovereignty & Export
              </h2>
              <p
                className={`text-[11px] ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                100% offline ownership of your financial records
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-full transition cursor-pointer ${
              theme === 'dark'
                ? 'hover:bg-white/10 text-slate-400 hover:text-white'
                : 'hover:bg-black/5 text-slate-500 hover:text-black'
            }`}
            aria-label="Close export modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alert */}
        {notification && (
          <div
            role="alert"
            className={`mb-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981]'
                : 'bg-red-500/15 border border-red-500/30 text-red-400'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Action Cards */}
        <div className="space-y-3 relative z-10">
          {/* Card 1: CSV Export */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              theme === 'dark'
                ? 'bg-black/25 border-white/5 hover:border-white/15'
                : 'bg-slate-50 border-black/5 hover:border-black/15'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-[#10b981]" />
                <span>Spreadsheet (CSV)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                {storeState.expenses.length} logs
              </span>
            </div>
            <p
              className={`text-[11px] mb-2.5 leading-relaxed ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Export your expense log formatted for Microsoft Excel, Google Sheets, or Apple Numbers.
            </p>
            <button
              type="button"
              onClick={handleExportCSV}
              className="w-full py-2 px-3 rounded-xl bg-[#ff5a36] hover:bg-[#e04825] active:scale-98 text-white text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 cursor-pointer shadow-ember"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>

          {/* Card 2: JSON Vault Backup */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              theme === 'dark'
                ? 'bg-black/25 border-white/5 hover:border-white/15'
                : 'bg-slate-50 border-black/5 hover:border-black/15'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[#ff5a36]" />
                <span>Complete Vault (JSON)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                Full Snapshot
              </span>
            </div>
            <p
              className={`text-[11px] mb-2.5 leading-relaxed ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Back up all paycheck baselines, running bucket balances, custom ratios, and history.
            </p>
            <button
              type="button"
              onClick={handleExportJSON}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 cursor-pointer ${
                theme === 'dark'
                  ? 'border-white/10 hover:border-white/20 text-white bg-white/5'
                  : 'border-black/10 hover:border-black/20 text-slate-900 bg-black/5'
              }`}
            >
              <HardDriveDownload className="w-3.5 h-3.5" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Card 3: Restore from JSON */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              theme === 'dark'
                ? 'bg-black/25 border-white/5 hover:border-white/15'
                : 'bg-slate-50 border-black/5 hover:border-black/15'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>Restore from Backup</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                Offline
              </span>
            </div>
            <p
              className={`text-[11px] mb-2.5 leading-relaxed ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Load a previously exported <code className="font-mono text-[10px]">.json</code> file to restore your entire state.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 cursor-pointer ${
                theme === 'dark'
                  ? 'border-white/10 hover:border-white/20 text-slate-300 hover:text-white bg-white/5'
                  : 'border-black/10 hover:border-black/20 text-slate-700 hover:text-slate-900 bg-black/5'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Select File to Restore</span>
            </button>
          </div>
        </div>

        {/* Sovereignty Note */}
        <div className="pt-3.5 border-t border-white/5 text-center mt-3 relative z-10">
          <p
            className={`text-[10px] font-mono flex items-center justify-center gap-1 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Zero lock-in. Your finances remain 100% portable.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
