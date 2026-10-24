import { useState, useEffect } from "react";
import { AlertTriangle, ChevronRight, X } from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";

export default function PendingRequestNotification() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Query Firestore untuk menghitung request dengan status "Menunggu"
    const q = query(
      collection(db, "requests"),
      where("status", "==", "Menunggu"),
    );

    // Listen secara real-time
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setPendingCount(snapshot.docs.length);
      },
      (error) => {
        console.error("Error listening to pending requests:", error);
      },
    );

    return () => unsubscribe();
  }, []);

  // Jika tidak ada request pending atau di-dismiss pengguna, sembunyikan
  if (pendingCount === 0 || !isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className="flex items-center gap-3 bg-amber-50 dark:bg-[#111827] border border-amber-300 dark:border-amber-600/50 text-amber-900 dark:text-amber-200 px-4 py-3 rounded-2xl shadow-xl transition-all hover:shadow-2xl">
        <div className="p-2 bg-amber-100 dark:bg-amber-950/80 rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
        </div>

        <div
          onClick={() => navigate("/dashboard/permintaan-barang")}
          className="cursor-pointer group flex items-center gap-2"
        >
          <span className="text-xs font-semibold">
            <strong className="font-bold text-amber-700 dark:text-amber-300">
              {pendingCount} permintaan baru
            </strong>{" "}
            menunggu persetujuan
          </span>
          <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="ml-1 p-1 hover:bg-amber-200/50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          title="Tutup Notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
