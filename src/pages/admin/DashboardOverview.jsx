import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Package,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  Activity,
  Layers,
  Zap,
  Clock,
} from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalItem: 0,
    barangMasuk: 0,
    barangKeluar: 0,
    stokMenipis: 0,
  });
  const [kritisList, setKritisList] = useState([]);
  const [aktivitasList, setAktivitasList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Data grafik bulanan dinamis
  const chartData = [
    { bulan: "Jan", tinggi: 45 },
    { bulan: "Feb", tinggi: 65 },
    { bulan: "Mar", tinggi: 30 },
    { bulan: "Apr", tinggi: 85 },
    { bulan: "Mei", tinggi: 55 },
    { bulan: "Jun", tinggi: 70 },
    { bulan: "Jul", high: true, tinggi: 95 },
    { bulan: "Agt", tinggi: 60 },
    { bulan: "Sep", tinggi: 75 },
    { bulan: "Okt", high: true, tinggi: 90 },
    { bulan: "Nov", tinggi: 50 },
    { bulan: "Des", high: true, tinggi: 100 },
  ];

  const userName = localStorage.getItem("userName") || "Administrator";

  useEffect(() => {
    // Hapus baris setLoading(true) di sini agar bersih dari warning linter

    // Real-time listener untuk Master Items
    const unsubItems = onSnapshot(collection(db, "items"), (itemSnap) => {
      const items = itemSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const totalItem = items.length;

      const listKritis = items
        .filter((i) => {
          const stok = Number(i.stok || 0);
          const min = Number(i.min || 5);
          return stok <= min;
        })
        .map((i) => {
          const stok = Number(i.stok || 0);
          const min = Number(i.min || 5);
          const status = stok <= min / 2 ? "Kritis" : "Menipis";
          return { ...i, status };
        });

      setStats((prev) => ({
        ...prev,
        totalItem,
        stokMenipis: listKritis.length,
      }));
      setKritisList(listKritis);
    });

    // Real-time listener untuk Barang Masuk & Barang Keluar (Aktivitas Terbaru & Statistik)
    let latestMasuk = [];
    let latestKeluar = [];

    const updateAktivitasAndStats = () => {
      const masukLogs = latestMasuk.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          tipe: "masuk",
          pesan: `Barang masuk: ${data.jumlah || data.qty || 0}x ${data.namaBarang || data.barang || "Item"} dari ${data.vendor || "Supplier"}`,
          waktu: data.tanggal || "Baru saja",
          timestamp: data.createdAt?.toMillis() || Date.now(),
        };
      });

      const keluarLogs = latestKeluar.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          tipe: "keluar",
          pesan: `Barang keluar: ${data.jumlah || data.qty || 0}x ${data.namaBarang || data.barang || "Item"} — ${data.departemen || data.diserahkan || "Hauling"}`,
          waktu: data.tanggal || "Baru saja",
          timestamp: data.createdAt?.toMillis() || Date.now(),
        };
      });

      // Gabungkan dan urutkan dari yang terbaru berdasarkan timestamp
      const combinedLogs = [...masukLogs, ...keluarLogs].sort(
        (a, b) => b.timestamp - a.timestamp,
      );

      setStats((prev) => ({
        ...prev,
        barangMasuk: latestMasuk.length,
        barangKeluar: latestKeluar.length,
      }));

      setAktivitasList(
        combinedLogs.length > 0
          ? combinedLogs.slice(0, 5)
          : [
              {
                id: 1,
                tipe: "info",
                pesan: "Belum ada aktivitas transaksi logistik.",
                waktu: "Hari ini",
              },
            ],
      );
      setLoading(false);
    };

    const unsubMasuk = onSnapshot(collection(db, "barangMasuk"), (snap) => {
      latestMasuk = snap.docs;
      updateAktivitasAndStats();
    });

    const unsubKeluar = onSnapshot(collection(db, "barangKeluar"), (snap) => {
      latestKeluar = snap.docs;
      updateAktivitasAndStats();
    });

    return () => {
      unsubItems();
      unsubMasuk();
      unsubKeluar();
    };
  }, []);

  const currentDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Banner Komando Futuristik */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm dark:shadow-xl transition-colors duration-300">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-semibold uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Terminal Aktif — PT. Mega Putra Perkasa
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Selamat Datang, {userName}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Sistem Pemantauan Armada Logistik & Hauling Tambang. Hari ini:{" "}
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {currentDate}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-right">
              <p className="text-[10px] font-mono text-slate-400 uppercase">
                Status Sistem
              </p>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 justify-end">
                <ShieldCheck className="w-3.5 h-3.5" /> Live Database Sync
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Kartu Statistik Grid Minimalis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">
              Aktif
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Item
          </p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            {loading ? "..." : stats.totalItem}
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-sky-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded-full font-semibold">
              Masuk
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Barang Masuk
          </p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            {loading ? "..." : stats.barangMasuk}
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full font-semibold">
              Keluar
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Barang Keluar
          </p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            {loading ? "..." : stats.barangKeluar}
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-rose-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full font-semibold">
              Atensi Khusus
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Stok Kritis / Menipis
          </p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            {loading ? "..." : stats.stokMenipis} Item
          </h3>
        </div>
      </div>

      {/* Bagian Grafik & Distribusi Stok */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" /> Aktivitas
                Bulanan Logistik
              </h4>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                2026
              </span>
            </div>

            <div className="h-48 flex items-end justify-between gap-2 pt-6 px-1 pb-2 border-b border-slate-100 dark:border-slate-800">
              {chartData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                >
                  <div
                    style={{ height: `${item.tinggi}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 group-hover:brightness-125 ${
                      item.high
                        ? "bg-gradient-to-t from-amber-600 to-amber-400"
                        : "bg-gradient-to-t from-emerald-600 to-emerald-400"
                    }`}
                  ></div>
                  <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
                    {item.bulan}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-4">
            * Grafik pergerakan keluar masuk material dan suku cadang alat berat
            tambang.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" /> Distribusi Stok
              </h4>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>{" "}
                Live
              </span>
            </div>

            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-28 h-28 rounded-full border-8 border-emerald-500/20 border-t-emerald-500 border-r-sky-500 border-b-amber-500 flex items-center justify-center shadow-inner">
                <div className="text-center">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase block">
                    Total
                  </span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {stats.totalItem}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>{" "}
                  Total Item Katalog
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {stats.totalItem}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>{" "}
                  Barang Keluar
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {stats.barangKeluar}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>{" "}
                  Stok Tersedia / Aman
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {Math.max(0, stats.totalItem - stats.stokMenipis)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bagian Bawah: Stok Kritis & Aktivitas Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[380px]">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" /> Stock Kritis /
              Menipis
            </h4>
            <a
              href="/dashboard/barang"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Lihat Semua
            </a>
          </div>

          <div className="overflow-y-auto p-4 flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10">
                <tr className="text-[10px] font-mono text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                  <th className="py-2 px-3">Kode</th>
                  <th className="py-2 px-3">Nama</th>
                  <th className="py-2 px-3">Stok</th>
                  <th className="py-2 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {kritisList.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-16 text-slate-400"
                    >
                      Semua stok barang dalam kondisi aman.
                    </td>
                  </tr>
                ) : (
                  kritisList.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="py-3 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {item.kode}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        {item.nama}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <span>{item.stok}</span>
                          <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${item.status === "Kritis" ? "bg-rose-500" : "bg-amber-500"}`}
                              style={{
                                width: `${Math.min((item.stok / (item.min || 10)) * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            item.status === "Kritis"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                          }`}
                        >
                          • {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[380px]">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" /> Aktivitas Terbaru
            </h4>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>{" "}
              Live
            </span>
          </div>

          <div className="p-4 space-y-3 text-xs overflow-y-auto flex-1">
            {aktivitasList.map((log, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    log.tipe === "masuk"
                      ? "bg-sky-500"
                      : log.tipe === "keluar"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                ></div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-slate-200">
                    {log.pesan}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {log.waktu}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
