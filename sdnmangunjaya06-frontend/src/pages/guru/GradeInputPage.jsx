import React, { useState } from "react";
import { Save, AlertCircle, CheckCircle2, SlidersHorizontal, BookOpen, User } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { useFetch } from "../../hooks/useFetch.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../services/api.js";
import { useToast } from "../../components/Toast.jsx";

const initialForm = {
  student_id: "",
  assignment_score: "",
  midterm_score: "",
  final_exam_score: "",
  validation_status: "Valid",
};

export default function GradeInputPage() {
  const { data: students } = useFetch("/students", { initialData: [] });
  const { data: classes } = useFetch("/classes", { initialData: [] });
  const { data: dashboard } = useFetch("/dashboard/guru", { initialData: { stats: {} } });
  const { user } = useAuth();
  const { showToast } = useToast();

  const [selectedClassId, setSelectedClassId] = useState("");
  const [form, setForm] = useState(initialForm);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const calculatePreview = (draft) => {
    const tugas = Number(draft.assignment_score);
    const uts = Number(draft.midterm_score);
    const uas = Number(draft.final_exam_score);

    if ([tugas, uts, uas].some((value) => Number.isNaN(value) || value === 0)) {
      setPreview(null);
      return;
    }

    const finalScore = tugas * 0.3 + uts * 0.3 + uas * 0.4;
    setPreview({
      finalScore: finalScore.toFixed(2),
      status: finalScore >= 70 ? "Lulus" : "Tidak Lulus",
    });
  };

  const updateForm = (key, value) => {
    const next = { ...form, [key]: value };
    setForm(next);
    calculatePreview(next);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      await api.post("/grades", form);
      // Reset score fields but NOT selectedClassId
      setForm({
        student_id: "",
        assignment_score: "",
        midterm_score: "",
        final_exam_score: "",
        validation_status: "Valid",
      });
      setPreview(null);
      showToast("Nilai siswa berhasil disimpan.", "success");
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal menyimpan nilai.";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  // Filter students by selected class
  const filteredStudents = (students || []).filter((st) => {
    return selectedClassId ? String(st.class_id) === String(selectedClassId) : true;
  });

  return (
    <>
      <PageHeader eyebrow="Guru" title="Input Nilai Siswa" description="Masukkan nilai tugas, UTS, dan UAS. Nilai akhir dihitung otomatis menggunakan bobot 30%, 30%, dan 40%." />

      {message && (
        <div className="mb-6 rounded-2xl bg-teal-50 border border-teal-100 p-4 text-sm font-semibold text-teal-800 flex items-center gap-2 shadow-sm">
          <CheckCircle2 size={18} className="text-teal-600" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* Form Panel */}
        <form onSubmit={handleSubmit} className="card p-6">
          <h2 className="mb-5 text-base font-black text-slate-950">Formulir Input Nilai</h2>

          {/* Step 1: Filter Kelas */}
          <div className="mb-4">
            <label className="label flex items-center gap-1.5">
              <SlidersHorizontal size={14} className="text-slate-400" />
              Saring Kelas Terlebih Dahulu
            </label>
            <select
              className="input w-full font-bold text-slate-700"
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                // Clear selected student when class changes
                updateForm("student_id", "");
              }}
            >
              <option value="">Semua Kelas</option>
              {(classes || []).map((cls) => (
                <option key={cls.id} value={cls.id}>
                  Kelas {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Pilih Siswa */}
          <div className="mb-4">
            <label className="label">Pilih Siswa</label>
            <select className="input w-full" value={form.student_id} onChange={(e) => updateForm("student_id", e.target.value)} required>
              <option value="">Pilih siswa</option>
              {filteredStudents.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nis} - {item.name} (Kelas {item.class_name})
                </option>
              ))}
            </select>
            {selectedClassId && filteredStudents.length === 0 && <p className="text-[11px] text-rose-500 font-semibold mt-1">Tidak ada siswa terdaftar di kelas ini.</p>}
          </div>

          {/* Step 3: Nilai Input */}
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <div>
              <label className="label">Nilai Tugas (30%)</label>
              <input className="input font-mono w-full" type="number" min="0" max="100" placeholder="0-100" value={form.assignment_score} onChange={(e) => updateForm("assignment_score", e.target.value)} required />
            </div>
            <div>
              <label className="label">Nilai UTS (30%)</label>
              <input className="input font-mono w-full" type="number" min="0" max="100" placeholder="0-100" value={form.midterm_score} onChange={(e) => updateForm("midterm_score", e.target.value)} required />
            </div>
            <div>
              <label className="label">Nilai UAS (40%)</label>
              <input className="input font-mono w-full" type="number" min="0" max="100" placeholder="0-100" value={form.final_exam_score} onChange={(e) => updateForm("final_exam_score", e.target.value)} required />
            </div>
          </div>

          {/* Step 4: Status Validasi */}
          <div className="mb-6">
            <label className="label">Status Validasi</label>
            <select className="input w-full font-bold text-slate-700" value={form.validation_status} onChange={(e) => updateForm("validation_status", e.target.value)}>
              <option value="Valid">Valid</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <button className="btn-primary w-full gap-2 py-3 font-bold rounded-2xl shadow-lg shadow-teal-500/20" disabled={saving}>
            <Save size={18} /> {saving ? "Menyimpan..." : "Simpan Nilai Siswa"}
          </button>
        </form>

        {/* Sidebar Panel: Info & Preview */}
        <div className="space-y-6">
          {/* Card Info Pengampu */}
          <aside className="card p-6">
            <h3 className="text-base font-black text-slate-950 border-b border-slate-100 pb-3 mb-4">Informasi Pengampu</h3>
            <div className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <User size={16} />
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase text-[9px]">Guru Pengampu</span>
                  <span className="font-black text-slate-800 mt-0.5 block">{user?.name}</span>
                </div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <BookOpen size={16} />
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block uppercase text-[9px]">Mata Pelajaran diampu</span>
                  <span className="font-black text-teal-700 mt-0.5 block">{dashboard?.stats?.subject || "-"}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Card Preview Nilai */}
          <aside className="card p-6 flex flex-col justify-between h-[280px]">
            <div>
              <h2 className="text-base font-black text-slate-950">Preview Perhitungan</h2>
              <p className="mt-2 text-[11px] text-slate-500 leading-normal">
                Bobot perhitungan nilai akhir:
                <br />• 30% Nilai Tugas + 30% UTS + 40% UAS.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-950 p-6 text-white text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Nilai Akhir</p>
              <p className="mt-1 text-5xl font-black font-mono text-teal-400">{preview?.finalScore || "-"}</p>
              <div
                className={`mt-4 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-wider ${
                  preview?.status === "Lulus" ? "bg-teal-500/20 text-teal-400" : preview?.status ? "bg-rose-500/20 text-rose-400" : "bg-white/10 text-white"
                }`}
              >
                Status: {preview?.status || "Belum dihitung"}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
