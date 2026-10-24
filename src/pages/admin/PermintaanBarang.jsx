import { useState, useEffect, useMemo } from "react";
import { Plus, RotateCcw, AlertTriangle } from "lucide-react";

import { db } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import toast from "react-hot-toast";
import PermintaanTable from "../../components/Modal/PermintaanTable";
import PermintaanDetailModal from "../../components/Modal/PermintaanDetailModal";
import PermintaanFormModal from "../../components/Modal/PermintaanFormModal";
import ConfirmModal from "../../components/Modal/ConfirmModal";

export default function PermintaanBarang() {
  const [dataPermintaan, setDataPermintaan] = useState([]);
  const [dataBarang, setDataBarang] = useState([]);
  const [dataDepartemen, setDataDepartemen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Mengambil role langsung dari localStorage secara aman
  const [userRole] = useState(() => {
    return localStorage.getItem("userRole") || "admin";
  });

  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [prioritasFilter, setPrioritasFilter] = useState("");

  // Modal State
  const [selectedReq, setSelectedReq] = useState(null);
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);

  // State Confirm Modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    id: null,
    newStatus: "",
    item: null,
    title: "",
    message: "",
    isWarning: false,
  });

  // Form State
  const [formData, setFormData] = useState({
    pemohon: "",
    dept: "Maintenance",
    barang: "",
    kode: "",
    jml: "",
    prioritas: "Normal",
    keterangan: "",
  });

  // Fungsi helper untuk merefresh data setelah aksi
  const refreshData = async () => {
    try {
      const reqSnapshot = await getDocs(collection(db, "requests"));
      setDataPermintaan(
        reqSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
      );
    } catch (error) {
      console.error("Gagal refresh data:", error);
    }
  };

  // Ambil Data dari Firestore saat halaman dimuat
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        if (isMounted) setLoading(true);

        const reqSnapshot = await getDocs(collection(db, "requests"));
        const reqList = reqSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        const itemSnapshot = await getDocs(collection(db, "items"));
        const itemList = itemSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        const deptSnapshot = await getDocs(collection(db, "departemen"));
        const deptList = deptSnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        if (isMounted) {
          setDataPermintaan(reqList);
          setDataBarang(itemList);
          setDataDepartemen(deptList);
        }
      } catch (error) {
        console.error("Gagal memuat data:", error);
        toast.error("Gagal memuat data dari database.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const pendingCount = useMemo(() => {
    return dataPermintaan.filter((item) => item.status === "Menunggu").length;
  }, [dataPermintaan]);

  const filteredData = useMemo(() => {
    return dataPermintaan.filter((item) => {
      const matchStatus = statusFilter ? item.status === statusFilter : true;
      const matchDept = deptFilter ? item.dept === deptFilter : true;
      const matchPrioritas = prioritasFilter
        ? item.prioritas === prioritasFilter
        : true;

      return matchStatus && matchDept && matchPrioritas;
    });
  }, [dataPermintaan, statusFilter, deptFilter, prioritasFilter]);

  const handleResetFilter = () => {
    setStatusFilter("");
    setDeptFilter("");
    setPrioritasFilter("");
  };

  // Validasi Stok saat Tombol Setuju / Tolak Diklik
  const handleApprove = async (id, newStatus, item) => {
    if (newStatus === "Disetujui" && item) {
      const itemsRef = collection(db, "items");
      const q = query(itemsRef, where("kode", "==", item.kode));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const itemData = querySnapshot.docs[0].data();
        const currentStok = Number(itemData.stok || 0);
        const jumlahDiminta = Number(item.jml || 0);

        // Jika stok kurang dari jumlah permintaan
        if (currentStok < jumlahDiminta) {
          const docRef = doc(db, "requests", id);
          await updateDoc(docRef, { status: "Ditolak" });
          refreshData();

          setConfirmModal({
            isOpen: true,
            id: null,
            newStatus: "",
            item: null,
            title: "Permintaan Ditolak Otomatis",
            message: `Jumlah permintaan (${jumlahDiminta}) melebihi sisa stok gudang (${currentStok}). Permintaan ini dibatalkan otomatis karena melewati batas stok.`,
            isWarning: true,
          });
          return;
        }
      }
    }

    setConfirmModal({
      isOpen: true,
      id,
      newStatus,
      item,
      title: "Konfirmasi Aksi",
      message: (
        <>
          Apakah kamu yakin ingin mengubah status permintaan ini menjadi{" "}
          <strong className="text-slate-700 dark:text-slate-200">
            {newStatus}
          </strong>
          ?
          {newStatus === "Disetujui" &&
            " Stok barang akan berkurang dan tercatat ke Barang Keluar."}
        </>
      ),
      isWarning: false,
    });
  };

  // Eksekusi update status, stok, dan pencatatan barang keluar setelah konfirmasi
  const executeApprove = async () => {
    const { id, newStatus, item } = confirmModal;
    setConfirmModal({
      isOpen: false,
      id: null,
      newStatus: "",
      item: null,
      title: "",
      message: "",
      isWarning: false,
    });

    if (!id) return;

    try {
      // 1. Update status di "requests"
      const docRef = doc(db, "requests", id);
      await updateDoc(docRef, { status: newStatus });

      if (newStatus === "Disetujui" && item) {
        // 2. Kurangi stok di "items"
        const itemsRef = collection(db, "items");
        const q = query(itemsRef, where("kode", "==", item.kode));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const itemDocSnap = querySnapshot.docs[0];
          const itemRef = doc(db, "items", itemDocSnap.id);
          const currentStok = Number(itemDocSnap.data().stok || 0);
          const jumlahDiminta = Number(item.jml || 0);

          await updateDoc(itemRef, {
            stok: currentStok - jumlahDiminta,
          });
        }

        // 3. Otomatis catat ke koleksi "barangKeluar"
        await addDoc(collection(db, "barangKeluar"), {
          noDokumen: `BK-2026-${Math.floor(100 + Math.random() * 900)}`,
          tanggal: new Date().toISOString().split("T")[0],
          tanggalFormatted: new Date().toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          kode: item.kode,
          namaBarang: item.barang,
          jumlah: Number(item.jml),
          satuan: "Pcs",
          departemen: item.dept || "Maintenance",
          diserahkan: item.pemohon || "Staff",
          createdAt: serverTimestamp(),
        });
      }

      toast.success(
        `Permintaan berhasil ${newStatus.toLowerCase()} dan tercatat di Barang Keluar!`,
      );
      refreshData();
    } catch (error) {
      console.error("Gagal memperbarui status dan stok:", error);
      toast.error("Gagal mengubah status permintaan.");
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.pemohon || !formData.barang) return;

    setSubmitting(true);
    try {
      const employeesSnap = await getDocs(collection(db, "employees"));
      const existingEmployees = employeesSnap.docs.map((docSnap) =>
        docSnap.data().namaPegawai?.toLowerCase(),
      );

      const pemohonTrimmed = formData.pemohon.trim();
      if (!existingEmployees.includes(pemohonTrimmed.toLowerCase())) {
        const newNip = `PGW-00${employeesSnap.docs.length + 1}`;
        await addDoc(collection(db, "employees"), {
          nip: newNip,
          namaPegawai: pemohonTrimmed,
          departemen: formData.dept,
          jabatan: "Staff / Lapangan",
          email: `${pemohonTrimmed.toLowerCase().replace(/\s+/g, "")}@megaputra.co.id`,
          status: "Aktif",
          createdAt: serverTimestamp(),
        });
      }

      const newReqNo = `REQ-00${dataPermintaan.length + 1}`;
      const currentDate = new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      await addDoc(collection(db, "requests"), {
        noReq: newReqNo,
        tanggal: currentDate,
        pemohon: pemohonTrimmed,
        dept: formData.dept,
        kode: formData.kode.toUpperCase(),
        barang: formData.barang,
        jml: Number(formData.jml),
        prioritas: formData.prioritas,
        status: "Menunggu",
        keterangan: formData.keterangan || "-",
        createdAt: serverTimestamp(),
      });

      toast.success(
        "Permintaan barang berhasil dikirim & pemohon otomatis terdaftar!",
      );
      setIsModalFormOpen(false);
      setFormData({
        pemohon: "",
        dept: "Maintenance",
        barang: "",
        kode: "",
        jml: "",
        prioritas: "Normal",
        keterangan: "",
      });
      refreshData();
    } catch (error) {
      console.error("Gagal mengirim permintaan:", error);
      toast.error("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>|</span> Permintaan Barang
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Transaksi / Permintaan
          </p>
        </div>

        <button
          onClick={() => setIsModalFormOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition active:scale-95 shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Permintaan</span>
        </button>
      </div>

      {pendingCount > 0 && (
        <div className="flex items-center gap-2 p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-2xl text-xs font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            Ada <strong className="font-bold">{pendingCount} permintaan</strong>{" "}
            menunggu persetujuan Supervisor.
          </span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-700 dark:text-slate-300 min-w-35 cursor-pointer"
        >
          <option value="">Semua Status</option>
          <option value="Menunggu">Menunggu</option>
          <option value="Disetujui">Disetujui</option>
          <option value="Ditolak">Ditolak</option>
        </select>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-700 dark:text-slate-300 min-w-37.5 cursor-pointer"
        >
          <option value="">Semua Departemen</option>
          {dataDepartemen.map((dept) => (
            <option key={dept.id} value={dept.nama}>
              {dept.nama}
            </option>
          ))}
        </select>

        <select
          value={prioritasFilter}
          onChange={(e) => setPrioritasFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-700 dark:text-slate-300 min-w-35 cursor-pointer"
        >
          <option value="">Semua Prioritas</option>
          <option value="Urgent">Urgent</option>
          <option value="Normal">Normal</option>
        </select>

        <button
          onClick={handleResetFilter}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          Memuat data dari database...
        </div>
      ) : (
        <PermintaanTable
          filteredData={filteredData}
          dataPermintaan={dataPermintaan}
          onDetail={(item) => {
            setSelectedReq(item);
            setIsModalDetailOpen(true);
          }}
          onApprove={handleApprove}
          userRole={userRole}
        />
      )}

      {/* Komponen Modal Konfirmasi Terpisah */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal({
            isOpen: false,
            id: null,
            newStatus: "",
            item: null,
            title: "",
            message: "",
            isWarning: false,
          })
        }
        onConfirm={executeApprove}
        title={confirmModal.title}
        message={confirmModal.message}
        isWarning={confirmModal.isWarning}
      />

      <PermintaanDetailModal
        isOpen={isModalDetailOpen}
        onClose={() => setIsModalDetailOpen(false)}
        selectedReq={selectedReq}
      />

      <PermintaanFormModal
        isOpen={isModalFormOpen}
        onClose={() => setIsModalFormOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmitForm}
        dataBarang={dataBarang}
        dataDepartemen={dataDepartemen}
        submitting={submitting}
      />
    </div>
  );
}
