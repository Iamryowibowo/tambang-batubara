import { useState } from "react";
import {
  collection,
  getDocs,
  doc,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { toast, Toaster } from "react-hot-toast";
import {
  Database,
  Download,
  Upload,
  Loader2,
  Building2,
  Save,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

import DeleteConfirmModal from "../../components/Buttons/DeleteConfirmModal";

// Hanya koleksi ini yang dibackup & dipulihkan
const BACKUP_COLLECTIONS = ["items", "barangMasuk", "barangKeluar", "requests"];

// Timestamp -> object JSON
const serialize = (value) => {
  if (value instanceof Timestamp) {
    return {
      __type: "timestamp",
      seconds: value.seconds,
      nanoseconds: value.nanoseconds,
    };
  }
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = serialize(v);
    return out;
  }
  return value;
};

// object JSON -> Timestamp (mendukung format lama & baru)
const deserialize = (value) => {
  if (Array.isArray(value)) return value.map(deserialize);
  if (value && typeof value === "object") {
    const isTimestamp =
      (value.__type === "timestamp" ||
        value.type === "firestore/timestamp/1.0") &&
      typeof value.seconds === "number";
    if (isTimestamp) {
      return new Timestamp(value.seconds, value.nanoseconds || 0);
    }
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = deserialize(v);
    return out;
  }
  return value;
};

// Jalankan operasi batch per 400 supaya tidak melewati batas Firestore
const commitInChunks = async (ops) => {
  for (let i = 0; i < ops.length; i += 400) {
    const batch = writeBatch(db);
    ops.slice(i, i + 400).forEach((op) => op(batch));
    await batch.commit();
  }
};

export default function Settings() {
  const [loadingExport, setLoadingExport] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [companyInfo, setCompanyInfo] = useState({
    name: "PT. Mega Putra Perkasa",
    city: "Jambi",
    phone: "0741-123456",
    address: "Jl. Sudirman No. 45, Kota Jambi",
    businessField: "Pertambangan Mineral & Batubara",
    minStock: 5,
    warningStock: 10,
  });

  // 1. Backup (hanya koleksi transaksi)
  const handleExportData = async () => {
    const toastId = toast.loading("Menyiapkan cadangan data...");
    try {
      setLoadingExport(true);
      const backupData = {};

      for (const colName of BACKUP_COLLECTIONS) {
        const snapshot = await getDocs(collection(db, colName));
        backupData[colName] = {};
        snapshot.forEach((docSnap) => {
          backupData[colName][docSnap.id] = serialize(docSnap.data());
        });
      }

      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(backupData, null, 2));
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      a.setAttribute("href", dataStr);
      a.setAttribute("download", `backup_transaksi_megaputra_${dateStr}.json`);
      document.body.appendChild(a);
      a.click();
      a.remove();

      toast.success("Backup berhasil diunduh!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Gagal melakukan backup data.", { id: toastId });
    } finally {
      setLoadingExport(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setIsConfirmModalOpen(true);
    e.target.value = null;
  };

  // 2. Restore (hanya koleksi transaksi yang ada di file)
  const executeImportData = async () => {
    if (!selectedFile) return;

    setIsConfirmModalOpen(false);
    const toastId = toast.loading("Memulihkan data...");
    setLoadingImport(true);

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const backupData = JSON.parse(event.target.result);

        // Ambil hanya koleksi yang diizinkan DAN ada di file
        const targets = BACKUP_COLLECTIONS.filter(
          (name) => backupData[name] && typeof backupData[name] === "object",
        );

        if (targets.length === 0) {
          throw new Error("File tidak berisi data yang bisa dipulihkan.");
        }

        const ops = [];

        for (const colName of targets) {
          // Hapus data lama koleksi ini saja
          const snapshot = await getDocs(collection(db, colName));
          snapshot.forEach((docSnap) => {
            ops.push((batch) => batch.delete(docSnap.ref));
          });

          // Tulis data dari file
          for (const [docId, docData] of Object.entries(backupData[colName])) {
            ops.push((batch) =>
              batch.set(doc(db, colName, docId), deserialize(docData)),
            );
          }
        }

        await commitInChunks(ops);

        toast.success(`Berhasil memulihkan: ${targets.join(", ")}`, {
          id: toastId,
        });
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        console.error(err);
        toast.error(
          err.message?.includes("File tidak berisi")
            ? err.message
            : "Gagal memulihkan data. Format file tidak valid.",
          { id: toastId },
        );
      } finally {
        setLoadingImport(false);
        setSelectedFile(null);
      }
    };

    reader.readAsText(selectedFile);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const toastId = toast.loading("Menyimpan pengaturan...");
    setLoadingSave(true);
    setTimeout(() => {
      setLoadingSave(false);
      toast.success("Pengaturan sistem berhasil disimpan!", { id: toastId });
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-12">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Pengaturan Sistem
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manajemen konfigurasi perusahaan, parameter stok, dan pencadangan
            data transaksi.
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={loadingSave}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-emerald-950/25 cursor-pointer disabled:opacity-50"
        >
          {loadingSave ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Simpan Semua</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Informasi Perusahaan
                </h3>
                <p className="text-xs text-slate-500">
                  Identitas operasional terminal logistik tambang
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Perusahaan
                </label>
                <input
                  type="text"
                  value={companyInfo.name}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Telepon
                </label>
                <input
                  type="text"
                  value={companyInfo.phone}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, phone: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Alamat Kantor / Site
                </label>
                <textarea
                  rows="2"
                  value={companyInfo.address}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, address: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500/10 text-amber-500 px-3 py-1 rounded-bl-xl text-[10px] font-mono font-bold flex items-center gap-1 border-l border-b border-amber-500/20">
              <ShieldCheck className="w-3 h-3" /> Area Supervisor
            </div>

            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Backup & Pemulihan
                </h3>
                <p className="text-xs text-slate-500">
                  Data transaksi: barang, barang masuk/keluar, permintaan
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                Hanya data Items, Barang Masuk, Barang Keluar, dan Request yang
                dicadangkan. Restore akan menimpa keempat data tersebut. Data
                user dan data master lain tidak berubah.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleExportData}
                disabled={loadingExport}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {loadingExport ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                ) : (
                  <Download className="w-4 h-4 text-emerald-500" />
                )}
                <span>Download Backup (.json)</span>
              </button>

              <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-lg shadow-emerald-950/25">
                {loadingImport ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Upload className="w-4 h-4 text-white" />
                )}
                <span>
                  {loadingImport
                    ? "Memulihkan Data..."
                    : "Upload & Pulihkan Data"}
                </span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  disabled={loadingImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setSelectedFile(null);
        }}
        onConfirm={executeImportData}
        title="Konfirmasi Pemulihan Data"
        message={`Pulihkan data Items, Barang Masuk, Barang Keluar, dan Request dari file "${selectedFile?.name}"? Data saat ini di keempat koleksi itu akan ditimpa.`}
      />
    </div>
  );
}
