import { X, Package, Calendar, Building2, FileText } from "lucide-react";
import CustomSelect from "../Common/CustomSelect";

export function BarangMasukFormModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  dataVendor = [],
  dataBarang = [],
  onBarangChange,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-3 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl my-auto flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Input Barang Masuk (Penerimaan PO)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Pilih barang dari master data yang sudah terdaftar.
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

        {/* Form Body */}
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
                Tanggal Masuk
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
                Vendor / Supplier
              </label>
              <CustomSelect
                value={formData.vendor}
                onChange={(val) => setFormData({ ...formData, vendor: val })}
                options={dataVendor}
                placeholder="-- Pilih Vendor --"
                labelKey="namaVendor"
                valueKey="namaVendor"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                No. Referensi (PO)
              </label>
              <input
                type="text"
                placeholder="PO-2026-xxx"
                value={formData.referensi}
                onChange={(e) =>
                  setFormData({ ...formData, referensi: e.target.value })
                }
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Pilih Barang dari Master Data */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Pilih Barang (Dari Master Data)
            </label>
            <CustomSelect
              value={
                dataBarang.find((i) => i.nama === formData.namaBarang)?.id || ""
              }
              onChange={(val) => onBarangChange(val)}
              options={dataBarang}
              placeholder="-- Pilih Barang --"
              labelKey="nama"
              valueKey="id"
            />
          </div>

          {/* Info Otomatis Barang yang Dipilih */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-mono">
                Kode
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-white">
                {formData.kode || "-"}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-mono">
                Kategori
              </span>
              <span className="font-medium text-slate-800 dark:text-white">
                {formData.kategori || "-"}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-mono">
                Satuan
              </span>
              <span className="font-medium text-slate-800 dark:text-white">
                {formData.satuan || "-"}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Jumlah Masuk
            </label>
            <input
              type="number"
              min="1"
              value={formData.jumlah}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  jumlah: parseInt(e.target.value),
                })
              }
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-800 dark:text-white"
              required
            />
          </div>

          {/* Footer Tombol */}
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

export function BarangMasukDetailModal({ isOpen, onClose, selectedDetail }) {
  if (!isOpen || !selectedDetail) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-500" />
            Detail Barang Masuk
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
                Vendor: <strong>{selectedDetail.vendor}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Kode Item:{" "}
                <strong className="font-mono">{selectedDetail.kode}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Kategori: <strong>{selectedDetail.kategori || "-"}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Referensi PO:{" "}
                <strong className="font-mono">
                  {selectedDetail.referensi || "-"}
                </strong>
              </span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl mt-2">
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                Jumlah Masuk
              </span>
              <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                +{selectedDetail.jumlah} {selectedDetail.satuan || "Pcs"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-xl cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
