import { useState, useRef, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import gsap from "gsap";

import {
  Pickaxe,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Loader2,
  HelpCircle,
  KeyRound,
  X,
  ShieldAlert,
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState(() => {
    return localStorage.getItem("rememberedEmail") || "";
  });
  const [rememberMe, setRememberMe] = useState(() => {
    return !!localStorage.getItem("rememberedEmail");
  });

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const navigate = useNavigate();
  const cardRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(
        logoRef.current,
        { opacity: 0, y: -20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" },
      ).fromTo(
        cardRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" },
      );
    });
    return () => ctx.revert();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // Langkah 1: login ke Firebase Auth (dipisah supaya error-nya jelas)
    let user;
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password,
      );
      user = userCredential.user;
    } catch (err) {
      console.error("AUTH ERROR:", err.code, err.message);
      toast.error(`Login gagal: ${err.code || err.message}`);
      setLoading(false);
      return;
    }

    // Langkah 2: ambil role & nama dari Firestore (dipisah juga)
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        localStorage.setItem("userRole", userData.role || "staff");
        localStorage.setItem(
          "userName",
          userData.name || userData.username || "Pengguna",
        );
      } else {
        console.warn("Dokumen users/" + user.uid + " tidak ditemukan");
        localStorage.setItem("userRole", "staff");
        localStorage.setItem("userName", "Pengguna");
      }
    } catch (err) {
      console.error("FIRESTORE ERROR:", err.code, err.message);
      toast.error(`Firestore gagal: ${err.code || err.message}`);
      setLoading(false);
      return;
    }

    // Langkah 3: fitur "Ingat Email Saya"
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", cleanEmail);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    toast.success("Login berhasil! Mengalihkan...");
    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-slate-950 px-4 py-8 box-border select-none">
      <Toaster position="top-right" />

      {/* Header Logo */}
      <div
        ref={logoRef}
        className="text-center mb-6 max-w-full flex flex-col items-center"
      >
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-3 text-emerald-400 shadow-lg shadow-emerald-950/50 flex items-center justify-center">
          <Pickaxe className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-emerald-400 tracking-wide uppercase font-mono">
          PT. Mega Putra Perkasa
        </h1>
      </div>

      {/* Form Login */}
      <div
        ref={cardRef}
        className="w-full max-w-90 sm:max-w-md p-6 sm:p-8 bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl text-white box-border"
      >
        <div className="mb-6 border-b border-slate-800/80 pb-4">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            System Portal Access
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Silakan masuk menggunakan Email ID operasional Anda
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Input Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email ID Karyawan
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 absolute left-3.5 text-slate-500 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none text-white text-sm placeholder-slate-600 transition"
                placeholder="e.g. joko@megaputra.internal"
              />
            </div>
          </div>

          {/* Input Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 transition font-medium cursor-pointer flex items-center gap-1"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Lupa Password?</span>
              </button>
            </div>

            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-3.5 text-slate-500 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:outline-none text-white text-sm placeholder-slate-600 transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-500 hover:text-emerald-400 transition focus:outline-none p-1 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Checkbox: Ingat Email Saya */}
          <div className="flex items-center justify-between text-xs py-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-emerald-600 focus:ring-emerald-500/50 focus:ring-offset-slate-900 cursor-pointer accent-emerald-500"
              />
              <span>Ingat Email Saya</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-semibold py-2.5 rounded-lg transition duration-200 shadow-lg shadow-emerald-950/50 disabled:opacity-50 text-sm flex items-center justify-center gap-2 group cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Sistem</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center text-[11px] text-slate-500 tracking-wider flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Logistik Management System &bull; Secured Connection</span>
      </div>

      {/* Modal Petunjuk Lupa Password Operasional */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-white relative">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl w-fit mb-3">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              Reset Password Operasional
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Untuk menjaga keamanan akun operasional tambang, reset password
              dilakukan secara terpusat oleh **Supervisor**.
            </p>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2 mb-5">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-300">
                  <span className="font-bold text-white block">
                    Langkah Pemulihan:
                  </span>
                  1. Hubungi Supervisor/Admin Site.
                  <br />
                  2. Minta reset password akun email Anda.
                  <br />
                  3. Supervisor akan mengganti password Anda secara instan di
                  panel User Management.
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-xl text-xs transition cursor-pointer"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
