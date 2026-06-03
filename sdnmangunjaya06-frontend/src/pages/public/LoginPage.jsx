import { GraduationCap, LockKeyhole, UserRound, Shield, BookOpen, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/Toast.jsx";
import latarsekolah from "../../images/latarsekolah.png";
import logoNoBg from "../../images/logonobg.png";

const routeByRole = {
  admin: "/admin",
  guru: "/guru",
  siswa: "/siswa",
};

const sentenceVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const wordVariants = {
  hidden: {
    opacity: 0,
    y: 15,
    rotate: -3,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function LoginPage() {
  const { isAuthenticated, login, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "admin", password: "admin123" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const words = "Satu sistem untuk mengelola nilai secara terukur.".split(" ");

  if (isAuthenticated) {
    return <Navigate to={routeByRole[user?.role] || "/"} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loggedUser = await login(form);
      showToast(`Selamat datang, ${loggedUser.name}! Login berhasil.`, "success");
      const destination = location.state?.from?.pathname || routeByRole[loggedUser.role] || "/";
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Login gagal. Periksa username dan password.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (username, password) => {
    setForm({ username, password });
    setError("");
  };

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1fr_520px]">
      <section className="relative hidden bg-gradient-to-br from-slate-950 via-teal-950 to-teal-700 p-10 text-white lg:flex lg:flex-col lg:justify-between overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.24] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url(${latarsekolah})` }} />

        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg overflow-hidden ring-2 ring-white/20">
            <img src={logoNoBg} alt="Logo SDN Mangunjaya 06" className="h-full w-full object-cover rounded-full scale-[1.25]" />
          </div>
          <div>
            <p className="font-black font-plus-jakarta leading-none">SDN Mangunjaya 06</p>
            <p className="text-xs text-teal-100 font-nunito font-semibold mt-0.5">Sistem Informasi Penilaian</p>
          </div>
        </Link>

        <div className="relative z-10">
          <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-inter font-semibold">Admin · Guru · Siswa</p>

          <motion.h1 variants={sentenceVariants} initial="hidden" animate="visible" className="max-w-xl text-5xl font-black font-plus-jakarta tracking-tight text-white min-h-[140px] leading-[1.2] select-none">
            {words.map((word, i) => (
              <motion.span key={i} variants={wordVariants} className="inline-block mr-[0.25em]">
                {word}
              </motion.span>
            ))}

            {/* Elegant Hand-drawn Underline Accent */}
            <div className="mt-3 h-4 w-full max-w-[280px]">
              <svg viewBox="0 0 300 12" fill="none" className="text-teal-400 opacity-90">
                <motion.path
                  d="M 8 6 C 90 2, 180 8, 292 4"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  variants={{
                    hidden: { pathLength: 0 },
                    visible: {
                      pathLength: 1,
                      transition: {
                        delay: 1.3,
                        duration: 1.1,
                        ease: "easeOut",
                      },
                    },
                  }}
                />
              </svg>
            </div>
          </motion.h1>

          <p className="mt-6 max-w-xl leading-relaxed text-teal-100/90 font-nunito font-normal text-sm">
            Platform digital yang hadir untuk mempermudah guru dalam menginput nilai, serta membantu siswa dan orang tua memantau perkembangan akademik secara transparan. Melalui sistem yang efisien, akurat, dan aman, kami berkomitmen
            mewujudkan tata kelola administrasi sekolah yang modern demi mendukung akuntabilitas pencapaian prestasi siswa.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 w-full border-t border-white/10 pt-4">
          <p className="text-sm text-teal-100">© 2026 SDN Mangunjaya 06. All Rights Reserved. Built with React by Rifky Devs.</p>
          <a href="/#informasi-sekolah" className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/20 uppercase tracking-wider font-plus-jakarta">
            Detail Informasi
          </a>
        </div>
      </section>

      <section className="relative flex items-center justify-center p-5 font-inter bg-gradient-to-br from-slate-50 via-white to-teal-50 overflow-hidden">
        {/* Decorative Blurred Circles */}
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-200/30 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-emerald-200/20 blur-3xl pointer-events-none" />

        <motion.form
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={handleSubmit}
          className="relative z-10 w-full max-w-md rounded-[2rem] border border-slate-200/70 bg-white/90 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.06)] backdrop-blur-sm"
        >
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-teal-50 text-teal-700 ring-4 ring-teal-50/50 shadow-sm">
              <GraduationCap size={32} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700 mb-1.5 font-plus-jakarta">Akses Sistem Sekolah</p>
            <h1 className="text-2xl font-black text-slate-950 font-plus-jakarta tracking-tight">Login Sistem</h1>
            <p className="mt-2 text-sm text-slate-500">Masukkan username dan password yang sudah terdaftar.</p>
          </div>

          {error && <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}

          <div className="mb-4">
            <label className="label" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <UserRound className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input id="username" className="input pl-11" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} autoComplete="username" required />
            </div>
          </div>

          <div className="mb-6">
            <label className="label" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <LockKeyhole className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input id="password" className="input pl-11" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="current-password" required />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="btn-primary w-full bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 shadow-md shadow-teal-700/10 font-plus-jakarta font-bold"
          >
            {loading ? "Memproses..." : "Masuk"}
          </motion.button>

          <div className="mt-6 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-plus-jakarta text-center">Pilih Akun Demo</p>

            <div className="grid gap-2.5">
              {/* Admin Demo Card */}
              <button
                type="button"
                onClick={() => fillDemo("admin", "admin123")}
                className="group flex items-center justify-between rounded-2xl border border-slate-100/70 bg-slate-50/80 p-3 text-left transition hover:border-teal-200/80 hover:bg-teal-50/50 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800 font-plus-jakarta">Administrator</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      username: admin <span className="text-slate-300 mx-1">|</span> password: <span className="font-bold text-slate-700">admin123</span>
                    </p>
                  </div>
                </div>
                <div className="opacity-0 transition group-hover:opacity-100 text-teal-600 pr-1">
                  <ArrowUpRight size={16} />
                </div>
              </button>

              {/* Guru Demo Card */}
              <button
                type="button"
                onClick={() => fillDemo("guru", "guru123")}
                className="group flex items-center justify-between rounded-2xl border border-slate-100/70 bg-slate-50/80 p-3 text-left transition hover:border-teal-200/80 hover:bg-teal-50/50 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800 font-plus-jakarta">Guru Kelas</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      username: guru <span className="text-slate-300 mx-1">|</span> password: <span className="font-bold text-slate-700">guru123</span>
                    </p>
                  </div>
                </div>
                <div className="opacity-0 transition group-hover:opacity-100 text-teal-600 pr-1">
                  <ArrowUpRight size={16} />
                </div>
              </button>

              {/* Siswa Demo Card */}
              <button
                type="button"
                onClick={() => fillDemo("siswa", "siswa123")}
                className="group flex items-center justify-between rounded-2xl border border-slate-100/70 bg-slate-50/80 p-3 text-left transition hover:border-teal-200/80 hover:bg-teal-50/50 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition group-hover:bg-amber-100">
                    <GraduationCap size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800 font-plus-jakarta">Siswa / Wali Murid</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      username: siswa <span className="text-slate-300 mx-1">|</span> password: <span className="font-bold text-slate-700">siswa123</span>
                    </p>
                  </div>
                </div>
                <div className="opacity-0 transition group-hover:opacity-100 text-teal-600 pr-1">
                  <ArrowUpRight size={16} />
                </div>
              </button>
            </div>
          </div>
        </motion.form>
      </section>
    </main>
  );
}
