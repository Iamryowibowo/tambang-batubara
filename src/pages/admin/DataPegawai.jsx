import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  Users,
  UserCheck,
  Building2,
  Edit3,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-hot-toast";
import CustomSelect from "../../components/Common/CustomSelect";
import DataPegawaiFormModal from "../../components/Modal/DataPegawaiFormModal";
import DeleteConfirmModal from "../../components/Buttons/DeleteConfirmModal";

export default function DataPegawai() {
  const [pegawaiList, setPegawaiList] = useState([]);
  const [listDepartemen, setListDepartemen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("Semua");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPegawai, setSelectedPegawai] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pegawaiToDelete, setPegawaiToDelete] = useState(null); // Menyimpan data pegawai yang mau dihapus

  const [formData, setFormData] = useState({
    nip: "",
    namaPegawai: "",
    departemen: "",
    jabatan: "",
    email: "",
    status: "Aktif",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const empSnapshot = await getDocs(collection(db, "employees"));
      const employees = empSnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const deptSnapshot = await getDocs(collection(db, "departemen"));
      const departments = deptSnapshot.docs.map(
        (d) => d.data().nama || d.data().namaDepartemen || d.id,
      );

      setPegawaiList(employees);
      setListDepartemen(departments);
    } catch (error) {
      console.error("Gagal memuat pegawai:", error);
      toast.error("Gagal memuat data dari database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const empSnapshot = await getDocs(collection(db, "employees"));
        const employees = empSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        const deptSnapshot = await getDocs(collection(db, "departemen"));
        const departments = deptSnapshot.docs.map(
          (d) => d.data().nama || d.data().namaDepartemen || d.id,
        );

        if (isMounted) {
          setPegawaiList(employees);
          setListDepartemen(departments);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Gagal memuat pegawai:", error);
          toast.error("Gagal memuat data dari database.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredList = useMemo(() => {
    return pegawaiList.filter((item) => {
      const namaVal = item.namaPegawai || item.nama || "";
      const matchesSearch =
        namaVal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.jabatan?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept =
        selectedDeptFilter === "Semua" ||
        item.departemen === selectedDeptFilter;

      return matchesSearch && matchesDept;
    });
  }, [pegawaiList, searchTerm, selectedDeptFilter]);

  const handleOpenAddModal = () => {
    setSelectedPegawai(null);
    setFormData({
      nip: `PGW-00${pegawaiList.length + 1}`,
      namaPegawai: "",
      departemen: listDepartemen[0] || "",
      jabatan: "",
      email: "",
      status: "Aktif",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pegawai) => {
    setSelectedPegawai(pegawai);
    setFormData({
      nip: pegawai.nip || "",
      namaPegawai: pegawai.namaPegawai || pegawai.nama || "",
      departemen: pegawai.departemen || "",
      jabatan: pegawai.jabatan || "",
      email: pegawai.email || "",
      status: pegawai.status || "Aktif",
    });
    setIsModalOpen(true);
  };

  //ini untuk buka modal konfirmasi hapus

  const handleDeleteClick = (id, namaPegawai) => {
    setPegawaiToDelete({ id, namaPegawai });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pegawaiToDelete) return;
    try {
      await deleteDoc(doc(db, "employees", pegawaiToDelete.id));
      toast.success("Data Pegawai Berhasil di Hapus");
      setIsDeleteModalOpen(false);
      setPegawaiToDelete(null);
      fetchData();
    } catch (error) {
      console.error("Gagal Menghapus Data: ", error);
      toast.error("Gagal Menghapus Pegawai");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        nip: formData.nip.toUpperCase(),
        namaPegawai: formData.namaPegawai,
        departemen: formData.departemen,
        jabatan: formData.jabatan,
        email: formData.email,
        status: formData.status,
      };

      if (selectedPegawai) {
        await updateDoc(doc(db, "employees", selectedPegawai.id), payload);
        toast.success("Data pegawai berhasil diperbarui!");
      } else {
        await addDoc(collection(db, "employees"), {
          ...payload,
          createdAt: new Date(),
        });
        toast.success("Pegawai baru berhasil ditambahkan!");
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      toast.error("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Data Pegawai
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Kelola informasi pegawai dan penugasan departemen.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pegawai</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total Pegawai
            </p>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              {pegawaiList.length} Orang
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Status Aktif
            </p>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              {pegawaiList.filter((p) => p.status === "Aktif").length} Orang
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/50 text-purple-600 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total Departemen
            </p>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              {listDepartemen.length} Unit
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari NIP, nama, atau jabatan..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-48">
            <CustomSelect
              value={selectedDeptFilter}
              onChange={setSelectedDeptFilter}
              options={[
                { id: "Semua", nama: "Semua Departemen" },
                ...listDepartemen.map((d) => ({ id: d, nama: d })),
              ]}
              placeholder="Semua Departemen"
              labelKey="nama"
              valueKey="id"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">NIP</th>
                <th className="px-6 py-4 font-semibold">Nama Pegawai</th>
                <th className="px-6 py-4 font-semibold">Departemen</th>
                <th className="px-6 py-4 font-semibold">Jabatan</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    Memuat data pegawai...
                  </td>
                </tr>
              ) : filteredList.length > 0 ? (
                filteredList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-emerald-600 dark:text-emerald-400">
                      {item.nip}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">
                      {item.namaPegawai || item.nama || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                        {item.departemen}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {item.jabatan}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {item.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteClick(
                              item.id,
                              item.namaPegawai || item.nama,
                            )
                          }
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    Data pegawai tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DataPegawaiFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        selectedPegawai={selectedPegawai}
        listDepartemen={listDepartemen}
        submitting={submitting}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Pegawai"
        message={`Apakah anda yakin ingin menghapus Pegawai "${pegawaiToDelete?.namaPegawai}"? Tindakan ini tidak dapat di batalkan `}
      />
    </div>
  );
}
