import { useState, useEffect, useRef } from "react";
import { Bell, AlertTriangle, ChevronRight, CheckCircle2 } from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Dengarkan transaksi 'requests' Firestore dengan status 'Menunggu' secara real-time
  useEffect(() => {
    const q = query(
      collection(db, "requests"),
      where("status", "==", "Menunggu"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPendingRequests(items);
      },
      (error) => {
        console.error("Error fetching notification requests:", error);
      },
    );

    return () => unsubscribe();
  }, []);

  // Tutup dropdown otomatis jika user mengklik area luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Tombol Lonceng Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 relative transition cursor-pointer active:scale-95"
        title="Notifikasi Permintaan"
      >
        <Bell className="w-4 h-4" />
        {pendingRequests.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
        )}
      </button>

      {/* Popover / Dropdown Menu (Hanya muncul saat diklik) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Notifikasi Permintaan
              </span>
              {pendingRequests.length > 0 && (
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-bold">
                  {pendingRequests.length} Baru
                </span>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/dashboard/permintaan-barang");
                  }}
                  className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer flex items-start gap-3"
                >
                  <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {req.barang || req.namaBarang || "Barang"} (
                      {req.jml || req.jumlah || 0} {req.satuan || "Pcs"})
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Pemohon:{" "}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {req.pemohon || req.dept || req.departemen || "Umum"}
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      {req.tanggal || "Hari ini"} • Status: Menunggu
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 self-center" />
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-slate-400 dark:text-slate-500">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-80" />
                <p className="text-xs font-medium">
                  Tidak ada permintaan menunggu
                </p>
              </div>
            )}
          </div>

          <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50/30 dark:bg-slate-900/30">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/dashboard/permintaan-barang");
              }}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Lihat Semua Permintaan Barang →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
