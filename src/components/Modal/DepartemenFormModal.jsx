import { X } from "lucide-react";

export default function DepartemenFormModal({
  isOpen,
  onClose,
  selectedDept,
  formData,
  setFormData,
  onSubmit,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            {selectedDept ? "Edit Departemen" : "Tambah Departemen Baru"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Kode Departemen
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: DPT-MNT"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              value={formData.kode}
              onChange={(e) =>
                setFormData({ ...formData, kode: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nama Departemen
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Maintenance"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Kepala Departemen
            </label>
            <input
              type="text"
              required
              placeholder="Nama Penanggung Jawab"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              value={formData.kepala}
              onChange={(e) =>
                setFormData({ ...formData, kepala: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Jumlah Pegawai
            </label>
            <input
              type="number"
              min="0"
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              value={formData.jmlPegawai}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  jmlPegawai: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 transition text-xs disabled:opacity-50"
            >
              {submitting
                ? "Menyimpan..."
                : selectedDept
                  ? "Simpan Perubahan"
                  : "Tambah Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
