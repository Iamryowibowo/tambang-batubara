import { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Printer,
  RotateCcw,
  Search,
  Loader2,
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-hot-toast";
import {
  exportLaporanStokToExcel,
  printLaporanStokPDF,
} from "../../utils/reportExportStokUtils";
import CustomSelect from "../../components/Common/CustomSelect";

export default function LaporanStok() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("Semua Kategori");
  const [selectedStatus, setSelectedStatus] = useState("Semua Status");

  // Tarik data dari Firestore dan hitung mutasi Masuk / Keluar secara dinamis
  useEffect(() => {
    const fetchStokData = async () => {
      try {
        setLoading(true);

        // 1. Ambil data master items
        const itemsSnap = await getDocs(collection(db, "items"));
        const itemsList = itemsSnap.docs.map((docSnap) => {
          const item = docSnap.data();
          const kode = (item.kode || "").trim();
          const nama = (item.nama || "").trim();
          const stokSekarang = Number(item.stok || 0);
          const minStok = Number(item.min || 10);

          return {
            id: docSnap.id,
            kode: kode,
            nama: nama,
            kategori: item.kategori || "Umum",
            sat: item.satuan || "Pcs",
            minStok: minStok,
            hargaSat: Number(item.harga || 0),
            stokMaster: stokSekarang,
            masuk: 0,
            keluar: 0,
          };
        });

        // 2. Ambil transaksi barang masuk
        const masukSnap = await getDocs(collection(db, "barangMasuk"));
        masukSnap.docs.forEach((docSnap) => {
          const m = docSnap.data();
          const mKode = (m.kode || "").trim().toLowerCase();
          const mNama = (m.namaBarang || m.barang || "").trim().toLowerCase();
          const qty = Number(m.jumlah || m.qty || 0);

          const found = itemsList.find(
            (i) =>
              i.kode.toLowerCase() === mKode || i.nama.toLowerCase() === mNama,
          );
          if (found) {
            found.masuk += qty;
          }
        });

        // 3. Ambil transaksi barang keluar
        const keluarSnap = await getDocs(collection(db, "barangKeluar"));
        keluarSnap.docs.forEach((docSnap) => {
          const k = docSnap.data();
          const kKode = (k.kode || "").trim().toLowerCase();
          const kNama = (k.namaBarang || k.barang || "").trim().toLowerCase();
          const qty = Number(k.jumlah || k.qty || 0);

          const found = itemsList.find(
            (i) =>
              i.kode.toLowerCase() === kKode || i.nama.toLowerCase() === kNama,
          );
          if (found) {
            found.keluar += qty;
          }
        });

        // 4. Hitung Stok Akhir & Stok Awal
        const processedData = itemsList.map((item) => {
          const akhir = item.stokMaster;
          // Rumus matematis rekam jejak: Awal + Masuk - Keluar = Akhir  -->  Awal = Akhir - Masuk + Keluar
          const awal = Math.max(0, akhir - item.masuk + item.keluar);

          let status = "Aman";
          if (akhir <= 0) {
            status = "Kritis";
          } else if (akhir <= item.minStok) {
            status = "Menipis";
          }

          return {
            ...item,
            awal: awal,
            akhir: akhir,
            status: status,
          };
        });

        setRawData(processedData);
      } catch (error) {
        console.error("Gagal memuat data laporan stok:", error);
        toast.error("Gagal memuat data stok dari database.");
      } finally {
        setLoading(false);
      }
    };

    fetchStokData();
  }, []);

  const formatRupiah = (val) =>
    "Rp " + Number(val || 0).toLocaleString("id-ID");

  const kategoriOptions = [
    { label: "Semua Kategori", value: "Semua Kategori" },
    ...[...new Set(rawData.map((i) => i.kategori))].map((kat) => ({
      label: kat,
      value: kat,
    })),
  ];

  const statusOptions = [
    { label: "Semua Status", value: "Semua Status" },
    { label: "Aman", value: "Aman" },
    { label: "Menipis", value: "Menipis" },
    { label: "Kritis", value: "Kritis" },
  ];

  const filteredData = rawData.filter((item) => {
    const matchSearch =
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchKat =
      selectedKategori === "Semua Kategori" ||
      item.kategori === selectedKategori;
    const matchStat =
      selectedStatus === "Semua Status" || item.status === selectedStatus;
    return matchSearch && matchKat && matchStat;
  });

  const handleReset = () => {
    setSearchTerm("");
    setSelectedKategori("Semua Kategori");
    setSelectedStatus("Semua Status");
  };

  // Stat Summary
  const totalJenis = rawData.length;
  const totalStokUnit = rawData.reduce((acc, item) => acc + item.akhir, 0);
  const totalKritis = rawData.filter(
    (item) => item.status === "Kritis" || item.status === "Menipis",
  ).length;
  const nilaiInventori = rawData.reduce(
    (acc, item) => acc + item.akhir * item.hargaSat,
    0,
  );

  const totalSummary = {
    totalJenis,
    totalStokUnit,
    totalKritis,
    nilaiInventori,
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Aman":
        return (
          <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
            • Aman
          </span>
        );
      case "Menipis":
        return (
          <span className="bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
            • Menipis
          </span>
        );
      case "Kritis":
        return (
          <span className="bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
            • Kritis
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 space-y-6 transition-colors duration-200">
      {/* Header Utama Page */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="text-[#059669] dark:text-emerald-400 font-black">
              |
            </span>{" "}
            Laporan Stok
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Laporan / Stok
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportLaporanStokToExcel(filteredData, totalSummary)}
            className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => printLaporanStokPDF(filteredData, totalSummary)}
            className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Stat Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            TOTAL JENIS BARANG
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {totalJenis}
          </div>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            TOTAL STOK (UNIT)
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {totalStokUnit}
          </div>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            STOK KRITIS / MENIPIS
          </span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {totalKritis}
          </div>
        </div>
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            NILAI INVENTORI
          </span>
          <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-2">
            {formatRupiah(nilaiInventori)}
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white dark:bg-[#111827] rounded-xl p-4 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 transition-colors">
        <div className="relative flex-1 min-w-55">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode / nama barang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="w-44">
          <CustomSelect
            options={kategoriOptions}
            value={selectedKategori}
            onChange={(val) => setSelectedKategori(val)}
            placeholder="Pilih Kategori"
            valueKey="value"
            labelKey="label"
          />
        </div>

        <div className="w-40">
          <CustomSelect
            options={statusOptions}
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
            placeholder="Pilih Status"
            valueKey="value"
            labelKey="label"
          />
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Tabel Utama */}
      <div className="bg-white dark:bg-[#111827] rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50 dark:bg-slate-900/50">
                <th className="py-3 px-4">KODE</th>
                <th className="py-3 px-4">NAMA BARANG</th>
                <th className="py-3 px-4">KATEGORI</th>
                <th className="py-3 px-4 text-center">SAT.</th>
                <th className="py-3 px-4 text-center">STOK AWAL</th>
                <th className="py-3 px-4 text-center">MASUK</th>
                <th className="py-3 px-4 text-center">KELUAR</th>
                <th className="py-3 px-4 text-center">STOK AKHIR</th>
                <th className="py-3 px-4 text-center">MIN. STOK</th>
                <th className="py-3 px-4 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center py-12 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    Menghitung mutasi stok dan memuat database...
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-semibold font-mono">
                      {item.kode}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">
                      {item.nama}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {item.kategori}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500 dark:text-slate-400">
                      {item.sat}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-300">
                      {item.awal}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      +{item.masuk}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-rose-600 dark:text-rose-400">
                      -{item.keluar}
                    </td>
                    <td className="py-3 px-4 text-center font-black text-slate-800 dark:text-slate-100 text-sm">
                      {item.akhir}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500 dark:text-slate-400">
                      {item.minStok}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(item.status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-12 text-slate-400">
                    Tidak ada data stok barang yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-medium bg-slate-50/30 dark:bg-slate-900/30">
          Menampilkan {filteredData.length} dari {rawData.length} data
        </div>
      </div>
    </div>
  );
}
