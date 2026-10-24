import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import CustomSelect from "../Common/CustomSelect";

export default function PermintaanFormModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  dataBarang,
  dataDepartemen,
  submitting,
}) {
  const [maxStok, setMaxStok] = useState(0);

  if (!isOpen) return null;

  const handleBarangChange = (selectedId) => {
    const foundItem = dataBarang.find(
      (item) => String(item.id) === String(selectedId),
    );

    if (foundItem) {
      const availableStock = Number(foundItem.stok) || 0;
      setMaxStok(availableStock);

      setFormData((prev) => ({
        ...prev,
        kode: foundItem.kode || "",
        barang: foundItem.nama || "",
        // Biarkan kosong atau sesuaikan saat barang dipilih, tidak memaksa 1
        jml: "",
      }));
    } else {
      setMaxStok(0);
      setFormData((prev) => ({
        ...prev,
        kode: "",
        barang: "",
        jml: "",
      }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!formData.dept) {
      toast.error("Silakan pilih departemen terlebih dahulu!");
      return;
    }

    if (!formData.kode || !formData.barang) {
      toast.error("Silakan pilih barang terlebih dahulu!");
      return;
    }

    const jumlahPermintaan = Number(formData.jml);

    if (!jumlahPermintaan || jumlahPermintaan <= 0) {
      toast.error("Jumlah permintaan minimal 1!");
      return;
    }

    if (maxStok > 0 && jumlahPermintaan > maxStok) {
      toast.error(
        `Jumlah permintaan (${jumlahPermintaan}) melebihi stok tersedia (${maxStok})!`,
      );
      return;
    }

    onSubmit(e);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-visible my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Buat Permintaan Barang Baru
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Formulir pengajuan logistik gudang.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
          {/* Baris 1: Pemohon & Departemen (Responsif grid 1 kolom di HP, 2 kolom di tablet/PC) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Pemohon
              </label>
              <input
                type="text"
                placeholder="Contoh: Andi Wijaya"
                value={formData.pemohon}
                onChange={(e) =>
                  setFormData({ ...formData, pemohon: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-800 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Departemen
              </label>
              <CustomSelect
                value={formData.dept}
                onChange={(val) => setFormData({ ...formData, dept: val })}
                options={dataDepartemen || []}
                placeholder="-- Pilih Departemen --"
                labelKey="nama"
                valueKey="nama"
              />
            </div>
          </div>

          {/* Baris 2: Barang & Jumlah */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Pilih Barang (Master)
              </label>
              <CustomSelect
                value={
                  dataBarang.find((item) => item.nama === formData.barang)
                    ?.id || ""
                }
                onChange={(val) => handleBarangChange(val)}
                options={dataBarang || []}
                placeholder="-- Pilih Barang --"
                labelKey="nama"
                valueKey="id"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  Jumlah Permintaan
                </label>
                {maxStok > 0 && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    Stok: {maxStok}
                  </span>
                )}
              </div>
              <input
                type="number"
                min="1"
                max={maxStok > 0 ? maxStok : undefined}
                placeholder="Masukkan jumlah"
                value={formData.jml}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    jml: val === "" ? "" : Number(val),
                  });
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-800 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Info Kode & Barang Otomatis */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Kode:{" "}
              <strong className="font-mono text-slate-700 dark:text-slate-300">
                {formData.kode || "-"}
              </strong>
            </span>
            <span>
              Barang:{" "}
              <strong className="text-slate-700 dark:text-slate-300">
                {formData.barang || "-"}
              </strong>
            </span>
          </div>

          {/* Prioritas */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Prioritas
            </label>
            <CustomSelect
              value={formData.prioritas}
              onChange={(val) =>
                setFormData({ ...formData, prioritas: val || "Normal" })
              }
              options={[
                { id: "Normal", nama: "Normal" },
                { id: "Urgent", nama: "Urgent" },
              ]}
              placeholder="Normal"
              labelKey="nama"
              valueKey="id"
            />
          </div>

          {/* Keterangan */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Keterangan / Keperluan
            </label>
            <textarea
              rows="3"
              placeholder="Deskripsi keperluan barang..."
              value={formData.keterangan}
              onChange={(e) =>
                setFormData({ ...formData, keterangan: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-800 dark:text-white"
            />
          </div>

          {/* Footer Tombol */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition text-xs cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 transition text-xs disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Menyimpan..." : "Kirim Permintaan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
