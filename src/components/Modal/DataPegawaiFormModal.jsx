import { X, Loader2 } from "lucide-react";
import CustomSelect from "../Common/CustomSelect";

export default function DataPegawaiFormModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  selectedPegawai,
  listDepartemen,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-visible">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            {selectedPegawai ? "Edit Data Pegawai" : "Tambah Pegawai Baru"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              NIP (Nomor Induk Pegawai)
            </label>
            <input
              type="text"
              required
              placeholder="PGW-001"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white font-mono uppercase"
              value={formData.nip}
              onChange={(e) =>
                setFormData({ ...formData, nip: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              placeholder="Masukkan nama pegawai"
              value={formData.namaPegawai || ""}
              onChange={(e) =>
                setFormData({ ...formData, namaPegawai: e.target.value })
              }
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Departemen
            </label>
            <CustomSelect
              value={formData.departemen}
              onChange={(val) => setFormData({ ...formData, departemen: val })}
              options={listDepartemen.map((d) => ({
                id: d.nama || d,
                nama: d.nama || d,
              }))}
              placeholder="Pilih Departemen"
              labelKey="nama"
              valueKey="nama"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Jabatan
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Supervisor / Staff"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
              value={formData.jabatan}
              onChange={(e) =>
                setFormData({ ...formData, jabatan: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="pegawai@megaputra.co.id"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <CustomSelect
              value={formData.status}
              onChange={(val) =>
                setFormData({ ...formData, status: val || "Aktif" })
              }
              options={[
                { id: "Aktif", nama: "Aktif" },
                { id: "Non-Aktif", nama: "Non-Aktif" },
              ]}
              placeholder="Pilih Status"
              labelKey="nama"
              valueKey="id"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {selectedPegawai ? "Simpan Perubahan" : "Tambah Data"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
