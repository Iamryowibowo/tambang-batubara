import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Filter,
  RotateCcw,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import toast from "react-hot-toast";
import {
  BarangKeluarFormModal,
  BarangKeluarDetailModal,
} from "../../components/Modal/BarangKeluarModal";

export default function BarangKeluar() {
  const [dataKeluar, setDataKeluar] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDepartemen, setSelectedDepartemen] = useState("");

  // Modal State
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    noDokumen: "BK-2026-001",
    tanggal: "",
    kode: "",
    namaBarang: "",
    jumlah: 1,
    satuan: "Pcs",
    departemen: "Maintenance",
    diserahkan: "",
  });

  // Ambil Data dari Firestore
  useEffect(() => {
    let isMounted = true;

    async function fetchDataKeluar() {
      try {
        const querySnapshot = await getDocs(collection(db, "barangKeluar"));
        const list = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        if (isMounted) {
          setDataKeluar(list);
          setFormData((prev) => ({
            ...prev,
            noDokumen: `BK-2026-00${list.length + 1}`,
          }));
        }
      } catch (error) {
        console.error("Gagal memuat barang keluar:", error);
        if (isMounted) toast.error("Gagal memuat data dari database.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDataKeluar();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fungsi refresh data terpisah agar aman dipanggil di luar useEffect
  const refreshData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "barangKeluar"));
      const list = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setDataKeluar(list);
    } catch (error) {
      console.error("Gagal refresh data:", error);
    }
  };

  // Filter Logic
  const filteredData = useMemo(() => {
    return dataKeluar.filter((item) => {
      const matchDepartemen = selectedDepartemen
        ? item.departemen === selectedDepartemen
        : true;
      let matchDate = true;

      if (startDate && endDate) {
        matchDate = item.tanggal >= startDate && item.tanggal <= endDate;
      } else if (startDate) {
        matchDate = item.tanggal >= startDate;
      } else if (endDate) {
        matchDate = item.tanggal <= endDate;
      }

      return matchDepartemen && matchDate;
    });
  }, [dataKeluar, startDate, endDate, selectedDepartemen]);

  const handleResetFilter = () => {
    setStartDate("");
    setEndDate("");
    setSelectedDepartemen("");
  };

  // Hapus Data
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus data transaksi ini?")) return;

    try {
      await deleteDoc(doc(db, "barangKeluar", id));
      toast.success("Data berhasil dihapus!");
      refreshData();
    } catch (error) {
      console.error("Gagal menghapus:", error);
      toast.error("Gagal menghapus data.");
    }
  };

  // Submit Manual Form
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.namaBarang || !formData.tanggal) return;

    try {
      const dateObj = new Date(formData.tanggal);
      const formattedDate = dateObj.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      await addDoc(collection(db, "barangKeluar"), {
        ...formData,
        tanggalFormatted: formattedDate,
        createdAt: serverTimestamp(),
      });

      toast.success("Barang keluar berhasil disimpan!");
      setIsModalFormOpen(false);
      setFormData({
        noDokumen: `BK-2026-00${dataKeluar.length + 2}`,
        tanggal: "",
        kode: "",
        namaBarang: "",
        jumlah: 1,
        satuan: "Pcs",
        departemen: "Maintenance",
        diserahkan: "",
      });
      refreshData();
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      toast.error("Gagal menyimpan transaksi.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>|</span> Barang Keluar
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Transaksi / Keluar
          </p>
        </div>

        <button
          onClick={() => setIsModalFormOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition active:scale-95 shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Input Barang Keluar</span>
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Dari:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
          />
          <span>s/d:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100"
          />
        </div>

        <select
          value={selectedDepartemen}
          onChange={(e) => setSelectedDepartemen(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 min-w-40 cursor-pointer"
        >
          <option value="">Semua Departemen</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Operasional">Operasional</option>
          <option value="Alat Berat">Alat Berat</option>
          <option value="Tambang">Tambang</option>
        </select>

        <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm cursor-pointer">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter</span>
        </button>

        <button
          onClick={handleResetFilter}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-400 uppercase font-mono">
                <th className="py-3.5 px-4 w-10 text-center">#</th>
                <th className="py-3.5 px-4">No. Dokumen</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Kode</th>
                <th className="py-3.5 px-4">Nama Barang</th>
                <th className="py-3.5 px-4 text-center">Jumlah</th>
                <th className="py-3.5 px-4">Satuan</th>
                <th className="py-3.5 px-4">Departemen</th>
                <th className="py-3.5 px-4">Diserahkan</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-slate-400">
                    Memuat data dari database...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-slate-400">
                    Tidak ada transaksi barang keluar.
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
                    <td className="py-3 px-4 font-mono font-semibold text-slate-600 dark:text-slate-400">
                      {item.noDokumen}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {item.tanggalFormatted}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-600 dark:text-slate-400">
                      {item.kode}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {item.namaBarang}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-rose-500 dark:text-rose-400">
                      -{item.jumlah}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {item.satuan || "Pcs"}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {item.departemen}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {item.diserahkan}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedDetail(item);
                            setIsModalDetailOpen(true);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 cursor-pointer"
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

        {/* Footer Info */}
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>
            Menampilkan {filteredData.length} dari {dataKeluar.length} data
          </span>
          <div className="flex items-center gap-1">
            <button
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40"
              disabled
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white font-bold">
              1
            </span>
            <button
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40"
              disabled
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Komponen */}
      <BarangKeluarFormModal
        isOpen={isModalFormOpen}
        onClose={() => setIsModalFormOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmitForm}
      />

      <BarangKeluarDetailModal
        isOpen={isModalDetailOpen}
        onClose={() => setIsModalDetailOpen(false)}
        selectedDetail={selectedDetail}
      />
    </div>
  );
}
