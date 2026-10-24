import {
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
} from "lucide-react";

export default function DataBarangTable({
  loading,
  filteredData,
  dataBarangLength,
  onDetail,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-400 uppercase font-mono">
              <th className="py-3.5 px-4 w-12 text-center">#</th>
              <th className="py-3.5 px-4 w-24">Kode</th>
              <th className="py-3.5 px-4">Nama Barang</th>
              <th className="py-3.5 px-4 w-32">Kategori</th>
              <th className="py-3.5 px-4 w-28">Satuan</th>
              <th className="py-3.5 px-4 w-32 text-right">Harga</th>
              <th className="py-3.5 px-4 w-20 text-center">Stok</th>
              <th className="py-3.5 px-4 w-36">Vendor</th>
              <th className="py-3.5 px-4 w-28 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center py-10 text-slate-400">
                  Memuat data master barang...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-10 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <PackageOpen className="w-8 h-8 text-slate-300" />
                    <span>Tidak ada data barang ditemukan.</span>
                  </div>
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
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {item.nama}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] font-medium">
                      {item.kategori || "-"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {item.satuan || "Pcs"}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                    Rp {Number(item.harga || 0).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-4 text-center font-mono">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                        Number(item.stok || 0) <= Number(item.min || 5)
                          ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-200 dark:border-rose-500/20"
                          : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-500/20"
                      }`}
                    >
                      {item.stok || 0}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 truncate max-w-35">
                    {item.vendor || "-"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onDetail(item)}
                        title="Detail"
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        title="Edit"
                        className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 text-sky-600 cursor-pointer transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        title="Hapus"
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 text-rose-600 cursor-pointer transition"
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

      {/* Footer Info & Pagination */}
      <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>
          Menampilkan {filteredData.length} dari {dataBarangLength} data katalog
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
  );
}
