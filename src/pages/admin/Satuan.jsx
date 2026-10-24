import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Save, X, Loader2 } from "lucide-react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase"; // Sesuaikan path relative firebase jika diperlukan
import { toast } from "react-hot-toast";
import DeleteConfirmModal from "../../components/Buttons/DeleteConfirmModal";

export default function Satuan() {
  const [dataSatuan, setDataSatuan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // State untuk Modal Konfirmasi Hapus Satuan
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    kode: "",
    namaSatuan: "",
    keterangan: "",
  });

  // 1. Definisikan fungsi fetch di luar useEffect agar bisa dipanggil ulang
  async function fetchSatuan() {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "units"));
      const list = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setDataSatuan(list);
    } catch (error) {
      console.error("Gagal memuat satuan:", error);
      toast.error("Gagal memuat data satuan dari database.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSatuan();
  }, []);
  // Handle Klik Edit
  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      kode: item.kode,
      namaSatuan: item.namaSatuan,
      keterangan: item.keterangan || "",
    });
  };

  // Handle Reset / Batal
  const handleResetForm = () => {
    setSelectedItem(null);
    setFormData({ kode: "", namaSatuan: "", keterangan: "" });
  };

  // Handle Simpan (Tambah atau Update ke Firestore)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.kode || !formData.namaSatuan) return;

    setSubmitting(true);
    try {
      if (selectedItem) {
        // Proses Update ke Firestore
        const docRef = doc(db, "units", selectedItem.id);
        await updateDoc(docRef, {
          kode: formData.kode.toUpperCase(),
          namaSatuan: formData.namaSatuan,
          keterangan: formData.keterangan,
        });
        toast.success("Satuan berhasil diperbarui!");
      } else {
        // Proses Tambah Baru ke Firestore
        await addDoc(collection(db, "units"), {
          kode: formData.kode.toUpperCase(),
          namaSatuan: formData.namaSatuan,
          keterangan: formData.keterangan,
          createdAt: new Date(),
        });
        toast.success("Satuan baru berhasil ditambahkan!");
      }

      handleResetForm();
      fetchSatuan(); // Refresh data tabel
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      toast.error("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger Buka Modal Hapus
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  // Eksekusi Hapus Satuan ke Firestore
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setDeleting(true);
    try {
      await deleteDoc(doc(db, "units", itemToDelete.id));
      toast.success("Satuan berhasil dihapus!");
      if (selectedItem?.id === itemToDelete.id) {
        handleResetForm();
      }
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchSatuan();
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      toast.error("Gagal menghapus data dari database.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>|</span> Master Satuan
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Master Data / Satuan
          </p>
        </div>

        <button
          onClick={handleResetForm}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition active:scale-95 shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Satuan</span>
        </button>
      </div>

      {/* Grid 2 Kolom: Tabel di Kiri, Form di Kanan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Tabel Data Satuan */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-400 uppercase font-mono">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Kode</th>
                  <th className="py-3.5 px-4">Nama Satuan</th>
                  <th className="py-3.5 px-4">Keterangan</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-12 text-slate-400"
                    >
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                      Memuat data dari database...
                    </td>
                  </tr>
                ) : dataSatuan.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-12 text-slate-400"
                    >
                      Belum ada data satuan di database.
                    </td>
                  </tr>
                ) : (
                  dataSatuan.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        selectedItem?.id === item.id
                          ? "bg-emerald-50/50 dark:bg-emerald-500/10"
                          : ""
                      }`}
                    >
                      <td className="py-3 px-4 text-center text-slate-400 font-mono">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {item.kode}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-white">
                        {item.namaSatuan}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {item.keterangan || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolom Kanan: Form Tambah/Edit Satuan */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              {selectedItem ? "Edit Satuan" : "+ Tambah Satuan"}
            </h3>
            {selectedItem && (
              <button
                onClick={handleResetForm}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase font-mono mb-1.5">
                  Kode
                </label>
                <input
                  type="text"
                  placeholder="PCS"
                  value={formData.kode}
                  onChange={(e) =>
                    setFormData({ ...formData, kode: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-800 dark:text-slate-100 font-mono font-bold uppercase"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase font-mono mb-1.5">
                  Nama Satuan
                </label>
                <input
                  type="text"
                  placeholder="Piece"
                  value={formData.namaSatuan}
                  onChange={(e) =>
                    setFormData({ ...formData, namaSatuan: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-800 dark:text-slate-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-400 uppercase font-mono mb-1.5">
                Keterangan
              </label>
              <textarea
                rows="4"
                placeholder="Deskripsi satuan..."
                value={formData.keterangan}
                onChange={(e) =>
                  setFormData({ ...formData, keterangan: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-800 dark:text-slate-100 resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition active:scale-95 shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-semibold transition active:scale-95"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Modal Konfirmasi Hapus Reusable */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!deleting) {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Hapus Data Satuan"
        message={`Apakah Anda yakin ingin menghapus satuan "${itemToDelete?.namaSatuan}" (${itemToDelete?.kode}) dari database?`}
        loading={deleting}
      />
    </div>
  );
}
