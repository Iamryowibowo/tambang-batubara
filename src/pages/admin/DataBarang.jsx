import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
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
import DeleteConfirmModal from "../../components/Buttons/DeleteConfirmModal";
import CustomSelect from "../../components/Common/CustomSelect";
import DataBarangFormModal from "../../components/Modal/DataBarangFormModal";
import { exportToExcel, printDataPDF } from "../../utils/exportUtils"; // <-- Import Helper Export & PDF

export default function DataBarang() {
  const [dataBarang, setDataBarang] = useState([]);
  const [unitsList, setUnitsList] = useState([]);
  const [vendorsList, setVendorsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    kode: "",
    nama: "",
    kategori: "",
    satuan: "",
    harga: "",
    stok: "",
    min: "",
    vendor: "",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const itemsSnapshot = await getDocs(collection(db, "items"));
      setDataBarang(itemsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })));

      const unitsSnapshot = await getDocs(collection(db, "units"));
      setUnitsList(unitsSnapshot.docs.map((d) => d.data()));

      const vendorsSnapshot = await getDocs(collection(db, "vendors"));
      setVendorsList(vendorsSnapshot.docs.map((d) => d.data()));

      const categoriesSnapshot = await getDocs(collection(db, "categories"));
      setCategoriesList(categoriesSnapshot.docs.map((d) => d.data()));
    } catch (error) {
      console.error("Gagal memuat data:", error);
      toast.error("Gagal memuat data dari database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        setLoading(true);
        const itemsSnapshot = await getDocs(collection(db, "items"));
        const items = itemsSnapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        const unitsSnapshot = await getDocs(collection(db, "units"));
        const units = unitsSnapshot.docs.map((d) => d.data());

        const vendorsSnapshot = await getDocs(collection(db, "vendors"));
        const vendors = vendorsSnapshot.docs.map((d) => d.data());

        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const categories = categoriesSnapshot.docs.map((d) => d.data());

        if (isMounted) {
          setDataBarang(items);
          setUnitsList(units);
          setVendorsList(vendors);
          setCategoriesList(categories);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Gagal memuat data:", error);
          toast.error("Gagal memuat data dari database.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const getStatus = (stok, min) => {
    if (stok <= min / 2) return "Kritis";
    if (stok <= min) return "Menipis";
    return "Aman";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Aman":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30";
      case "Menipis":
        return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border-amber-200 dark:border-amber-500/30";
      case "Kritis":
        return "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border-rose-200 dark:border-rose-500/30";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const filteredData = useMemo(() => {
    return dataBarang.filter((item) => {
      const status = getStatus(Number(item.stok), Number(item.min));
      const matchSearch =
        item.kode?.toLowerCase().includes(search.toLowerCase()) ||
        item.nama?.toLowerCase().includes(search.toLowerCase()) ||
        item.vendor?.toLowerCase().includes(search.toLowerCase());

      const matchKategori = selectedKategori
        ? item.kategori === selectedKategori
        : true;
      const matchStatus = selectedStatus ? status === selectedStatus : true;

      return matchSearch && matchKategori && matchStatus;
    });
  }, [dataBarang, search, selectedKategori, selectedStatus]);

  const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  const handleOpenModal = (item = null) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        kode: item.kode,
        nama: item.nama,
        kategori: item.kategori,
        satuan: item.satuan,
        harga: item.harga,
        stok: item.stok,
        min: item.min,
        vendor: item.vendor,
      });
    } else {
      setSelectedItem(null);
      setFormData({
        kode: `A00${dataBarang.length + 1}`,
        nama: "",
        kategori: categoriesList[0]?.namaKategori || "",
        satuan: unitsList[0]?.namaSatuan || "",
        harga: "",
        stok: "",
        min: "10",
        vendor: vendorsList[0]?.namaVendor || "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.kode || !formData.nama) return;

    setSubmitting(true);
    try {
      const payload = {
        kode: formData.kode.toUpperCase(),
        nama: formData.nama,
        kategori: formData.kategori,
        satuan: formData.satuan,
        harga: Number(formData.harga),
        stok: Number(formData.stok),
        min: Number(formData.min),
        vendor: formData.vendor,
      };

      if (selectedItem) {
        await updateDoc(doc(db, "items", selectedItem.id), payload);
        toast.success("Data barang berhasil diperbarui!");
      } else {
        await addDoc(collection(db, "items"), {
          ...payload,
          createdAt: new Date(),
        });
        toast.success("Barang baru berhasil ditambahkan!");
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

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "items", itemToDelete.id));
      toast.success("Barang berhasil dihapus!");
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (error) {
      console.error("Gagal menghapus:", error);
      toast.error("Gagal menghapus data.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>|</span> Data Barang
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Master Data / Data Barang Logistik Tambang
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Tombol Export Excel */}
          <button
            onClick={() => exportToExcel(filteredData)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel</span>
          </button>

          {/* Tombol Print PDF */}
          <button
            onClick={() => printDataPDF(filteredData)}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>PDF</span>
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition active:scale-95 shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Barang</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Section */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-60">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode / nama / vendor"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="min-w-40">
          <CustomSelect
            value={selectedKategori}
            onChange={setSelectedKategori}
            options={categoriesList}
            placeholder="Semua Kategori"
            labelKey="namaKategori"
            valueKey="namaKategori"
          />
        </div>

        <div className="min-w-40">
          <CustomSelect
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={[
              { id: "Aman", nama: "Aman" },
              { id: "Menipis", nama: "Menipis" },
              { id: "Kritis", nama: "Kritis" },
            ]}
            placeholder="Semua Status"
            labelKey="nama"
            valueKey="id"
          />
        </div>

        <button
          onClick={() => {
            setSearch("");
            setSelectedKategori("");
            setSelectedStatus("");
          }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Tabel Data */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-400 uppercase font-mono">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">Kode</th>
                <th className="py-3.5 px-4">Nama Barang</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Satuan</th>
                <th className="py-3.5 px-4">Harga</th>
                <th className="py-3.5 px-4 min-w-28">Stok</th>
                <th className="py-3.5 px-4">Min.</th>
                <th className="py-3.5 px-4">Vendor</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="11" className="text-center py-12 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    Memuat data barang...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-12 text-slate-400">
                    Tidak ada data barang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => {
                  const status = getStatus(Number(item.stok), Number(item.min));
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 text-center text-slate-400 font-mono">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {item.kode}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">
                        {item.nama}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {item.kategori}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {item.satuan}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {formatRupiah(item.harga || 0)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {item.stok}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{item.min}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {item.vendor || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(
                            status,
                          )}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 hover:bg-amber-100 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setItemToDelete(item);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 hover:bg-rose-100 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Barang */}
      {isDetailModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500" /> Detail Informasi
                Barang
              </h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block font-mono text-[10px] uppercase">
                    Kode Barang
                  </span>
                  <span className="font-bold font-mono text-slate-800 dark:text-white text-sm">
                    {selectedItem.kode}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono text-[10px] uppercase">
                    Kategori
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {selectedItem.kategori}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-mono text-[10px] uppercase">
                  Nama Barang
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedItem.nama}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 block font-mono text-[10px] uppercase">
                    Satuan
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {selectedItem.satuan}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono text-[10px] uppercase">
                    Harga Satuan
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(selectedItem.harga || 0)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 block font-mono text-[10px] uppercase">
                    Stok Gudang
                  </span>
                  <span className="font-bold text-slate-800 dark:text-white text-sm">
                    {selectedItem.stok}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono text-[10px] uppercase">
                    Stok Min.
                  </span>
                  <span className="font-bold text-slate-600 dark:text-slate-400 text-sm">
                    {selectedItem.min}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono text-[10px] uppercase">
                    Status
                  </span>
                  <span
                    className={`font-bold ${
                      getStatus(
                        Number(selectedItem.stok),
                        Number(selectedItem.min),
                      ) === "Aman"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {getStatus(
                      Number(selectedItem.stok),
                      Number(selectedItem.min),
                    )}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-mono text-[10px] uppercase">
                  Vendor / Supplier
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {selectedItem.vendor || "-"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Tambah/Edit */}
      <DataBarangFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        selectedItem={selectedItem}
        categoriesList={categoriesList}
        unitsList={unitsList}
        vendorsList={vendorsList}
        submitting={submitting}
      />

      {/* Modal Konfirmasi Hapus */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Hapus Data Barang"
        message={`Apakah Anda yakin ingin menghapus barang "${itemToDelete?.nama}"?`}
      />
    </div>
  );
}
