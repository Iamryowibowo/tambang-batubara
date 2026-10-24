import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-hot-toast";
import { X, Shield, Menu, LogOut, ChevronRight, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext.";
import { menuGroups } from "../config/sidebarConfig";
import NotificationDropdown from "../components/Common/NotificationDropdown";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Panggil Theme Context Universal
  const { isDarkMode, toggleTheme } = useTheme();

  // Ambil role & nama user yang aktif dari localStorage (disimpan saat login)
  const userRole = localStorage.getItem("userRole") || "admin";
  const userName = localStorage.getItem("userName") || "Administrator";

  const handleLogout = async () => {
    try {
      // 1. Sign out dari Firebase Auth
      await signOut(auth);

      // 2. Hapus data sesi di localStorage agar benar-benar bersih
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");
      localStorage.clear();

      toast.success("Berhasil keluar sistem");

      // 3. Redirect ke login dan hapus riwayat halaman (replace: true)
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error("Gagal keluar sistem");
    }
  };

  // Filter menu groups secara otomatis berdasarkan role user yang aktif
  const filteredMenuGroups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(userRole)),
    }))
    .filter((group) => group.items.length > 0); // Sembunyikan grup jika semua isinya kosong

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex overflow-hidden font-sans transition-colors duration-300">
      {/* Overlay Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigasi */}
      <aside
        className={`
        fixed lg:static top-0 bottom-0 left-0 z-50
        w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-r border-slate-200 dark:border-slate-800/80
        flex flex-col justify-between transition-all duration-300 ease-in-out shadow-xl dark:shadow-emerald-950/20
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Sidebar Header */}
          <div className="h-20 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-xl shadow-md">
                ⛏️
              </div>
              <div>
                <h2 className="font-black text-[10px] text-emerald-700 dark:text-emerald-400 tracking-wider font-mono uppercase">
                  PT. Mega Putra Perkasa
                </h2>
              </div>
            </div>

            {/* Tombol Close Mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden relative group p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-500/20 border border-slate-200 dark:border-slate-700/80 hover:border-rose-300 dark:hover:border-rose-500/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-200 active:scale-95 shadow-sm"
              title="Tutup Menu"
            >
              <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
            </button>
          </div>

          {/* Grouped Navigation Links */}
          <nav className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
            {filteredMenuGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-500/80 uppercase tracking-widest px-3 mb-1.5 font-mono flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {group.group}
                </div>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`
                        group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200
                        ${
                          isActive
                            ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 shadow-sm dark:shadow-emerald-950/40 font-bold translate-x-1"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 hover:translate-x-1"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base group-hover:scale-110 transition-transform duration-200">
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </div>

                      {isActive && (
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 space-y-3 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="p-2.5 bg-white dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-300 dark:border-emerald-500/30">
                  👨‍💼
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                    {userName}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate uppercase">
                    Role: {userRole}
                  </p>
                </div>
              </div>
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold transition active:scale-[0.98] cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar Sistem</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="h-16 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 active:scale-95 transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white">
                System Portal Logistics Management
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Integrated Inventory & Asset Terminal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Status Database */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                DATABASE ONLINE
              </span>
            </div>

            {/* Tombol Switch Mode */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-700 dark:text-amber-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-xl border border-slate-200 dark:border-slate-700/80 transition active:scale-95 flex items-center gap-1.5 text-xs font-semibold"
              title={
                isDarkMode ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"
              }
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline text-amber-400">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-600" />
                  <span className="hidden sm:inline text-slate-700">Dark</span>
                </>
              )}
            </button>

            {/* Notification Dropdown */}
            <NotificationDropdown />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
