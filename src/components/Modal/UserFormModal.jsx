import { useState } from "react";
import CustomSelect from "../Common/CustomSelect";
import { Eye, EyeOff, KeyRound } from "lucide-react";

export default function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  roleOptions,
}) {
  const [name, setName] = useState(initialData?.name || "");
  const [username, setUsername] = useState(initialData?.username || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(initialData?.role || "logistic");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Bersihkan username dari spasi/karakter aneh
    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, "_");

    onSubmit({
      id: initialData?.id,
      name,
      username: cleanUsername,
      password,
      role,
    });
  };

  const selectRoleOptions = roleOptions.map((r) => ({
    value: r.value,
    label: r.label,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#111827] rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {initialData ? "Edit User & Hak Akses" : "Tambah User Baru"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Nama Lengkap Karyawan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Ahmad Logistics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              required
            />
          </div>

          {/* Username Login */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Username Login <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. ahmad_logistik (tanpa spasi)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={!!initialData} // Username dikunci saat edit agar akun Auth tidak rusak
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none disabled:opacity-50"
              required
            />
            {initialData && (
              <span className="text-[10px] text-slate-400 mt-1 block">
                Username tidak dapat diubah.
              </span>
            )}
          </div>

          {/* Input Password + Show/Hide */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                {initialData
                  ? "Set Password Baru (Opsional)"
                  : "Password Login *"}
              </label>
              {initialData && (
                <span className="text-[10px] text-slate-400 italic">
                  Kosongkan jika tidak ubah password
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={
                  initialData
                    ? "Masukkan password baru..."
                    : "Minimal 6 karakter"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                required={!initialData}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {initialData && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl flex items-start gap-2">
              <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700 dark:text-amber-300 leading-tight">
                Jika pegawai lupa password, Supervisor cukup ketik password baru
                di sini lalu klik Update Akun.
              </p>
            </div>
          )}

          {/* Role Access */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Pilih Role Akses <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              options={selectRoleOptions}
              value={role}
              onChange={(val) => setRole(val)}
              placeholder="Pilih Role"
              valueKey="value"
              labelKey="label"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer"
            >
              {initialData ? "Update Akun" : "Simpan & Daftarkan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
