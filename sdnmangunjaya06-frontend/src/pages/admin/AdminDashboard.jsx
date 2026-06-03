import React, { useState } from 'react';
import { 
  UsersRound, UserRound, BookOpen, ClipboardCheck, School, UserCog,
  TrendingUp, Calendar, AlertCircle, PlusCircle, Settings, ShieldAlert,
  ArrowRight, Sparkles, Database, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../../components/ui/PageHeader.jsx';
import AnimatedCard from '../../components/AnimatedCard.jsx';
import RoleBadge from '../../components/RoleBadge.jsx';
import LoadingSkeleton from '../../components/LoadingSkeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import { useFetch } from '../../hooks/useFetch.js';

export default function AdminDashboard() {
  const { data, loading, error } = useFetch('/dashboard/admin', {
    initialData: { 
      stats: {}, 
      latestGrades: [],
      classDistribution: [],
      statusDistribution: [],
      latestUsers: [],
      latestStudents: [],
      latestTeachers: []
    }
  });

  const [activeTab, setActiveTab] = useState('users');

  const stats = data?.stats || {};
  const latestGrades = data?.latestGrades || [];
  const classDistribution = data?.classDistribution || [];
  const statusDistribution = data?.statusDistribution || [];
  const latestUsers = data?.latestUsers || [];
  const latestStudents = data?.latestStudents || [];
  const latestTeachers = data?.latestTeachers || [];

  // Graduation status computations
  const totalGrades = statusDistribution.reduce((acc, curr) => acc + curr.count, 0) || 1;
  const lulusItem = statusDistribution.find(d => d.status === 'Lulus') || { count: 0 };
  const tidakLulusItem = statusDistribution.find(d => d.status === 'Tidak Lulus') || { count: 0 };
  const pctLulus = Math.round((lulusItem.count / totalGrades) * 100);
  const pctTidakLulus = Math.round((tidakLulusItem.count / totalGrades) * 100);

  // Class max students computation
  const maxStudents = Math.max(...classDistribution.map(d => d.studentCount), 1);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Dashboard Admin"
          title="Ringkasan Sistem Penilaian"
          description="Pantau jumlah data utama, data akun aktif, visualisasi siswa, serta laporan nilai sekolah secara terpusat."
        />
        <LoadingSkeleton type="card" cards={6} />
        <div className="grid gap-6 md:grid-cols-2">
          <LoadingSkeleton type="table" rows={4} />
          <LoadingSkeleton type="table" rows={4} />
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Dashboard Admin"
        title="Pusat Kontrol & Informasi"
        description="Pantau kesehatan operasional sekolah, kelola otorisasi akun pengguna, serta analisis pencapaian belajar siswa."
      />

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl bg-rose-50 border border-rose-100 p-4 text-sm font-semibold text-rose-700 flex items-center gap-2"
        >
          <AlertCircle size={18} />
          <span>Gagal memuat data operasional dashboard. Silakan periksa koneksi server.</span>
        </motion.div>
      )}

      {/* Grid Statistik Modern */}
      <div className="grid gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-6 mb-8">
        <AnimatedCard className="flex flex-col justify-between border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Siswa</span>
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
              <UsersRound size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-4 font-plus-jakarta">{stats.students || 0}</p>
        </AnimatedCard>

        <AnimatedCard className="flex flex-col justify-between border-l-4 border-l-teal-500">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Guru</span>
            <div className="p-1.5 rounded-xl bg-teal-50 text-teal-600">
              <UserRound size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-4 font-plus-jakarta">{stats.teachers || 0}</p>
        </AnimatedCard>

        <AnimatedCard className="flex flex-col justify-between border-l-4 border-l-cyan-500">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Kelas</span>
            <div className="p-1.5 rounded-xl bg-cyan-50 text-cyan-600">
              <School size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-4 font-plus-jakarta">{stats.classes || 0}</p>
        </AnimatedCard>

        <AnimatedCard className="flex flex-col justify-between border-l-4 border-l-emerald-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mata Pelajaran</span>
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-800">
              <BookOpen size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-4 font-plus-jakarta">{stats.subjects || 0}</p>
        </AnimatedCard>

        <AnimatedCard className="flex flex-col justify-between border-l-4 border-l-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Akun Aktif</span>
            <div className="p-1.5 rounded-xl bg-slate-100 text-slate-800">
              <UserCog size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-4 font-plus-jakarta">{stats.activeUsers || 0}</p>
        </AnimatedCard>

        <AnimatedCard className="flex flex-col justify-between border-l-4 border-l-teal-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nilai Masuk</span>
            <div className="p-1.5 rounded-xl bg-teal-50 text-teal-800">
              <ClipboardCheck size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-4 font-plus-jakarta">{stats.grades || 0}</p>
        </AnimatedCard>
      </div>

      {/* Control Center & Visual Analytics */}
      <div className="grid gap-6 xl:grid-cols-[380px_1fr] mb-8">
        {/* Quick Action Control Center */}
        <AnimatedCard className="flex flex-col justify-between" hoverEffect={false}>
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
              <div className="p-2 rounded-xl bg-teal-500 text-white">
                <Settings className="animate-spin-slow" size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 font-plus-jakarta">Pusat Otoritas Sistem</h3>
                <p className="text-[10px] text-slate-400">Pintasan kendali penuh administrator</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Gunakan panel ini untuk meregistrasikan guru baru, mendaftarkan siswa baru, membuka kelas baru, atau meninjau hak akses otorisasi.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/admin/akun"
              className="group flex items-center justify-between p-4 rounded-2xl border border-teal-100 bg-teal-50/40 text-teal-800 hover:bg-teal-50 hover:shadow-sm transition-all text-xs font-bold font-plus-jakarta"
            >
              <div className="flex items-center gap-3">
                <PlusCircle size={16} className="text-teal-600 group-hover:scale-110 transition" />
                <span>Tambah Akun Baru</span>
              </div>
              <ArrowRight size={14} className="text-teal-500 translate-x-0 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              to="/admin/siswa"
              className="group flex items-center justify-between p-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 text-emerald-800 hover:bg-emerald-50 hover:shadow-sm transition-all text-xs font-bold font-plus-jakarta"
            >
              <div className="flex items-center gap-3">
                <UsersRound size={16} className="text-emerald-600 group-hover:scale-110 transition" />
                <span>Pendaftaran Siswa</span>
              </div>
              <ArrowRight size={14} className="text-emerald-500 translate-x-0 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              to="/admin/guru"
              className="group flex items-center justify-between p-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 text-emerald-800 hover:bg-emerald-50 hover:shadow-sm transition-all text-xs font-bold font-plus-jakarta"
            >
              <div className="flex items-center gap-3">
                <UserRound size={16} className="text-emerald-600 group-hover:scale-110 transition" />
                <span>Registrasi Guru</span>
              </div>
              <ArrowRight size={14} className="text-emerald-500 translate-x-0 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              to="/admin/kelas"
              className="group flex items-center justify-between p-4 rounded-2xl border border-cyan-100 bg-cyan-50/40 text-cyan-800 hover:bg-cyan-50 hover:shadow-sm transition-all text-xs font-bold font-plus-jakarta"
            >
              <div className="flex items-center gap-3">
                <School size={16} className="text-cyan-600 group-hover:scale-110 transition" />
                <span>Manajemen Kelas</span>
              </div>
              <ArrowRight size={14} className="text-cyan-500 translate-x-0 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </AnimatedCard>

        {/* Visual Analytics Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Card Kiri: Distribusi Kelas */}
          <AnimatedCard hoverEffect={false}>
            <h3 className="text-sm font-black text-slate-900 mb-2 flex items-center gap-2 font-plus-jakarta">
              <TrendingUp size={18} className="text-teal-500" />
              Distribusi Siswa per Kelas
            </h3>
            <p className="text-[10px] text-slate-400 mb-6">Visualisasi total kapasitas siswa aktif di tiap kelas.</p>

            {classDistribution.length === 0 ? (
              <EmptyState title="Belum ada data distribusi kelas" description="Daftarkan kelas & siswa untuk melihat visualisasi diagram balok." />
            ) : (
              <div className="space-y-4">
                {classDistribution.map((item, idx) => {
                  const widthPct = Math.min((item.studentCount / maxStudents) * 100, 100);
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>Kelas {item.className}</span>
                        <span className="font-mono text-[11px] text-slate-500">{item.studentCount} Siswa</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${widthPct}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.05, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </AnimatedCard>

          {/* Card Kanan: Kelulusan */}
          <AnimatedCard hoverEffect={false} className="flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 mb-2 flex items-center gap-2 font-plus-jakarta">
                <ClipboardCheck size={18} className="text-indigo-500" />
                Persentase Status Belajar
              </h3>
              <p className="text-[10px] text-slate-400 mb-6">Rasio status kelulusan akademik siswa secara kolektif.</p>
            </div>

            <div className="space-y-5 my-auto">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Siswa Lulus ({lulusItem.count} Nilai)</span>
                  <span className="text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md font-mono text-[10px]">{pctLulus}%</span>
                </div>
                <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pctLulus}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full animate-pulse-slow"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Tidak Lulus ({tidakLulusItem.count} Nilai)</span>
                  <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md font-mono text-[10px]">{pctTidakLulus}%</span>
                </div>
                <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pctTidakLulus}%` }}
                    transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between items-center text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><Sparkles size={13} className="text-amber-500 animate-bounce" /> Rasio Kelulusan Umum</span>
              <span className="font-bold text-teal-700">{pctLulus}% Sukses</span>
            </div>
          </AnimatedCard>
        </div>
      </div>

      {/* Grid Aktivitas Terbaru (2 Kolom) */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Tab Aktivitas Terkini */}
        <AnimatedCard hoverEffect={false} className="flex flex-col h-[420px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-black text-slate-900 font-plus-jakarta">Pendaftaran Anggota Baru</h3>
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'users' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}
              >
                Akun
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'students' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}
              >
                Siswa
              </button>
              <button
                onClick={() => setActiveTab('teachers')}
                className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'teachers' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}
              >
                Guru
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-2.5"
              >
                {activeTab === 'users' && (
                  latestUsers.length === 0 ? (
                    <EmptyState title="Belum ada akun terdaftar" description="Akun terdaftar akan muncul di dashboard secara realtime." icon={UserCog} />
                  ) : (
                    latestUsers.map((u) => (
                      <div key={u.id} className="flex items-center gap-3 p-3 border border-slate-100/70 hover:bg-slate-50/50 hover:border-slate-200 transition rounded-2xl">
                        <Avatar photoUrl={u.photo} name={u.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">@{u.username}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <RoleBadge role={u.role} />
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${u.is_active ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-slate-100 text-slate-400'}`}>
                            {u.is_active ? 'Aktif' : 'Off'}
                          </span>
                        </div>
                      </div>
                    ))
                  )
                )}

                {activeTab === 'students' && (
                  latestStudents.length === 0 ? (
                    <EmptyState title="Belum ada siswa terdaftar" description="Gunakan menu pendaftaran untuk mendaftarkan siswa baru." icon={UsersRound} />
                  ) : (
                    latestStudents.map((st) => (
                      <div key={st.id} className="flex items-center gap-3 p-3 border border-slate-100/70 hover:bg-slate-50/50 hover:border-slate-200 transition rounded-2xl">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 text-xs font-black font-mono">
                          ST
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{st.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">NIS: {st.nis} · Kelas {st.class_name}</p>
                        </div>
                        <RoleBadge role="siswa" />
                      </div>
                    ))
                  )
                )}

                {activeTab === 'teachers' && (
                  latestTeachers.length === 0 ? (
                    <EmptyState title="Belum ada guru terdaftar" description="Gunakan menu pendaftaran untuk mendaftarkan guru baru." icon={UserRound} />
                  ) : (
                    latestTeachers.map((tc) => (
                      <div key={tc.id} className="flex items-center gap-3 p-3 border border-slate-100/70 hover:bg-slate-50/50 hover:border-slate-200 transition rounded-2xl">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-teal-700 text-xs font-black font-mono">
                          GR
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{tc.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">NIP: {tc.teacher_code || '-'} · {tc.subject_name}</p>
                        </div>
                        <RoleBadge role="guru" />
                      </div>
                    ))
                  )
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </AnimatedCard>

        {/* Kolom Kanan: Nilai Terbaru */}
        <AnimatedCard hoverEffect={false} className="flex flex-col h-[420px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-black text-slate-900 font-plus-jakarta">Aliran Nilai Akademik</h3>
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <Calendar size={12} /> 5 Input Terakhir
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
            {latestGrades.length === 0 ? (
              <EmptyState title="Belum ada data nilai" description="Nilai belajar yang diinput guru akan mengalir ke sini secara otomatis." icon={ClipboardCheck} />
            ) : (
              latestGrades.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 p-3 border border-slate-100/70 hover:bg-slate-50/50 hover:border-slate-200 transition rounded-2xl">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate">{item.student_name}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      NIS {item.nis} · <span className="font-semibold text-teal-700">{item.subject_name}</span>
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-2.5">
                    <div>
                      <p className="text-xs font-black text-slate-900 font-mono">{Number(item.final_score).toFixed(2)}</p>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">{item.status}</p>
                    </div>
                    <StatusBadge size="sm">{item.validation_status}</StatusBadge>
                  </div>
                </div>
              ))
            )}
          </div>
        </AnimatedCard>
      </div>
    </>
  );
}
