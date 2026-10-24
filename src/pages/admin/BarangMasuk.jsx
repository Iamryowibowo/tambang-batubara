import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Filter,
  RotateCcw,
  Eye,
  Trash2,
  Info,
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
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import toast from "react-hot-toast";
import {
  BarangMasukFormModal,
  BarangMasukDetailModal,
} from "../../components/Modal/BarangMasukModal";

export default function BarangMasuk() {
  const [dataMasuk, setDataMasuk] = useState([]);
  const [dataBarang, setDataBarang] = useState([]);
  const [dataVendor, setDataVendor] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");

  // Modal State
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Form State (Termasuk hargaSatuan)
  const [formData, setFormData] = useState({
    noDokumen: "BM-2026-001",
    tanggal: "",
    vendor: "",
    kode: "",
    namaBarang: "",
    kategori: "",
    jumlah: 1,
    satuan: "Pcs",
    hargaSatuan: 0,
    referensi: "",
  });

  // Ambil Data dari Firestore
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        if (isMounted) setLoading(true);

        const masukSnap = await getDocs(collection(db, "barangMasuk"));
        const masukList = masukSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        const itemSnap = await getDocs(collection(db, "items"));
        const itemList = itemSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        const vendorSnap = await getDocs(collection(db, "vendors"));
        const vendorList = vendorSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        if (isMounted) {
          setDataMasuk(masukList);
          setDataBarang(itemList);
          setDataVendor(vendorList);
          setFormData((prev) => ({
            ...prev,
            noDokumen: `BM-2026-00${masukList.length + 1}`,
          }));
        }
      } catch (error) {
        console.error("Gagal memuat data:", error);
        if (isMounted) toast.error("Gagal memuat data dari database.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshData = async () => {
    try {
      const masukSnap = await getDocs(collection(db, "barangMasuk"));
      const masukList = masukSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      const itemSnap = await getDocs(collection(db, "items"));
      const itemList = itemSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setDataMasuk(masukList);
      setDataBarang(itemList);
    } catch (error) {
      console.error("Gagal refresh data:", error);
    }
  };

  // Handler saat barang master dipilih pada form
  const handleBarangChange = (selectedId) => {
    const found = dataBarang.find(
      (item) => String(item.id) === String(selectedId),
    );
    if (found) {
      setFormData((prev) => ({
        ...prev,
        kode: found.kode || "",
        namaBarang: found.nama || "",
        kategori: found.kategori || "",
        satuan: found.satuan || "Pcs",
        hargaSatuan: Number(found.harga || 0), // Menarik harga dari master item
      }));
    }
  };

  // Filter Logic
  const filteredData = useMemo(() => {
    return dataMasuk.filter((item) => {
      const matchVendor = selectedVendor
        ? item.vendor === selectedVendor
        : true;
      let matchDate = true;

      if (startDate && endDate) {
        matchDate = item.tanggal >= startDate && item.tanggal <= endDate;
      } else if (startDate) {
        matchDate = item.tanggal >= startDate;
      } else if (endDate) {
        matchDate = item.tanggal <= endDate;
      }

      return matchVendor && matchDate;
    });
  }, [dataMasuk, startDate, endDate, selectedVendor]);

  const handleResetFilter = () => {
    setStartDate("");
    setEndDate("");
    setSelectedVendor("");
  };

  // Hapus Data Transaksi
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus data transaksi ini?")) return;

    try {
      await deleteDoc(doc(db, "barangMasuk", id));
      toast.success("Data berhasil dihapus!");
      refreshData();
    } catch (error) {
      console.error("Gagal menghapus:", error);
      toast.error("Gagal menghapus data.");
    }
  };

  // Submit Form Input Barang Masuk & Otomatis Tambah Stok Master Barang
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.namaBarang || !formData.tanggal || !formData.kode) {
      toast.error("Pilih barang dari Master Data terlebih dahulu!");
      return;
    }

    try {
      const dateObj = new Date(formData.tanggal);
      const formattedDate = dateObj.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      // 1. Simpan transaksi ke barangMasuk
      await addDoc(collection(db, "barangMasuk"), {
        ...formData,
        jumlah: Number(formData.jumlah),
        hargaSatuan: Number(formData.hargaSatuan || 0),
        tanggalFormatted: formattedDate,
        createdAt: serverTimestamp(),
      });

      // 2. Tambah stok di master items
      const itemsRef = collection(db, "items");
      const q = query(itemsRef, where("kode", "==", formData.kode));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const itemDocSnap = querySnapshot.docs[0];
        const itemRef = doc(db, "items", itemDocSnap.id);
        const currentStok = Number(itemDocSnap.data().stok || 0);
        const jumlahMasuk = Number(formData.jumlah);

        await updateDoc(itemRef, {
          stok: currentStok + jumlahMasuk,
        });
      } else {
        toast.error(
          "Barang tidak ditemukan di Master Data! Harap daftarkan dulu di menu Data Barang.",
        );
        return;
      }

      toast.success("Barang masuk berhasil dicatat & stok gudang bertambah!");
      setIsModalFormOpen(false);
      setFormData({
        noDokumen: `BM-2026-00${dataMasuk.length + 2}`,
        tanggal: "",
        vendor: "",
        kode: "",
        namaBarang: "",
        kategori: "",
        jumlah: 1,
        satuan: "Pcs",
        hargaSatuan: 0,
        referensi: "",
      });
      refreshData();
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      toast.error("Gagal menyimpan transaksi.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>|</span> Barang Masuk
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Transaksi / Masuk
          </p>
        </div>

        <button
          onClick={() => setIsModalFormOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition active:scale-95 shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Input Barang Masuk</span>
        </button>
      </div>

      {/* Info Banner PO */}
      <div className="flex items-center gap-2.5 p-3.5 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-sky-800 dark:text-sky-300 rounded-2xl text-xs">
        <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
        <span>
          Kelola penerimaan barang dari vendor atau pesanan PO yang telah tiba
          di gudang.
        </span>
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
          value={selectedVendor}
          onChange={(e) => setSelectedVendor(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 min-w-40 cursor-pointer"
        >
          <option value="">Semua Vendor</option>
          {dataVendor.map((v) => (
            <option key={v.id} value={v.namaVendor || v.nama}>
              {v.namaVendor || v.nama}
            </option>
          ))}
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

      {/* Tabel Data Barang Masuk */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-400 uppercase font-mono">
                <th className="py-3.5 px-4 w-10 text-center">#</th>
                <th className="py-3.5 px-4">No. Dokumen</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Vendor</th>
                <th className="py-3.5 px-4">Kode</th>
                <th className="py-3.5 px-4">Nama Barang</th>
                <th className="py-3.5 px-4 text-center">Jumlah</th>
                <th className="py-3.5 px-4">Satuan</th>
                <th className="py-3.5 px-4 text-right">Harga Satuan</th>
                <th className="py-3.5 px-4 text-right">Total</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="11" className="text-center py-8 text-slate-400">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-8 text-slate-400">
                    Tidak ada transaksi barang masuk.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => {
                  const qty = Number(item.jumlah || 0);

                  // Pencocokan otomatis dengan Master Data (items) jika hargaSatuan di transaksi bernilai 0 / undefined
                  const itemMaster = dataBarang.find(
                    (b) =>
                      (b.kode &&
                        item.kode &&
                        b.kode.trim().toLowerCase() ===
                          item.kode.trim().toLowerCase()) ||
                      (b.nama &&
                        item.namaBarang &&
                        b.nama.trim().toLowerCase() ===
                          item.namaBarang.trim().toLowerCase()),
                  );

                  const harga = Number(
                    item.hargaSatuan || itemMaster?.harga || 0,
                  );
                  const total = qty * harga;

                  return (
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
                        {item.tanggalFormatted || item.tanggal}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-white whitespace-nowrap">
                        {item.vendor}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-600 dark:text-slate-400">
                        {item.kode}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {item.namaBarang}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        +{qty}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {item.satuan || "Pcs"}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">
                        Rp {harga.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        Rp {total.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedDetail({
                                ...item,
                                hargaSatuan: harga,
                              });
                              setIsModalDetailOpen(true);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detail</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info Count */}
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>
            Menampilkan {filteredData.length} dari {dataMasuk.length} data
          </span>
          <div className="flex items-center gap-1">
            <button
              className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-40"
              disabled
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white font-bold">
              1
            </span>
            <button
              className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-40"
              disabled
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Komponen */}
      <BarangMasukFormModal
        isOpen={isModalFormOpen}
        onClose={() => setIsModalFormOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmitForm}
        dataVendor={dataVendor}
        dataBarang={dataBarang}
        onBarangChange={handleBarangChange}
      />

      <BarangMasukDetailModal
        isOpen={isModalDetailOpen}
        onClose={() => setIsModalDetailOpen(false)}
        selectedDetail={selectedDetail}
      />
    </div>
  );
}
