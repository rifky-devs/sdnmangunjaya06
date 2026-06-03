import React from "react";
import { Award, BookOpenCheck, UserRound, TrendingUp, Printer, CheckCircle2, AlertCircle, Sparkles, AlertTriangle } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import AnimatedCard from "../../components/AnimatedCard.jsx";
import LoadingSkeleton from "../../components/LoadingSkeleton.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import { useFetch } from "../../hooks/useFetch.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useToast } from "../../components/Toast.jsx";

export default function SiswaDashboard() {
  const { data, loading, error } = useFetch("/grades/me", {
    initialData: { profile: null, grades: [], summary: {} },
  });
  const { showToast } = useToast();

  const grades = data?.grades || [];
  const summary = data?.summary || {};
  const profile = data?.profile;

  // Compute scores
  const finalScores = grades.map((g) => Number(g.final_score));
  const highestGrade = finalScores.length > 0 ? Math.max(...finalScores).toFixed(2) : "-";
  const lowestGrade = finalScores.length > 0 ? Math.min(...finalScores).toFixed(2) : "-";

  // General pass status
  const avgNum = Number(summary.average_score);
  const generalStatus = !Number.isNaN(avgNum) && avgNum > 0 ? (avgNum >= 70 ? "Lulus" : "Tidak Lulus") : "-";

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Siswa" title="Nilai Rapor Saya" description="Lihat hasil pencapaian belajar Anda, rata-rata kompetensi nilai mata pelajaran, dan cetak rapor pribadi." />
        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <LoadingSkeleton type="profile" />
          <div className="space-y-6">
            <LoadingSkeleton type="card" cards={4} />
            <LoadingSkeleton type="table" rows={4} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print-only CSS block */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            color: #000;
            background: #white;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 1.5cm;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #000 !important;
            padding: 8px 10px !important;
            font-size: 11px !important;
            text-align: left;
          }
          th {
            background-color: #f8fafc !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `,
        }}
      />

      <div className="no-print">
        <PageHeader eyebrow="Siswa" title="Rapor & Status Belajar" description="Akses rekam prestasi belajar Anda, pantau rata-rata capaian kompetensi mata pelajaran, dan unduh berkas rapor formal." />
      </div>

      {error && (
        <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-100 p-4 text-sm font-semibold text-rose-700 flex items-center gap-2 no-print">
          <AlertCircle size={18} />
          <span>Gagal memuat profil akademik siswa. Pastikan koneksi server aman.</span>
        </div>
      )}

      {/* Grid Profil dan Ringkasan Nilai */}
      {profile && (
        <div id="print-area">
          {/* Header Cetak Formal (Hanya muncul saat cetak) */}
          <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-6">
            <h1 className="text-2xl font-black text-slate-950 uppercase tracking-wide">SDN Mangunjaya 06</h1>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mt-1">Laporan Hasil Pencapaian Belajar Murid</h2>
            <p className="text-xs text-slate-500 mt-2">Jl. Graha Prima Raya No.72, Mangunjaya, Kec. Tambun Selatan, Kabupaten Bekasi, Jawa Barat 17510</p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[340px_1fr] w-full">
            {/* Sidebar Card Profil (Premium Style) */}
            <AnimatedCard hoverEffect={false} className="w-full flex flex-col items-center text-center space-y-5 print:border-0 print:p-0 print:text-left print:items-start print:space-y-2.5 h-fit">
              <div className="no-print relative">
                <Avatar photoUrl={profile.photo_url} name={profile.name} size="lg" className="ring-4 ring-teal-500/10 shadow-lg" />
                <div className="absolute -bottom-1.5 -right-1.5 p-1 rounded-full bg-teal-500 text-white shadow-sm ring-2 ring-white">
                  <Sparkles size={12} className="animate-bounce" />
                </div>
              </div>

              <div className="print:w-full">
                <h3 className="text-base font-black text-slate-900 leading-tight font-plus-jakarta">{profile.name}</h3>
                <p className="text-[10px] font-extrabold text-teal-700 mt-1 uppercase tracking-widest font-mono">NIS {profile.nis}</p>
              </div>

              <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100/80 text-left text-xs space-y-4 print:bg-transparent print:border-0 print:p-0 print:space-y-1.5 print:mt-2">
                <div className="flex justify-between print:justify-start print:gap-4 border-b border-slate-200/50 pb-2 print:border-b-0 print:pb-0">
                  <span className="font-bold text-slate-400 uppercase print:w-28 text-[9px] tracking-wider">Kelas saat ini</span>
                  <span className="font-extrabold text-slate-800">Kelas {profile.class_name || "-"}</span>
                </div>
                <div className="flex justify-between print:justify-start print:gap-4 border-b border-slate-200/50 pb-2 print:border-b-0 print:pb-0">
                  <span className="font-bold text-slate-400 uppercase print:w-28 text-[9px] tracking-wider">Rata-rata Nilai</span>
                  <span className="font-extrabold text-teal-700 font-mono">{summary.average_score || "-"}</span>
                </div>
                <div className="flex justify-between print:justify-start print:gap-4">
                  <span className="font-bold text-slate-400 uppercase print:w-28 text-[9px] tracking-wider">Predikat Umum</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                      generalStatus === "Lulus" ? "bg-teal-50 text-teal-700 border border-teal-100" : generalStatus === "Tidak Lulus" ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {generalStatus}
                  </span>
                </div>
              </div>

              {/* Action Button untuk Cetak (Hanya Screen) */}
              <button
                onClick={() => window.print()}
                disabled={grades.length === 0}
                className="no-print btn-primary w-full flex items-center justify-center gap-2 font-bold py-3 rounded-2xl shadow-lg shadow-teal-500/10 hover:shadow-xl hover:shadow-teal-500/15 transition-all text-xs mt-2 font-plus-jakarta"
              >
                <Printer size={15} /> Cetak Nilai Murid
              </button>
              <button
                onClick={() => {
                  if (grades.length === 0) {
                    showToast("Data belum tersedia untuk dicetak.", "warning");
                    return;
                  }
                  try {
                    const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
                    
                    // Kop Surat
                    doc.setFont("Times", "Bold");
                    doc.setFontSize(12);
                    doc.text("PEMERINTAH KABUPATEN BEKASI", 297.5, 45, { align: "center" });
                    doc.setFontSize(13);
                    doc.text("DINAS PENDIDIKAN", 297.5, 60, { align: "center" });
                    doc.setFontSize(16);
                    doc.text("SDN MANGUNJAYA 06", 297.5, 78, { align: "center" });
                    doc.setFont("Times", "Italic");
                    doc.setFontSize(8.5);
                    doc.text("Jl. Graha Prima Raya No.72, Mangunjaya, Kec. Tambun Selatan, Bekasi 17510", 297.5, 92, { align: "center" });

                    // Double line divider
                    doc.setLineWidth(1.5);
                    doc.line(40, 98, 555, 98);
                    doc.setLineWidth(0.5);
                    doc.line(40, 101, 555, 101);

                    // Report Title
                    doc.setFont("Times", "Bold");
                    doc.setFontSize(11);
                    doc.text("LAPORAN HASIL BELAJAR SISWA (RAPOR)", 297.5, 122, { align: "center" });
                    doc.setFontSize(9.5);
                    doc.text("TAHUN AJARAN: 2026/2027", 297.5, 136, { align: "center" });

                    // Metadata block
                    doc.setFont("Times", "Normal");
                    doc.setFontSize(9.5);
                    // Left Column
                    doc.text(`Nama Peserta Didik  :  ${profile.name}`, 45, 160);
                    doc.text(`Nomor Induk (NIS)  :  ${profile.nis || "-"}`, 45, 175);
                    // Right Column
                    doc.text(`Kelas / Semester      :  Kelas ${profile.class_name || "-"} / 1 (Ganjil)`, 340, 160);
                    doc.text(`Fase / Kurikulum      :  A / Kurikulum Merdeka`, 340, 175);

                    // Table
                    const cols = ["No", "Mata Pelajaran", "Nilai Tugas", "Nilai UTS", "Nilai UAS", "Nilai Akhir", "Predikat", "Keterangan"];
                    const rows = grades.map((g, i) => {
                      const score = Number(g.final_score) || 0;
                      let pred = "D";
                      let desc = "Perlu Bimbing";
                      if (score >= 90) {
                        pred = "A";
                        desc = "Sangat Baik";
                      } else if (score >= 80) {
                        pred = "B";
                        desc = "Baik";
                      } else if (score >= 70) {
                        pred = "C";
                        desc = "Cukup";
                      }
                      const finalKet = score >= 70 ? "Tuntas" : "Belum Tuntas";
                      return [
                        i + 1,
                        g.subject_name,
                        g.assignment_score ?? "-",
                        g.midterm_score ?? "-",
                        g.final_exam_score ?? "-",
                        score.toFixed(2),
                        `${pred} (${desc})`,
                        finalKet
                      ];
                    });

                    autoTable(doc, {
                      startY: 195,
                      head: [cols],
                      body: rows,
                      styles: { font: "Times", fontSize: 9, cellPadding: 6 },
                      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
                      columnStyles: {
                        0: { halign: "center", width: 30 },
                        1: { width: 150 },
                        2: { halign: "center" },
                        3: { halign: "center" },
                        4: { halign: "center" },
                        5: { halign: "center", fontStyle: "bold" },
                        6: { halign: "center" },
                        7: { halign: "center" },
                      },
                      margin: { left: 40, right: 40 },
                    });

                    // Signature block
                    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 40 : 600;
                    doc.setFont("Times", "Normal");
                    doc.setFontSize(9.5);
                    
                    doc.text("Mengetahui,", 45, finalY);
                    doc.text("Orang Tua / Wali Peserta Didik,", 45, finalY + 14);
                    doc.text("( ___________________________ )", 45, finalY + 70);

                    const teacherName = grades[0]?.teacher_name || "Ibu Rina Wulandari";
                    doc.text(`Bekasi, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, 380, finalY);
                    doc.text("Wali Kelas / Guru Pengampu,", 380, finalY + 14);
                    doc.text(`( ${teacherName} )`, 380, finalY + 70);

                    // Principal in the middle
                    doc.text("Mengetahui / Mengesahkan,", 210, finalY + 95);
                    doc.text("Kepala Sekolah SDN Mangunjaya 06,", 195, finalY + 109);
                    doc.setFont("Times", "Bold");
                    doc.text("Hj. Nurdiah, S.Pd", 230, finalY + 160);
                    doc.setFont("Times", "Normal");
                    doc.setFontSize(8.5);
                    doc.text("NIP. 196805121990032005", 218, finalY + 172);

                    const safeName = profile.name.replace(/[^a-z0-9A-Z]/g, "");
                    const safeClass = (profile.class_name || "Kelas").replace(/[^a-z0-9A-Z]/g, "");
                    const fileName = `Laporan_Nilai_${safeName}_${safeClass}_Semester1.pdf`;
                    doc.save(fileName);
                    showToast("PDF berhasil dibuat.", "success");
                  } catch (err) {
                    console.error(err);
                    showToast("Gagal membuat PDF.", "error");
                  }
                }}
                disabled={grades.length === 0}
                className="no-print btn-secondary w-full flex items-center justify-center gap-2 font-bold py-3 rounded-2xl shadow-sm text-xs mt-2"
              >
                <Printer size={15} /> Unduh PDF
              </button>
            </AnimatedCard>

            {/* Grid Statistik & Tabel Rekap */}
            <div className="space-y-6 min-w-0 w-full">
              {/* Statistik Mini (Hanya Screen) */}
              <div className="no-print grid gap-4 grid-cols-2 md:grid-cols-4">
                <AnimatedCard className="flex flex-col justify-center border-l-4 border-l-teal-500 p-4">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jumlah Mapel</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-black text-slate-900 font-plus-jakarta">{summary.total_subjects || 0}</p>
                    <span className="text-[10px] font-bold text-slate-400">Pelajaran</span>
                  </div>
                </AnimatedCard>

                <AnimatedCard className="flex flex-col justify-center border-l-4 border-l-indigo-500 p-4">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rata-rata</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-black text-indigo-700 font-mono">{summary.average_score || "-"}</p>
                    <span className="text-[10px] font-bold text-slate-400">Kompetensi</span>
                  </div>
                </AnimatedCard>

                <AnimatedCard className="flex flex-col justify-center border-l-4 border-l-emerald-500 p-4">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nilai Tertinggi</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-black text-emerald-700 font-mono">{highestGrade}</p>
                    <span className="text-[10px] font-bold text-slate-400">Puncak</span>
                  </div>
                </AnimatedCard>

                <AnimatedCard className={`flex flex-col justify-center p-4 border-l-4 ${generalStatus === "Lulus" ? "border-l-teal-500 bg-teal-50/10" : "border-l-rose-500 bg-rose-50/10"}`}>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status Kelulusan</span>
                  <p className={`text-xs sm:text-sm md:text-lg font-black mt-1 font-plus-jakarta ${generalStatus === "Lulus" ? "text-teal-700" : "text-rose-700"}`}>{generalStatus === "Lulus" ? "Sangat Memuaskan" : "Perlu Bimbingan"}</p>
                </AnimatedCard>
              </div>

              {/* Tabel Nilai */}
              <AnimatedCard hoverEffect={false} className="w-full overflow-hidden print:border-0 print:p-0 print:shadow-none">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3.5 mb-5 print:text-xs print:font-extrabold print:pb-1.5 print:mb-2 font-plus-jakarta">Lembar Hasil Kompetensi Belajar</h3>
                {grades.length === 0 ? (
                  <EmptyState title="Nilai belum dimasukkan" description="Lembar kompetensi nilai rapor Anda akan muncul di sini setelah divalidasi oleh guru kelas." icon={BookOpenCheck} />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] print:min-w-0">
                      <thead className="table-head">
                        <tr>
                          <th className="px-4 py-3 min-w-[200px]">Mata Pelajaran</th>
                          <th className="px-4 py-3 text-center w-24">Tugas (30%)</th>
                          <th className="px-4 py-3 text-center w-24">UTS (30%)</th>
                          <th className="px-4 py-3 text-center w-24">UAS (40%)</th>
                          <th className="px-4 py-3 text-center w-28">Nilai Akhir</th>
                          <th className="px-4 py-3 text-center w-28">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grades.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition">
                            <td className="table-cell font-bold text-slate-900">{item.subject_name}</td>
                            <td className="table-cell text-center font-mono">{item.assignment_score}</td>
                            <td className="table-cell text-center font-mono">{item.midterm_score}</td>
                            <td className="table-cell text-center font-mono">{item.final_exam_score}</td>
                            <td className="table-cell text-center font-black font-mono text-slate-900">{Number(item.final_score).toFixed(2)}</td>
                            <td className="table-cell text-center">
                              <span className="print:hidden">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                                    item.status === "Lulus" ? "bg-teal-50 border-teal-100 text-teal-700" : "bg-rose-50 border-rose-100 text-rose-700"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </span>
                              <span className="hidden print:inline font-bold">{item.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </AnimatedCard>

              {/* Signature block (Hanya muncul saat cetak) */}
              <div className="hidden print:flex justify-between items-center mt-12 text-xs">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-bold mt-1">Kepala Sekolah SDN Mangunjaya 06</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-slate-900">Hj. Nurdiah, S.Pd</p>
                  <p className="text-[10px] text-slate-500">NIP. 196805121990032005</p>
                </div>
                <div className="text-right">
                  <p>Bekasi, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                  <p className="font-bold mt-1">Siswa / Orang Tua Wali Murid</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline text-slate-900">{profile.name}</p>
                  <p className="text-[10px] text-slate-500">Kelas: {profile.class_name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
