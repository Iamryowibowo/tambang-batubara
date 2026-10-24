import { X, Loader2 } from "lucide-react";
import CustomSelect from "../Common/CustomSelect";

export default function DataBarangFormModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  selectedItem,
  categoriesList,
  unitsList,
  vendorsList,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-visible shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              {selectedItem
                ? "Edit Data Barang (Katalog Master)"
                : "Tambah Barang Baru"}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {selectedItem
                ? "Perbaiki informasi atau typo tanpa mengubah stok sistem secara manual."
                : "Daftarkan spesifikasi barang baru ke dalam katalog."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Kode Barang
              </label>
              <input
                type="text"
                value={formData.kode}
                onChange={(e) =>
                  setFormData({ ...formData, kode: e.target.value })
                }
                placeholder="Contoh: A004"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold uppercase text-slate-800 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nama Barang
              </label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                placeholder="Contoh: Air Filter HD"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Kategori
              </label>
              <CustomSelect
                value={formData.kategori}
                onChange={(val) => setFormData({ ...formData, kategori: val })}
                options={categoriesList}
                placeholder="Pilih Kategori"
                labelKey="namaKategori"
                valueKey="namaKategori"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Satuan
              </label>
              <CustomSelect
                value={formData.satuan}
                onChange={(val) => setFormData({ ...formData, satuan: val })}
                options={unitsList}
                placeholder="Pilih Satuan"
                labelKey="namaSatuan"
                valueKey="namaSatuan"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Harga (IDR)
              </label>
              <input
                type="number"
                value={formData.harga}
                onChange={(e) =>
                  setFormData({ ...formData, harga: e.target.value })
                }
                placeholder="50000"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white font-mono"
                required
              />
            </div>

            {/* Stok Awal / Stok Sistem (Terkunci saat Mode Edit) */}
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                {selectedItem ? "Stok Sistem" : "Stok Awal"}
              </label>
              <input
                type="number"
                value={formData.stok}
                onChange={(e) =>
                  !selectedItem &&
                  setFormData({ ...formData, stok: e.target.value })
                }
                readOnly={!!selectedItem}
                placeholder="10"
                className={`w-full px-3 py-2 border rounded-xl font-mono ${
                  selectedItem
                    ? "bg-slate-100 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white border-slate-200 dark:border-slate-700"
                }`}
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Stok Min.
              </label>
              <input
                type="number"
                value={formData.min}
                onChange={(e) =>
                  setFormData({ ...formData, min: e.target.value })
                }
                placeholder="5"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Vendor / Supplier
            </label>
            <CustomSelect
              value={formData.vendor}
              onChange={(val) => setFormData({ ...formData, vendor: val })}
              options={vendorsList}
              placeholder="Pilih Vendor"
              labelKey="namaVendor"
              valueKey="namaVendor"
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
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
