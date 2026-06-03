import React from 'react';
import { 
  GraduationCap, BookOpen, ClipboardCheck, CheckCircle2, 
  FileText, PlusCircle, Search, Printer, ArrowRight,
  Bookmark, Award, GraduationCap as StudentIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader.jsx';
import AnimatedCard from '../../components/AnimatedCard.jsx';
import LoadingSkeleton from '../../components/LoadingSkeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../components/Toast.jsx';

export default function GuruDashboard() {
  const { data, loading, error } = useFetch('/dashboard/guru', {
    initialData: { stats: {}, recent: [] }
  });
  const { showToast } = useToast();

  React.useEffect(() => {
    if (error) {
      showToast("Gagal memuat status pengajaran Anda.", "error");
    }
  }, [error, showToast]);

  const stats = data?.stats || {};
  const recent = data?.recent || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Dashboard Guru"
          title="Panel Input dan Validasi Nilai"
          description="Pantau jumlah data siswa terdaftar, kelola input nilai kelas, serta lakukan validasi nilai secara realtime."
        />
        <LoadingSkeleton type="card" cards={5} />
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
        eyebrow="Dashboard Guru"
        title="Portal Pengajaran & Penilaian"
        description="Kelola rekapitulasi capaian belajar siswa, kelola penginputan nilai harian, UTS, dan UAS secara instan."
      />

      {error && (
        <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-100 p-4 text-sm font-semibold text-rose-700 flex items-center gap-2">
          <CheckCircle2 className="text-rose-500" size={18} />
          <span>Gagal memuat status pengajaran Anda. Pastikan sesi login Anda masih aktif.</span>
        </div>
      )}

      {/* Grid Statistik 5-Kolom */}
      <div className="grid gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-5 mb-8">
        <AnimatedCard className="flex flex-col justify-between border-l-4 border-l-teal-500 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mata Pelajaran</span>
            <div className="p-1.5 rounded-xl bg-teal-50 text-teal-600">
              <BookOpen size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-4 truncate font-plus-jakarta">{stats.subject || '-'}</p>
        </AnimatedCard>

        <AnimatedCard className="flex flex-col justify-between border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Siswa Diajar</span>
            <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
              <GraduationCap size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-4 font-plus-jakarta">{stats.students || 0}</p>
        </AnimatedCard>

        <AnimatedCard className="flex flex-col justify-between border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Nilai</span>
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
              <ClipboardCheck size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-4 font-plus-jakarta">{stats.grades || 0}</p>
        </AnimatedCard>

        <AnimatedCard className="flex flex-col justify-between border-l-4 border-l-cyan-500">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nilai Valid</span>
            <div className="p-1.5 rounded-xl bg-cyan-50 text-cyan-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-4 font-plus-jakarta">{stats.valid || 0}</p>
        </AnimatedCard>

        <AnimatedCard className="flex flex-col justify-between border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Draft</span>
            <div className="p-1.5 rounded-xl bg-amber-50 text-amber-600">
              <FileText size={16} />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-4 font-plus-jakarta">{stats.draft || 0}</p>
        </AnimatedCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* Input Terbaru */}
        <AnimatedCard hoverEffect={false} className="flex flex-col h-[420px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
            <div>
              <h2 className="text-sm font-black text-slate-950 font-plus-jakarta">Input Nilai Terbaru</h2>
              <p className="text-[10px] text-slate-400">Daftar siswa yang baru saja dinilai</p>
            </div>
            <Link to="/guru/rekap" className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              Lihat Rekap <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {recent.length === 0 ? (
              <EmptyState title="Belum ada input nilai" description="Mulai lakukan input nilai harian siswa dengan mengklik tombol Aksi Cepat." icon={ClipboardCheck} />
            ) : (
              recent.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 p-4 hover:bg-slate-50/50 hover:border-slate-200 transition-all">
                  <div>
                    <p className="font-bold text-slate-800 text-xs">{item.student_name}</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      NIS {item.nis} · Nilai akhir <span className="font-bold text-slate-900">{Number(item.final_score).toFixed(2)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-black border uppercase tracking-wider ${
                      item.status === 'Lulus' ? 'bg-teal-50 border-teal-100 text-teal-700' : 'bg-rose-50 border-rose-100 text-rose-700'
                    }`}>
                      {item.status}
                    </span>
                    <StatusBadge size="sm">{item.validation_status}</StatusBadge>
                  </div>
                </div>
              ))
            )}
          </div>
        </AnimatedCard>

        {/* Card Aksi Cepat */}
        <AnimatedCard hoverEffect={false} className="flex flex-col justify-between h-[420px]">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <div className="p-2 rounded-xl bg-teal-500 text-white">
                <Bookmark size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-950 font-plus-jakarta">Tindakan Akademik</h3>
                <p className="text-[10px] text-slate-400">Pengelolaan terpadu nilai siswa</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Kelola lembar evaluasi belajar dengan memilih menu pintas di bawah ini. Anda dapat menginput nilai murid per kompetensi dasar atau mencetak hasil rekap rapor nilai kelas.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/guru/input-nilai"
              className="group flex items-center justify-between p-4 rounded-2xl border border-teal-100 bg-teal-50/40 text-teal-800 hover:bg-teal-50 hover:shadow-sm transition-all text-xs font-bold font-plus-jakarta"
            >
              <div className="flex items-center gap-2.5">
                <PlusCircle size={16} className="text-teal-600 group-hover:scale-110 transition" />
                <span>Input Nilai Murid</span>
              </div>
              <ArrowRight size={14} className="text-teal-500 translate-x-0 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              to="/guru/rekap"
              className="group flex items-center justify-between p-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 text-indigo-800 hover:bg-indigo-50 hover:shadow-sm transition-all text-xs font-bold font-plus-jakarta"
            >
              <div className="flex items-center gap-2.5">
                <Search size={16} className="text-indigo-600 group-hover:scale-110 transition" />
                <span>Rekap & Validasi Nilai</span>
              </div>
              <ArrowRight size={14} className="text-indigo-500 translate-x-0 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              to="/guru/rekap"
              className="group flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:shadow-sm transition-all text-xs font-bold font-plus-jakarta"
            >
              <div className="flex items-center gap-2.5">
                <Printer size={16} className="text-slate-500 group-hover:scale-110 transition" />
                <span>Cetak Lembar Nilai</span>
              </div>
              <ArrowRight size={14} className="text-slate-500 translate-x-0 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </AnimatedCard>
      </div>
    </>
  );
}
