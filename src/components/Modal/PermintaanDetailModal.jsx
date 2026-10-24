import { FileText, User, Building, Calendar, Package, X } from "lucide-react";

export default function PermintaanDetailModal({
  isOpen,
  onClose,
  selectedReq,
}) {
  if (!isOpen || !selectedReq) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" />
            Detail Permintaan ({selectedReq.noReq})
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="space-y-2.5 text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-slate-400">Status:</span>
              <span className="font-bold text-slate-800 dark:text-white">
                {selectedReq.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>
                Pemohon: <strong>{selectedReq.pemohon}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-400" />
              <span>Departemen: {selectedReq.dept}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Tanggal: {selectedReq.tanggal}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-400" />
              <span>
                Item: <strong>{selectedReq.barang}</strong> ({selectedReq.kode})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Jumlah:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-white">
                {selectedReq.jml} Pcs
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block mb-1">Keterangan:</span>
              <p className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 italic">
                "{selectedReq.keterangan || "-"}"
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
