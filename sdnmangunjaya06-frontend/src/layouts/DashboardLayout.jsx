import { BookOpen, ClipboardCheck, GraduationCap, Home, LayoutDashboard, LogOut, Menu, School, Users, UserRound, X, User, UserCog } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import logoNoBg from "../images/logonobg.webp";
import Avatar from "../components/ui/Avatar.jsx";
import PageBackground from "../components/PageBackground.jsx";
import PageWrapper from "../components/PageWrapper.jsx";

const categoriesByRole = {
  admin: [
    {
      title: "Utama",
      items: [
        { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true }
      ]
    },
    {
      title: "Master Data",
      items: [
        { to: "/admin/siswa", label: "Data Siswa", icon: Users },
        { to: "/admin/guru", label: "Data Guru", icon: UserRound },
        { to: "/admin/kelas", label: "Data Kelas", icon: School },
        { to: "/admin/mapel", label: "Mata Pelajaran", icon: BookOpen }
      ]
    },
    {
      title: "Akademik",
      items: [
        { to: "/admin/laporan", label: "Laporan Nilai", icon: ClipboardCheck }
      ]
    },
    {
      title: "Sistem",
      items: [
        { to: "/admin/akun", label: "Manajemen Akun", icon: UserCog },
        { to: "/profile", label: "Profil Saya", icon: User }
      ]
    }
  ],
  guru: [
    {
      title: "Utama",
      items: [
        { to: "/guru", label: "Dashboard", icon: LayoutDashboard, end: true }
      ]
    },
    {
      title: "Akademik",
      items: [
        { to: "/guru/input-nilai", label: "Input Nilai", icon: ClipboardCheck },
        { to: "/guru/rekap", label: "Rekap Nilai", icon: BookOpen },
        { to: "/guru/rekap", label: "Cetak Laporan", icon: ClipboardCheck }
      ]
    },
    {
      title: "Akun",
      items: [
        { to: "/profile", label: "Profil Saya", icon: User }
      ]
    }
  ],
  siswa: [
    {
      title: "Akademik",
      items: [
        { to: "/siswa", label: "Nilai Saya", icon: GraduationCap, end: true },
        { to: "/siswa", label: "Cetak Nilai", icon: ClipboardCheck }
      ]
    },
    {
      title: "Akun",
      items: [
        { to: "/profile", label: "Profil Saya", icon: User }
      ]
    }
  ]
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const categories = categoriesByRole[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const Sidebar = () => (
    <aside className="flex h-full flex-col bg-slate-950 p-5 text-white overflow-y-auto">
      <div className="flex items-center gap-3 rounded-3xl bg-white/5 p-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg overflow-hidden ring-2 ring-white/20">
          <img src={logoNoBg} alt="Logo SDN Mangunjaya 06" className="h-full w-full object-cover rounded-full scale-[1.25]" />
        </div>
        <div>
          <p className="font-black leading-tight text-sm">SDN Mangunjaya 06</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-0.5">Sistem Penilaian</p>
        </div>
      </div>

      <nav className="mt-8 flex-1 space-y-6">
        {categories.map((cat, catIdx) => (
          <div key={catIdx} className="space-y-1.5">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">{cat.title}</p>
            <div className="space-y-1">
              {cat.items.map((item) => (
                <NavLink
                  key={item.to + "-" + item.label}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${isActive ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                >
                  <item.icon size={16} className="transition-transform group-hover:scale-105" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <button type="button" onClick={handleLogout} className="mt-5 flex items-center gap-3 rounded-2xl px-4 py-2.5 text-left text-xs font-bold text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400 border border-slate-800/80 hover:border-rose-500/20">
        <LogOut size={16} />
        Keluar
      </button>
    </aside>
  );

  return (
    <PageBackground role={user?.role}>
      <div className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">
        <Sidebar />
      </div>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/50" onClick={() => setOpen(false)} />
          <motion.div initial={{ x: -320 }} animate={{ x: 0 }} className="relative h-full w-72">
            <Sidebar />
          </motion.div>
        </div>
      )}

      <main className="lg:pl-72 min-h-screen flex flex-col min-w-0 w-full">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
          <div className="flex h-20 items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setOpen(!open)} className="rounded-2xl border border-slate-200 p-3 lg:hidden hover:bg-slate-50 transition">
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
              <span className="hidden md:inline text-xs font-black uppercase text-slate-400 tracking-wider">SDN MANGUNJAYA 06 PENILAIAN SYSTEM</span>
            </div>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 rounded-2xl hover:bg-slate-50 p-1.5 transition text-left focus:outline-none"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-slate-950 leading-none">{user?.name}</p>
                  <p className="text-[10px] font-black uppercase tracking-wider text-teal-700 mt-1">{user?.role}</p>
                </div>
                <Avatar photoUrl={user?.photo_url} name={user?.name} size="sm" className="ring-2 ring-teal-500/20" />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl z-40 animate-scale-up">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-2 border-b border-slate-100 mb-1">
                      Menu Cepat
                    </p>
                    <NavLink
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition"
                    >
                      <User size={15} /> Profil Saya
                    </NavLink>
                    {user?.role === "admin" && (
                      <NavLink
                        to="/admin/akun"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition"
                      >
                        <UserCog size={15} /> Manajemen Akun
                      </NavLink>
                    )}
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-2xl px-4 py-2.5 text-left text-xs font-bold text-rose-700 hover:bg-rose-50 transition mt-1 border-t border-slate-100"
                    >
                      <LogOut size={15} /> Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <section className="p-4 md:p-8 flex-1 flex flex-col relative z-10 min-w-0 w-full">
          <AnimatePresence mode="wait">
            <PageWrapper key={location.pathname}>
              <Outlet />
            </PageWrapper>
          </AnimatePresence>
        </section>
      </main>
    </PageBackground>
  );
}
