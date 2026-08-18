import React, { useEffect } from 'react';

export interface ToastData {
  id: string;
  type: 'success' | 'reward' | 'error' | 'info';
  title: string;
  message?: string;
  coins?: number;
  xp?: number;
  icon?: string;
}

interface ToastProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastData; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  let borderBg = 'bg-white border-slate-200 text-slate-800';
  let badgeColor = 'bg-slate-100 text-slate-700';

  if (toast.type === 'reward') {
    borderBg = 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300 text-amber-950 shadow-amber-100';
    badgeColor = 'bg-amber-100 text-amber-800';
  } else if (toast.type === 'success') {
    borderBg = 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 text-emerald-950 shadow-emerald-100';
    badgeColor = 'bg-emerald-100 text-emerald-800';
  } else if (toast.type === 'error') {
    borderBg = 'bg-gradient-to-r from-rose-50 to-red-50 border-red-300 text-red-950 shadow-red-100';
    badgeColor = 'bg-red-100 text-red-800';
  } else if (toast.type === 'info') {
    borderBg = 'bg-gradient-to-r from-sky-50 to-blue-50 border-blue-300 text-blue-950 shadow-blue-100';
    badgeColor = 'bg-blue-100 text-blue-800';
  }

  return (
    <div
      className={`pointer-events-auto border rounded-2xl p-4 shadow-xl backdrop-blur-md animate-toast transition-all transform flex items-start gap-3 relative overflow-hidden ${borderBg}`}
    >
      {/* Icon Badge */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${badgeColor} shadow-inner`}>
        {toast.icon || (toast.type === 'reward' ? '🎉' : toast.type === 'success' ? '✨' : toast.type === 'error' ? '⚠️' : 'ℹ️')}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-4">
        <div className="font-black text-sm leading-snug">{toast.title}</div>
        {toast.message && (
          <div className="text-xs opacity-80 mt-0.5 leading-relaxed font-medium">{toast.message}</div>
        )}

        {/* Reward Badges */}
        {(toast.coins !== undefined || toast.xp !== undefined) && (
          <div className="flex flex-wrap gap-2 mt-2 pt-1.5 border-t border-amber-200/50">
            {toast.coins !== undefined && (
              <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-900 border border-amber-400/40 px-2 py-0.5 rounded-lg text-xs font-black">
                🪙 {toast.coins > 0 ? `+${toast.coins}` : toast.coins} Coins
              </span>
            )}
            {toast.xp !== undefined && (
              <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-900 border border-emerald-400/40 px-2 py-0.5 rounded-lg text-xs font-black">
                ⭐ +{toast.xp} XP
              </span>
            )}
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-gray-400 hover:text-gray-700 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 hover:bg-black/5 transition"
      >
        ✕
      </button>
    </div>
  );
};
