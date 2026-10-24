import { useState, useEffect } from "react";
import { Plus, Search, Building2, Users, CheckCircle2 } from "lucide-react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import toast from "react-hot-toast";

import DepartemenTable from "../../components/Modal/DepartemenTable";
import DepartemenFormModal from "../../components/Modal/DepartemenFormModal";
import DeleteConfirmModal from "../../components/Buttons/DeleteConfirmModal";

export default function Departemen() {
  const [departemenList, setDepartemenList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null); // Menyimpan data departemen yang mau dihapus

  const [formData, setFormData] = useState({
    kode: "",
    nama: "",
    kepala: "",
    jmlPegawai: 0,
    status: "Aktif",
  });

  // Fungsi fetch data dipisah yang dipanggil lewat helper / handler event
  const fetchDepartemenData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "departemen"));
      const list = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setDepartemenList(list);
    } catch (error) {
      console.error("Gagal memuat departemen:", error);
      toast.error("Gagal memuat data departemen dari database.");
    } finally {
      setLoading(false);
    }
  };

  // useEffect murni tanpa memanggil fungsi luar yang nge-trigger state di luar scope aman
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "departemen"));
        const list = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        if (isMounted) {
          setDepartemenList(list);
        }
      } catch (error) {
        console.error("Gagal memuat departemen:", error);
        toast.error("Gagal memuat data departemen dari database.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter Search Realtime
  const filteredList = departemenList.filter((item) => {
    const nama = item.nama || "";
    const kode = item.kode || "";
    const kepala = item.kepala || "";
    return (
      nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kepala.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleOpenAddModal = () => {
    setSelectedDept(null);
    setFormData({
      kode: `DPT-00${departemenList.length + 1}`,
      nama: "",
      kepala: "",
      jmlPegawai: 0,
      status: "Aktif",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept) => {
    setSelectedDept(dept);
    setFormData({
      kode: dept.kode || "",
      nama: dept.nama || "",
      kepala: dept.kepala || "",
      jmlPegawai: dept.jmlPegawai || 0,
      status: dept.status || "Aktif",
    });
    setIsModalOpen(true);
  };

  // Trigger untuk membuka Modal Konfirmasi Hapus
  const handleDeleteClick = (id, nama) => {
    setDeptToDelete({ id, nama });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deptToDelete) return;
    try {
      await deleteDoc(doc(db, "departemen", deptToDelete.id));
      toast.success("Departemen berhasil dihapus!");
      setIsDeleteModalOpen(false);
      setDeptToDelete(null);
      fetchDepartemenData();
    } catch (error) {
      console.error("Gagal menghapus:", error);
      toast.error("Gagal menghapus departemen.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedDept) {
        await updateDoc(doc(db, "departemen", selectedDept.id), {
          kode: formData.kode,
          nama: formData.nama,
          kepala: formData.kepala,
          jmlPegawai: Number(formData.jmlPegawai),
          status: formData.status,
        });
        toast.success("Departemen berhasil diperbarui!");
      } else {
        await addDoc(collection(db, "departemen"), {
          kode: formData.kode,
          nama: formData.nama,
          kepala: formData.kepala,
          jmlPegawai: Number(formData.jmlPegawai),
          status: formData.status,
          createdAt: serverTimestamp(),
        });
        toast.success("Departemen baru berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      fetchDepartemenData();
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      toast.error("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>|</span> Data Departemen
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organisasi / Departemen
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition active:scale-95 shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Departemen</span>
        </button>
      </div>

      {/* Ringkasan Informasi (Stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total Departemen
            </p>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {departemenList.length} Unit
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total Pegawai Terdaftar
            </p>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {departemenList.reduce(
                (acc, curr) => acc + Number(curr.jmlPegawai || 0),
                0,
              )}{" "}
              Orang
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Status Aktif
            </p>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              100%
            </h3>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau kode departemen..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none text-slate-800 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabel Moduler */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          Memuat data departemen dari database...
        </div>
      ) : (
        <DepartemenTable
          filteredList={filteredList}
          departemenList={departemenList}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Modal Form */}
      <DepartemenFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDept={selectedDept}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      {/* Modal Konfirmasi Hapus Kustom */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Departemen"
        message={`Apakah Anda yakin ingin menghapus departemen "${deptToDelete?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
