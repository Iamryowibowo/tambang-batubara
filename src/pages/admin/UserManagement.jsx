import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { db, auth } from "../../firebase";
import { toast } from "react-hot-toast";
import UserFormModal from "../../components/Modal/UserFormModal";
import CustomSelect from "../../components/Common/CustomSelect";
import DeleteConfirmModal from "../../components/Buttons/DeleteConfirmModal";
import { Pencil, Trash2 } from "lucide-react";

const EMAIL_DOMAIN = "@megaputra.internal";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("Semua Role");

  const roleOptions = [
    {
      value: "supervisor",
      label: "Supervisor",
      color:
        "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300",
    },
    {
      value: "admin",
      label: "Admin",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
    },
    {
      value: "logistic",
      label: "Logistic",
      color:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
    },
    {
      value: "accounting",
      label: "Accounting",
      color:
        "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    },
    {
      value: "gm",
      label: "General Manager (GM)",
      color: "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300",
    },
  ];

  const reloadUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setUsers(userList);
    } catch (error) {
      console.error("Gagal memuat ulang data user:", error);
      toast.error("Gagal memuat ulang data pengguna.");
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      await reloadUsers();
      setLoading(false);
    };

    fetchUsers();
  }, []);

  // Buat akun Auth lewat app kedua supaya supervisor tidak ikut ke-logout
  const createAuthUser = async (email, password) => {
    const secondary =
      getApps().find((a) => a.name === "secondary") ||
      initializeApp(auth.app.options, "secondary");
    const secAuth = getAuth(secondary);
    const cred = await createUserWithEmailAndPassword(secAuth, email, password);
    await signOut(secAuth);
    return cred.user.uid;
  };

  const handleSaveUser = async ({ id, name, username, password, role }) => {
    try {
      if (id) {
        // MODE EDIT: hanya nama & role
        await setDoc(
          doc(db, "users", id),
          {
            name: name.trim(),
            role: role,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
        toast.success("Data user berhasil diperbarui!");
      } else {
        // MODE TAMBAH
        if (!password) {
          toast.error("Password wajib diisi untuk user baru!");
          return;
        }

        const cleanUsername = username.trim().toLowerCase();
        const email = `${cleanUsername}${EMAIL_DOMAIN}`;

        const uid = await createAuthUser(email, password);

        await setDoc(doc(db, "users", uid), {
          name: name.trim(),
          username: cleanUsername,
          email: email,
          role: role,
          createdAt: new Date().toISOString(),
        });
        toast.success("User baru berhasil didaftarkan!");
      }

      setIsModalOpen(false);
      setEditData(null);
      reloadUsers();
    } catch (error) {
      console.error("Gagal menyimpan user:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error(
          "Username ini pernah dipakai. Gunakan username lain (misal tambah angka).",
        );
      } else if (error.code === "auth/weak-password") {
        toast.error("Password terlalu lemah, minimal 6 karakter.");
      } else {
        toast.error(
          "Gagal: " + (error.message || "Terjadi kesalahan pada sistem."),
        );
      }
    }
  };

  const handleDeleteClick = (id, userName) => {
    setUserToDelete({ id, userName });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteDoc(doc(db, "users", userToDelete.id));
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      toast.success("Akses user berhasil dicabut.");
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Gagal menghapus user:", error);
      toast.error("Gagal menghapus user dari sistem.");
    }
  };

  const filterRoleOptions = [
    { label: "Semua Role", value: "Semua Role" },
    ...roleOptions.map((r) => ({ label: r.label, value: r.value })),
  ];

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.username &&
        u.username.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole =
      selectedRoleFilter === "Semua Role" || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-black">
              |
            </span>{" "}
            User Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Organisasi / User Management
          </p>
        </div>

        <button
          onClick={() => {
            setEditData(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-medium px-4 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
        >
          <span>+ Tambah User Baru</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {roleOptions.map((r) => {
          const count = users.filter((u) => u.role === r.value).length;
          return (
            <div
              key={r.value}
              className="bg-white dark:bg-[#111827] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors"
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {r.label}
              </span>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
                {count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#111827] rounded-xl p-4 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 transition-colors">
        <div className="flex-1 min-w-60">
          <input
            type="text"
            placeholder="🔍 Cari nama atau username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          />
        </div>

        <div className="w-48">
          <CustomSelect
            options={filterRoleOptions}
            value={selectedRoleFilter}
            onChange={(val) => setSelectedRoleFilter(val)}
            placeholder="Filter Role"
            valueKey="value"
            labelKey="label"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#111827] rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50 dark:bg-slate-900/50">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">NAMA</th>
                <th className="py-3 px-4">USERNAME LOGIN</th>
                <th className="py-3 px-4">ROLE AKTIF</th>
                <th className="py-3 px-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400">
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400">
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((item, index) => {
                  const roleObj = roleOptions.find(
                    (r) => r.value === item.role,
                  );
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">
                        {item.name || "-"}
                      </td>
                      <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                        {item.username || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${roleObj ? roleObj.color : "bg-slate-100 text-slate-700"}`}
                        >
                          {item.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditData(item);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                            title="Edit Nama & Role"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteClick(item.id, item.name)
                            }
                            className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                            title="Hapus"
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

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-medium bg-slate-50/30 dark:bg-slate-900/30">
          Menampilkan {filteredUsers.length} dari {users.length} pengguna
          terdaftar
        </div>
      </div>

      <UserFormModal
        key={editData ? editData.id : "new-user-modal"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveUser}
        initialData={editData}
        roleOptions={roleOptions}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Akun Pengguna"
        message={`Apakah Anda yakin ingin mencabut akses akun "${userToDelete?.userName}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
