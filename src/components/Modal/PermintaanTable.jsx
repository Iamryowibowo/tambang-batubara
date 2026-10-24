import { useState, useEffect } from "react";
import { Eye, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

export default function PermintaanTable({
  filteredData,
  dataPermintaan,
  onDetail,
  onApprove,
  userRole = "admin",
}) {
  // State untuk menampung data stok dari koleksi 'items' di Firestore
  const [stockMap, setStockMap] = useState({});

  // Ambil data stok dari koleksi 'items' saat komponen dimuat
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "items"));
        const stockMapping = {};
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // Mapping berdasarkan kode barang (contoh: "AO01") atau nama barang
          if (data.kode) {
            stockMapping[data.kode.trim().toUpperCase()] = data.stok || 0;
          }
        });
        setStockMap(stockMapping);
      } catch (error) {
        console.error("Gagal mengambil data stok gudang:", error);
      }
    };

    fetchStockData();
  }, [filteredData]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-400 uppercase font-mono">
              <th className="py-3.5 px-4 w-10 text-center">#</th>
              <th className="py-3.5 px-4">No. Req</th>
              <th className="py-3.5 px-4">Tanggal</th>
              <th className="py-3.5 px-4">Pemohon</th>
              <th className="py-3.5 px-4">Dept.</th>
              <th className="py-3.5 px-4">Kode</th>
              <th className="py-3.5 px-4">Barang</th>
              <th className="py-3.5 px-4 text-center">Jml Req</th>
              <th className="py-3.5 px-4 text-center">Stok Gudang</th>{" "}
              {/* Kolom Baru */}
              <th className="py-3.5 px-4">Prioritas</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="12" className="text-center py-8 text-slate-400">
                  Tidak ada data permintaan barang.
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => {
                // Ambil stok dari map berdasarkan kode barang
                const itemCode = item.kode
                  ? item.kode.trim().toUpperCase()
                  : "";
                const currentStock =
                  stockMap[itemCode] !== undefined ? stockMap[itemCode] : "-";

                // Cek apakah stok kurang dari jumlah yang diminta
                const isStockShortage =
                  typeof currentStock === "number" && currentStock < item.jml;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-600 dark:text-slate-400">
                      {item.noReq}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 shrink-0 whitespace-nowrap">
                      {item.tanggal}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-white whitespace-nowrap">
                      {item.pemohon}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {item.dept}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-600 dark:text-slate-400">
                      {item.kode}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {item.barang}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {item.jml}
                    </td>

                    {/* Kolom Informasi Stok Gudang & Peringatan Jika Kurang */}
                    <td className="py-3 px-4 text-center font-mono">
                      {currentStock === "-" ? (
                        <span className="text-slate-400">-</span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            isStockShortage
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30"
                              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                          }`}
                          title={
                            isStockShortage
                              ? "Stok gudang kurang dari jumlah permintaan!"
                              : "Stok aman"
                          }
                        >
                          {isStockShortage && (
                            <AlertCircle className="w-3 h-3 shrink-0" />
                          )}
                          {currentStock}
                        </span>
                      )}
                    </td>

                    {/* Badge Prioritas */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.prioritas === "Urgent"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border-rose-200 dark:border-rose-500/30"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {item.prioritas}
                      </span>
                    </td>

                    {/* Badge Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.status === "Disetujui"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                            : item.status === "Ditolak"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border-rose-200 dark:border-rose-500/30"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border-amber-200 dark:border-amber-500/30"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {item.status}
                      </span>
                    </td>

                    {/* Button Action / Approval */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onDetail(item)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                          title="Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {userRole === "supervisor" &&
                          item.status === "Menunggu" && (
                            <>
                              <button
                                onClick={() =>
                                  onApprove(item.id, "Disetujui", item)
                                }
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-semibold transition text-[11px]"
                                title="Setuju"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Setuju</span>
                              </button>
                              <button
                                onClick={() =>
                                  onApprove(item.id, "Ditolak", item)
                                }
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 font-semibold transition text-[11px]"
                                title="Tolak"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Tolak</span>
                              </button>
                            </>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Count Info */}
      <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] text-slate-400 font-mono">
        Menampilkan {filteredData.length} dari {dataPermintaan.length}{" "}
        permintaan
      </div>
    </div>
  );
}
