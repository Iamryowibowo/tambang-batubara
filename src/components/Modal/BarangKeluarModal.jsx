import { X, Package, Calendar, Building2, UserCheck } from "lucide-react";
import CustomSelect from "../Common/CustomSelect";

export function BarangKeluarFormModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-3 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl my-auto flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        {/* Header (Sticky agar tetap terlihat saat di-scroll) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Input Barang Keluar Baru
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Pencatatan manual barang keluar dari gudang.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Diberi overflow-y-auto agar bisa di-scroll jika layar pendek) */}
        <form
          onSubmit={onSubmit}
          className="p-6 space-y-4 text-xs overflow-y-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                No. Dokumen
              </label>
              <input
                type="text"
                value={formData.noDokumen}
                onChange={(e) =>
                  setFormData({ ...formData, noDokumen: e.target.value })
                }
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-800 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Keluar
              </label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal: e.target.value })
                }
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Departemen
              </label>
              <CustomSelect
                value={formData.departemen}
                onChange={(val) =>
                  setFormData({ ...formData, departemen: val })
                }
                options={[
                  { id: "Maintenance", nama: "Maintenance" },
                  { id: "Operasional", nama: "Operasional" },
                  { id: "Alat Berat", nama: "Alat Berat" },
                  { id: "Tambang", nama: "Tambang" },
                ]}
                placeholder="-- Pilih Departemen --"
                labelKey="nama"
                valueKey="id"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Diserahkan Kepada
              </label>
              <input
                type="text"
                placeholder="Nama Penerima"
                value={formData.diserahkan}
                onChange={(e) =>
                  setFormData({ ...formData, diserahkan: e.target.value })
                }
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Kode Barang
              </label>
              <input
                type="text"
                placeholder="A001"
                value={formData.kode}
                onChange={(e) =>
                  setFormData({ ...formData, kode: e.target.value })
                }
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-800 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nama Barang
              </label>
              <input
                type="text"
                placeholder="Air Filter"
                value={formData.namaBarang}
                onChange={(e) =>
                  setFormData({ ...formData, namaBarang: e.target.value })
                }
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Jumlah Keluar
              </label>
              <input
                type="number"
                min="1"
                value={formData.jumlah}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jumlah: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-800 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Satuan
            </label>
            <CustomSelect
              value={formData.satuan}
              onChange={(val) => setFormData({ ...formData, satuan: val })}
              options={[
                { id: "Pcs", nama: "Pcs" },
                { id: "Set", nama: "Set" },
                { id: "Ltr", nama: "Ltr" },
                { id: "Kg", nama: "Kg" },
              ]}
              placeholder="-- Pilih Satuan --"
              labelKey="nama"
              valueKey="id"
            />
          </div>

          {/* Footer Tombol (Sticky di dalam form bagian bawah) */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function BarangKeluarDetailModal({ isOpen, onClose, selectedDetail }) {
  if (!isOpen || !selectedDetail) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-rose-500" />
            Detail Barang Keluar
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {selectedDetail.namaBarang}
            </h4>
            <p className="text-slate-400 text-[11px] font-mono mt-0.5">
              Dokumen: {selectedDetail.noDokumen}
            </p>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Tanggal: {selectedDetail.tanggalFormatted}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Departemen: <strong>{selectedDetail.departemen}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Diserahkan Kepada: <strong>{selectedDetail.diserahkan}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Kode Item:{" "}
                <strong className="font-mono">{selectedDetail.kode}</strong>
              </span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl mt-2">
              <span className="font-semibold text-rose-800 dark:text-rose-300">
                Jumlah Keluar
              </span>
              <span className="text-base font-bold font-mono text-rose-600 dark:text-rose-400">
                -{selectedDetail.jumlah} {selectedDetail.satuan || "Pcs"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
