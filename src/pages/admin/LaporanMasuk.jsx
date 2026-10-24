import { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Printer,
  RotateCcw,
  Filter,
  Loader2,
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-hot-toast";
import {
  exportLaporanMasukToExcel,
  printLaporanMasukPDF,
} from "../../utils/reportExportUtils";
import CustomSelect from "../../components/Common/CustomSelect";

export default function LaporanMasukPage() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("Semua Vendor");
  const [displayedData, setDisplayedData] = useState([]);

  // Ambil data dari Firestore (koleksi 'barangMasuk' & 'items' untuk fallback harga)
  useEffect(() => {
    const fetchLaporanMasuk = async () => {
      try {
        setLoading(true);

        // 1. Ambil Master Data Barang untuk referensi harga
        const itemsSnap = await getDocs(collection(db, "items"));
        const priceMap = {};
        itemsSnap.docs.forEach((docSnap) => {
          const item = docSnap.data();
          if (item.kode)
            priceMap[item.kode.trim().toLowerCase()] = Number(item.harga || 0);
          if (item.nama)
            priceMap[item.nama.trim().toLowerCase()] = Number(item.harga || 0);
        });

        // 2. Ambil Data Transaksi Barang Masuk
        const snapshot = await getDocs(collection(db, "barangMasuk"));
        const data = snapshot.docs.map((d, index) => {
          const item = d.data();
          const kodeKey = (item.kode || "").trim().toLowerCase();
          const namaKey = (item.namaBarang || item.barang || "")
            .trim()
            .toLowerCase();

          const hargaSatuan = Number(
            item.hargaSatuan ||
              item.harga ||
              priceMap[kodeKey] ||
              priceMap[namaKey] ||
              0,
          );

          return {
            id: d.id || index,
            noDok: item.noDokumen || item.noDok || `BM-${index + 1}`,
            tanggal: item.tanggalFormatted || item.tanggal || "-",
            rawDate: item.tanggal || "2026-01-01",
            vendor: item.vendor || "PT. Contoh",
            barang: item.namaBarang || item.barang || "Item",
            qty: Number(item.jumlah || item.qty || 0),
            sat: item.satuan || item.sat || "Piece",
            hargaSat: hargaSatuan,
          };
        });

        setRawData(data);
        setDisplayedData(data);
      } catch (error) {
        console.error("Gagal memuat laporan barang masuk:", error);
        toast.error("Gagal memuat data dari database.");
      } finally {
        setLoading(false);
      }
    };

    fetchLaporanMasuk();
  }, []);

  const formatRupiah = (val) =>
    "Rp " + Number(val || 0).toLocaleString("id-ID");

  // Format opsi untuk CustomSelect bawaan
  const vendorOptions = [
    { label: "Semua Vendor", value: "Semua Vendor" },
    ...[...new Set(rawData.map((i) => i.vendor))].map((vendor) => ({
      label: vendor,
      value: vendor,
    })),
  ];

  const handleTampilkan = () => {
    const filtered = rawData.filter((item) => {
      const matchVendor =
        selectedVendor === "Semua Vendor" || item.vendor === selectedVendor;
      const matchStart = !startDate || item.rawDate >= startDate;
      const matchEnd = !endDate || item.rawDate <= endDate;
      return matchVendor && matchStart && matchEnd;
    });
    setDisplayedData(filtered);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setSelectedVendor("Semua Vendor");
    setDisplayedData(rawData);
  };

  const grandTotal = displayedData.reduce(
    (acc, curr) => acc + curr.qty * curr.hargaSat,
    0,
  );

  return (
    <div className="space-y-6 transition-colors duration-200">
      {/* Header Utama Page */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-black">
              |
            </span>{" "}
            Laporan Barang Masuk
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Laporan / Masuk
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportLaporanMasukToExcel(displayedData)}
            className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => printLaporanMasukPDF(displayedData, grandTotal)}
            className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Card dengan CustomSelect */}
      <div className="bg-white dark:bg-[#111827] rounded-xl p-4 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 transition-colors">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span>Dari:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span>s/d:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          />
        </div>

        {/* Menggunakan CustomSelect bawaan proyek */}
        <div className="w-48">
          <CustomSelect
            options={vendorOptions}
            value={selectedVendor}
            onChange={(val) => setSelectedVendor(val)}
            placeholder="Pilih Vendor"
            valueKey="value"
            labelKey="label"
          />
        </div>

        <button
          onClick={handleTampilkan}
          className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-medium px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Tampilkan</span>
        </button>

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
                <th className="py-3 px-4">NO. DOKUMEN</th>
                <th className="py-3 px-4">TANGGAL</th>
                <th className="py-3 px-4">VENDOR</th>
                <th className="py-3 px-4">BARANG</th>
                <th className="py-3 px-4 text-center">QTY</th>
                <th className="py-3 px-4">SATUAN</th>
                <th className="py-3 px-4 text-right">HARGA SATUAN</th>
                <th className="py-3 px-4 text-right">TOTAL NILAI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    Memuat data dari database...
                  </td>
                </tr>
              ) : displayedData.length > 0 ? (
                displayedData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                      {item.noDok}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {item.tanggal}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {item.vendor}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">
                      {item.barang}
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      {item.qty}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {item.sat}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">
                      {formatRupiah(item.hargaSat)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(item.qty * item.hargaSat)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    Tidak ada data transaksi barang masuk.
                  </td>
                </tr>
              )}

              {/* Total Row */}
              {!loading && displayedData.length > 0 && (
                <tr className="bg-emerald-500/10 dark:bg-emerald-500/10 font-bold border-t border-slate-200 dark:border-slate-800">
                  <td
                    colSpan="7"
                    className="py-3.5 px-4 text-right uppercase tracking-wider text-[11px] text-slate-700 dark:text-slate-200"
                  >
                    TOTAL ({displayedData.length} transaksi)
                  </td>
                  <td className="py-3.5 px-4 text-right text-sm text-emerald-600 dark:text-emerald-400 font-black">
                    {formatRupiah(grandTotal)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-medium bg-slate-50/30 dark:bg-slate-900/30">
          {displayedData.length} transaksi — Total: {formatRupiah(grandTotal)}
        </div>
      </div>
    </div>
  );
}
