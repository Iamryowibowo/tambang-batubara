import { useState } from "react";
import Satuan from "./Satuan";
import Kategori from "./Kategori";
import { Layers, Ruler } from "lucide-react";

export default function KategoriDanSatuan() {
  const [activeTab, setActiveTab] = useState("kategori"); // "kategori" atau "satuan"

  return (
    <div className="space-y-6">
      {/* Tab Navigation Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab("kategori")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "kategori"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Master Kategori</span>
        </button>

        <button
          onClick={() => setActiveTab("satuan")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "satuan"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          }`}
        >
          <Ruler className="w-4 h-4" />
          <span>Master Satuan</span>
        </button>
      </div>

      {/* Render Komponen Berdasarkan Tab yang Aktif */}
      <div>{activeTab === "kategori" ? <Kategori /> : <Satuan />}</div>
    </div>
  );
}
