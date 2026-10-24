import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  RotateCcw,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  User,
  Loader2,
} from "lucide-react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-hot-toast";
import DeleteConfirmModal from "../../components/Buttons/DeleteConfirmModal";

export default function Vendor() {
  const [dataVendor, setDataVendor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // State Modal Form & Detail
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // State untuk Modal Konfirmasi Hapus Vendor
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    kode: "",
    namaVendor: "",
    kontak: "",
    telepon: "",
    email: "",
    kota: "",
    status: "Aktif",
    alamat: "",
  });

  // Ambil Data dari Firestore
  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "vendors"));
      const list = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setDataVendor(list);
    } catch (error) {
      console.error("Gagal memuat vendor:", error);
      toast.error("Gagal memuat data vendor dari database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVendors();
  }, [fetchVendors]);

  // Filter Data Vendor
  const filteredData = useMemo(() => {
    return dataVendor.filter((item) => {
      const matchSearch =
        item.namaVendor?.toLowerCase().includes(search.toLowerCase()) ||
        item.kode?.toLowerCase().includes(search.toLowerCase()) ||
        item.kota?.toLowerCase().includes(search.toLowerCase()) ||
        item.kontak?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = selectedStatus
        ? item.status === selectedStatus
        : true;

      return matchSearch && matchStatus;
    });
  }, [dataVendor, search, selectedStatus]);

  // Reset Filter
  const handleResetFilter = () => {
    setSearch("");
    setSelectedStatus("");
  };

  // Open Form modal for Add / Edit
  const handleOpenForm = (vendor = null) => {
    if (vendor) {
      setSelectedVendor(vendor);
      setFormData({ ...vendor });
    } else {
      setSelectedVendor(null);
      setFormData({
        kode: `V00${dataVendor.length + 1}`,
        namaVendor: "",
        kontak: "",
        telepon: "",
        email: "",
        kota: "",
        status: "Aktif",
        alamat: "",
      });
    }
    setIsModalFormOpen(true);
  };

  // Open Detail Modal
  const handleOpenDetail = (vendor) => {
    setSelectedVendor(vendor);
    setIsModalDetailOpen(true);
  };

  // Submit Form (Tambah / Update ke Firestore)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.namaVendor) return;

    setSubmitting(true);
    try {
      if (selectedVendor) {
        // Edit ke Firestore
        const docRef = doc(db, "vendors", selectedVendor.id);
        await updateDoc(docRef, {
          kode: formData.kode.toUpperCase(),
          namaVendor: formData.namaVendor,
          kontak: formData.kontak,
          telepon: formData.telepon,
          email: formData.email,
          kota: formData.kota,
          status: formData.status,
          alamat: formData.alamat,
        });
        toast.success("Vendor berhasil diperbarui!");
      } else {
        // Tambah Baru ke Firestore
        await addDoc(collection(db, "vendors"), {
          kode: formData.kode.toUpperCase(),
          namaVendor: formData.namaVendor,
          kontak: formData.kontak,
          telepon: formData.telepon,
          email: formData.email,
          kota: formData.kota,
          status: formData.status,
          alamat: formData.alamat,
          createdAt: new Date(),
        });
        toast.success("Vendor baru berhasil ditambahkan!");
      }

      setIsModalFormOpen(false);
      fetchVendors();
    } catch (error) {
      console.error("Gagal menyimpan vendor:", error);
      toast.error("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setSubmitting(false);
    }
  };
  // Trigger Buka Modal Hapus Vendor
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  // Eksekusi Hapus Vendor ke Firestore
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setDeleting(true);
    try {
      await deleteDoc(doc(db, "vendors", itemToDelete.id));
      toast.success("Vendor berhasil dihapus!");

      // Perbaikan: gunakan selectedVendor sesuai state di file ini
      if (selectedVendor?.id === itemToDelete.id) {
        setSelectedVendor(null);
      }

      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchVendors();
    } catch (error) {
      console.error("Gagal menghapus vendor:", error);
      toast.error("Gagal menghapus data dari database.");
    } finally {
      setDeleting(false);
    }
  };
  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>|</span> Data Vendor
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Master Data / Vendor
          </p>
        </div>

        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition active:scale-95 shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Vendor</span>
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        {/* Input Search */}
        <div className="relative flex-1 min-w-60">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama / kota / kontak"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Filter Status */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-700 dark:text-slate-300 min-w-35"
        >
          <option value="">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Tidak Aktif">Tidak Aktif</option>
        </select>

        {/* Reset Button */}
        <button
          onClick={handleResetFilter}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 transition active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Tabel Data Vendor */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-400 uppercase font-mono">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">Kode</th>
                <th className="py-3.5 px-4">Nama Vendor</th>
                <th className="py-3.5 px-4">Kontak</th>
                <th className="py-3.5 px-4">Telepon</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Kota</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    Memuat data vendor dari database...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-slate-400">
                    Tidak ada data vendor yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {item.kode}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">
                      {item.namaVendor}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {item.kontak}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {item.telepon}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {item.email}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {item.kota}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          item.status === "Aktif"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border-amber-200 dark:border-amber-500/30"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {item.status}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(item)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition font-medium"
                          title="Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                        <button
                          onClick={() => handleOpenForm(item)}
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

        {/* Footer Info Count */}
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] text-slate-400 font-mono">
          Menampilkan {filteredData.length} dari {dataVendor.length} vendor
        </div>
      </div>

      {/* Modal Form Tambah / Edit */}
      {isModalFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                {selectedVendor ? "Edit Vendor" : "Tambah Vendor Baru"}
              </h3>
              <button
                onClick={() => setIsModalFormOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Kode Vendor
                  </label>
                  <input
                    type="text"
                    value={formData.kode}
                    onChange={(e) =>
                      setFormData({ ...formData, kode: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nama Vendor
                  </label>
                  <input
                    type="text"
                    placeholder="PT. Example"
                    value={formData.namaVendor}
                    onChange={(e) =>
                      setFormData({ ...formData, namaVendor: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Person In Charge (Kontak)
                  </label>
                  <input
                    type="text"
                    placeholder="Budi Santoso"
                    value={formData.kontak}
                    onChange={(e) =>
                      setFormData({ ...formData, kontak: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    No. Telepon
                  </label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={formData.telepon}
                    onChange={(e) =>
                      setFormData({ ...formData, telepon: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="info@vendor.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Kota
                  </label>
                  <input
                    type="text"
                    placeholder="Jakarta"
                    value={formData.kota}
                    onChange={(e) =>
                      setFormData({ ...formData, kota: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Lengkap
                </label>
                <textarea
                  rows="3"
                  placeholder="Alamat kantor / gudang vendor..."
                  value={formData.alamat}
                  onChange={(e) =>
                    setFormData({ ...formData, alamat: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalFormOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Simpan Vendor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Vendor */}
      {isModalDetailOpen && selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-500" />
                Detail Vendor - {selectedVendor.kode}
              </h3>
              <button
                onClick={() => setIsModalDetailOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedVendor.namaVendor}
                </h4>
                <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                  Kode: {selectedVendor.kode}
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Kontak: <strong>{selectedVendor.kontak || "-"}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-mono">
                    Telepon: {selectedVendor.telepon || "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Email: {selectedVendor.email || "-"}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    Alamat:{" "}
                    {selectedVendor.alamat || selectedVendor.kota || "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <button
                onClick={() => setIsModalDetailOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
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
        title="Hapus Data Vendor"
        message={`Apakah Anda yakin ingin menghapus vendor "${itemToDelete?.namaVendor}" dari database?`}
        loading={deleting}
      />
    </div>
  );
}
