import { Edit3, Trash2 } from "lucide-react";

export default function DepartemenTable({
  filteredList,
  departemenList,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-400 uppercase font-mono">
              <th className="py-3.5 px-4 w-10 text-center">#</th>
              <th className="py-3.5 px-4">Kode</th>
              <th className="py-3.5 px-4">Nama Departemen</th>
              <th className="py-3.5 px-4">Kepala Departemen</th>
              <th className="py-3.5 px-4 text-center">Jumlah Pegawai</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-slate-400">
                  Departemen tidak ditemukan.
                </td>
              </tr>
            ) : (
              filteredList.map((item, index) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 text-center text-slate-400 font-mono">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {item.kode}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">
                    {item.nama}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {item.kepala || "-"}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-600 dark:text-slate-300">
                    {item.jmlPegawai || 0} Orang
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {item.status || "Aktif"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id, item.nama)}
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 transition cursor-pointer"
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

      <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] text-slate-400 font-mono">
        Menampilkan {filteredList.length} dari {departemenList.length}{" "}
        departemen
      </div>
    </div>
  );
}
