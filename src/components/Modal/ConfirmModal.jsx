import { AlertCircle, X, AlertTriangle } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isWarning,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-sm shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${isWarning ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-500"}`}
          >
            {isWarning ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            {title || "Konfirmasi Aksi"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {message}
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          {!isWarning && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Batal
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition shadow-md cursor-pointer ${
              isWarning
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
            }`}
          >
            {isWarning ? "Mengerti" : "Ya, Lanjutkan"}
          </button>
        </div>
      </div>
    </div>
  );
}
