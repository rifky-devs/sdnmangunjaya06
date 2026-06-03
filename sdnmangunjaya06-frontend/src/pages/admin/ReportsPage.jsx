import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Printer, Download, BookOpen, ClipboardCheck, GraduationCap, Award, SlidersHorizontal, RefreshCw } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { useFetch } from "../../hooks/useFetch.js";
import { useAuth } from "../../context/AuthContext.jsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useToast } from "../../components/Toast.jsx";

export default function ReportsPage({ mode = "admin" }) {
  const navigate = useNavigate();
  const endpoint = mode === "guru" ? "/grades/my-subject" : "/grades";
  const { data, loading, error, refetch } = useFetch(endpoint, { initialData: [] });
  const { data: classes } = useFetch("/classes", { initialData: [] });
  const { data: subjects } = useFetch("/subjects", { initialData: [] });
  const { data: dashboardData } = useFetch(mode === "guru" ? "/dashboard/guru" : null, {
    initialData: { stats: {} },
  });
  const { user } = useAuth();

  // Filters State
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedValidation, setSelectedValidation] = useState("");

  const teacherName = user?.name || "";
  const subjectName = dashboardData?.stats?.subject || data?.[0]?.subject_name || "-";
  const { showToast } = useToast();

  React.useEffect(() => {
    if (error) {
      showToast("Gagal memuat rekap laporan nilai.", "error");
    }
  }, [error, showToast]);

  // Advanced Filtering
  const filteredData = (data || []).filter((item) => {
    const matchesClass = selectedClass ? item.class_name === selectedClass : true;
    const matchesSubject = selectedSubject ? String(item.subject_id) === String(selectedSubject) : true;
    const matchesStatus = selectedStatus ? item.status === selectedStatus : true;
    const matchesValidation = selectedValidation ? item.validation_status === selectedValidation : true;
    return matchesClass && matchesSubject && matchesStatus && matchesValidation;
  });

  // Stats computation
  const totalCount = filteredData.length;
  const avgScore = totalCount > 0 ? (filteredData.reduce((acc, curr) => acc + Number(curr.final_score), 0) / totalCount).toFixed(2) : "0.00";
  const lulusCount = filteredData.filter((d) => d.status === "Lulus").length;
  const tidakLulusCount = filteredData.filter((d) => d.status === "Tidak Lulus").length;
  const validCount = filteredData.filter((d) => d.validation_status === "Valid").length;

  // Export CSV Handler
  const handleExportCSV = () => {
    if (filteredData.length === 0) return;
    const headers = ["No", "NIS", "Nama Siswa", "Kelas", "Mata Pelajaran", "Tugas", "UTS", "UAS", "Nilai Akhir", "Status", "Validasi"];
    const rows = filteredData.map((item, idx) => [
      idx + 1,
      item.nis,
      item.student_name,
      item.class_name,
      item.subject_name,
      item.assignment_score,
      item.midterm_score,
      item.final_exam_score,
      Number(item.final_score).toFixed(2),
      item.status,
      item.validation_status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan_nilai_${selectedClass || "semua"}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sanitizeFileName = (s) => s.replace(/[^a-z0-9A-Z-_]/g, "").replace(/\s+/g, "_");

  const handleExportPDF = () => {
    if (filteredData.length === 0) {
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

      // Title
      const title = mode === "guru" ? "REKAPITULASI HASIL PENILAIAN SISWA" : "LAPORAN HASIL PENILAIAN SISWA";
      doc.setFont("Times", "Bold");
      doc.setFontSize(11);
      doc.text(title, 297.5, 122, { align: "center" });
      doc.setFontSize(9.5);
      doc.text("TAHUN AJARAN: 2026/2027", 297.5, 136, { align: "center" });

      // Metadata block
      const metaY = 160;
      doc.setFont("Times", "Normal");
      doc.setFontSize(9.5);
      doc.text(`Nama Pengampu      :  ${teacherName || "-"}`, 45, metaY);
      doc.text(`Mata Pelajaran      :  ${subjectName || "-"}`, 45, metaY + 14);
      doc.text(`Kelas Sasaran         :  Kelas ${selectedClass || "Semua Kelas"}`, 340, metaY);
      doc.text(`Tanggal Cetak        :  ${new Date().toLocaleDateString("id-ID")}`, 340, metaY + 14);

      // Table columns
      const tableColumns = [
        { header: "No", dataKey: "no" },
        { header: "NIS", dataKey: "nis" },
        { header: "Nama Siswa", dataKey: "name" },
        { header: "Kelas", dataKey: "class" },
        { header: "Tugas", dataKey: "tugas" },
        { header: "UTS", dataKey: "uts" },
        { header: "UAS", dataKey: "uas" },
        { header: "Akhir", dataKey: "akhir" },
        { header: "Predikat", dataKey: "predikat" },
        { header: "Status", dataKey: "ket" },
      ];

      const rows = filteredData.map((it, idx) => {
        const score = Number(it.final_score) || 0;
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
        return {
          no: idx + 1,
          nis: it.nis || "-",
          name: it.student_name || it.name || "-",
          class: `Kelas ${it.class_name || "-"}`,
          tugas: it.assignment_score ?? "-",
          uts: it.midterm_score ?? "-",
          uas: it.final_exam_score ?? "-",
          akhir: score.toFixed(2),
          predikat: `${pred} (${desc})`,
          ket: finalKet,
        };
      });

      autoTable(doc, {
        startY: metaY + 36,
        head: [tableColumns.map((c) => c.header)],
        body: rows.map((r) => tableColumns.map((c) => r[c.dataKey])),
        styles: { font: "Times", fontSize: 9, cellPadding: 5 },
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
        columnStyles: {
          0: { halign: "center", width: 25 },
          1: { halign: "center", fontStyle: "bold", width: 55 },
          2: { width: 130 },
          3: { halign: "center", width: 55 },
          4: { halign: "center" },
          5: { halign: "center" },
          6: { halign: "center" },
          7: { halign: "center", fontStyle: "bold" },
          8: { halign: "center" },
          9: { halign: "center" },
        },
        margin: { left: 40, right: 40 },
      });

      // Statistics Summary
      const summaryY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 25 : 600;
      const jumlahSiswa = rows.length;
      const nilaiTertinggi = Math.max(...rows.map((r) => parseFloat(r.akhir) || 0)).toFixed(2);
      const nilaiTerendah = Math.min(...rows.map((r) => parseFloat(r.akhir) || 0)).toFixed(2);
      const rata = (rows.reduce((s, r) => s + (parseFloat(r.akhir) || 0), 0) / (rows.length || 1)).toFixed(2);

      doc.setFont("Times", "Bold");
      doc.setFontSize(9.5);
      doc.text(`RINGKASAN STATISTIK KELAS:`, 45, summaryY);
      doc.setFont("Times", "Normal");
      doc.text(`Jumlah Peserta Didik : ${jumlahSiswa} Murid`, 45, summaryY + 14);
      doc.text(`Nilai Akhir Tertinggi   : ${nilaiTertinggi}`, 45, summaryY + 28);
      doc.text(`Nilai Akhir Terendah    : ${nilaiTerendah}`, 300, summaryY + 14);
      doc.text(`Rata-Rata Kompetensi  : ${rata}`, 300, summaryY + 28);

      // Sign area
      const signY = summaryY + 65;
      doc.text("Mengetahui,", 45, signY);
      doc.text("Kepala Sekolah SDN Mangunjaya 06,", 45, signY + 14);
      doc.setFont("Times", "Bold");
      doc.text("Hj. Nurdiah, S.Pd", 45, signY + 75);
      doc.setFont("Times", "Normal");
      doc.setFontSize(8.5);
      doc.text("NIP. 196805121990032005", 45, signY + 87);

      doc.setFontSize(9.5);
      doc.text(`Bekasi, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, 380, signY);
      doc.text("Guru Mata Pelajaran,", 380, signY + 14);
      doc.setFont("Times", "Bold");
      doc.text(teacherName || "( ____________________ )", 380, signY + 75);
      doc.setFont("Times", "Normal");
      if (mode === "guru" && user?.username) {
        doc.setFontSize(8.5);
        doc.text(`NIP. ${user.username.toUpperCase()}`, 380, signY + 87);
      }

      // File name
      const teacherSafe = sanitizeFileName(teacherName || "Guru");
      const classSafe = sanitizeFileName(selectedClass || "SemuaKelas");
      const fileName = `Rekap_Nilai_Guru_${teacherSafe}_${classSafe}_Semester1.pdf`;

      doc.save(fileName);
      showToast("PDF berhasil dibuat.", "success");
    } catch (err) {
      console.error(err);
      showToast("Gagal membuat PDF.", "error");
    }
  };

  return (
    <>
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
        <PageHeader eyebrow={mode === "guru" ? "Guru" : "Admin"} title="Laporan Nilai Siswa" description="Rekap nilai tugas, UTS, UAS, nilai akhir, status kelulusan, dan status validasi seluruh siswa." />
      </div>

      {/* Card Statistik Rekapitulasi (Hanya Screen) */}
      <div className="no-print grid gap-4 grid-cols-2 md:grid-cols-5 mb-6">
        <div className="card p-4 flex flex-col justify-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Data</p>
          <p className="text-xl font-black text-slate-900 mt-1">{totalCount} Nilai</p>
        </div>
        <div className="card p-4 flex flex-col justify-center border-l-4 border-l-teal-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Rata-rata</p>
          <p className="text-xl font-black text-teal-700 mt-1">{avgScore}</p>
        </div>
        <div className="card p-4 flex flex-col justify-center border-l-4 border-l-emerald-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Jumlah Lulus</p>
          <p className="text-xl font-black text-emerald-700 mt-1">{lulusCount}</p>
        </div>
        <div className="card p-4 flex flex-col justify-center border-l-4 border-l-rose-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tidak Lulus</p>
          <p className="text-xl font-black text-rose-700 mt-1">{tidakLulusCount}</p>
        </div>
        <div className="card p-4 flex flex-col justify-center border-l-4 border-l-amber-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Nilai Valid</p>
          <p className="text-xl font-black text-amber-700 mt-1">{validCount}</p>
        </div>
      </div>

      {/* Filter and Print Toolbar (Visible only on Screen) */}
      <div className="no-print mb-6 flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200/70 text-xs text-slate-700 font-bold">
            <SlidersHorizontal size={14} className="text-slate-400" />
            <span>Filter:</span>
          </div>

          <select className="input py-1.5 px-3 w-36 text-xs" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="">Semua Kelas</option>
            {(classes || []).map((cls) => (
              <option key={cls.id} value={cls.name}>
                Kelas {cls.name}
              </option>
            ))}
          </select>

          {mode === "admin" && (
            <select className="input py-1.5 px-3 w-40 text-xs" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
              <option value="">Semua Mapel</option>
              {(subjects || []).map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          )}

          <select className="input py-1.5 px-3 w-36 text-xs" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="">Semua Kelulusan</option>
            <option value="Lulus">Lulus</option>
            <option value="Tidak Lulus">Tidak Lulus</option>
          </select>

          <select className="input py-1.5 px-3 w-36 text-xs" value={selectedValidation} onChange={(e) => setSelectedValidation(e.target.value)}>
            <option value="">Semua Validasi</option>
            <option value="Valid">Valid</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2 text-xs py-2 px-3" disabled={filteredData.length === 0}>
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => window.print()} className="btn-primary flex items-center gap-2 text-xs py-2 px-3 shadow-lg shadow-teal-500/20 font-bold" disabled={filteredData.length === 0}>
            <Printer size={14} /> Cetak Laporan
          </button>
          <button onClick={handleExportPDF} className="btn-secondary flex items-center gap-2 text-xs py-2 px-3" disabled={filteredData.length === 0}>
            <Download size={14} /> Export PDF
          </button>
          <button onClick={() => refetch()} className="btn-secondary p-2" title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading && <p className="text-sm text-slate-500 p-6 no-print">Memuat rekap laporan nilai...</p>}
        {error && <p className="text-sm font-semibold text-rose-600 p-6 no-print">{error}</p>}
        {!loading && filteredData.length === 0 && (
          <EmptyState
            title="Laporan masih kosong"
            description={mode === "guru" ? "Anda belum menginput nilai siswa. Mulai masukkan nilai siswa untuk mengisi laporan." : "Data nilai akan muncul setelah guru menginput nilai siswa."}
            actionText={mode === "guru" ? "+ Input Nilai Siswa" : undefined}
            onAction={mode === "guru" ? () => navigate("/guru/input-nilai") : undefined}
          />
        )}

        {filteredData.length > 0 && (
          <div id="print-area" className="p-6 print:p-0">
            {/* Header Cetak (Hanya Muncul saat Cetak / di Print Area) */}
            <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-6">
              <h1 className="text-2xl font-black text-slate-950 uppercase tracking-wide">SDN Mangunjaya 06</h1>
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mt-1">Laporan Hasil Penilaian Siswa</h2>
              <p className="text-xs text-slate-500 mt-2">Jl. Graha Prima Raya No.72, Mangunjaya, Kec. Tambun Selatan, Kabupaten Bekasi, Jawa Barat 17510</p>
            </div>

            {/* Metadata (Selalu Tampil) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100 print:bg-transparent print:border-0 print:p-0 print:mb-4">
              <div className="space-y-1.5">
                <p className="text-slate-600 print:text-black">
                  <span className="font-semibold text-xs text-slate-400 uppercase block">Mata Pelajaran</span>
                  <span className="font-extrabold text-slate-900 print:text-black text-sm">{mode === "guru" ? subjectName : filteredData[0]?.subject_name || "Semua Mapel"}</span>
                </p>
                <p className="text-slate-600 print:text-black mt-2">
                  <span className="font-semibold text-xs text-slate-400 uppercase block">Kelas</span>
                  <span className="font-extrabold text-slate-900 print:text-black text-sm">{selectedClass || "Semua Kelas"}</span>
                </p>
              </div>
              <div className="space-y-1.5 md:text-right print:text-left print:space-y-1">
                {(mode === "guru" || filteredData[0]?.teacher_name) && (
                  <p className="text-slate-600 print:text-black">
                    <span className="font-semibold text-xs text-slate-400 uppercase block">Guru Pengampu</span>
                    <span className="font-extrabold text-slate-900 print:text-black text-sm">{mode === "guru" ? teacherName : filteredData[0]?.teacher_name || "-"}</span>
                  </p>
                )}
                <p className="text-slate-600 print:text-black mt-2">
                  <span className="font-semibold text-xs text-slate-400 uppercase block">Tanggal Cetak</span>
                  <span className="font-extrabold text-slate-900 print:text-black text-sm">{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] print:min-w-0">
                <thead className="table-head">
                  <tr>
                    <th className="px-4 py-3 text-center w-12">No</th>
                    <th className="px-4 py-3 w-32">NIS</th>
                    <th className="px-4 py-3 min-w-[200px]">Nama Siswa</th>
                    <th className="px-4 py-3 text-center w-24">Kelas</th>
                    {mode === "admin" && <th className="px-4 py-3 w-40">Mata Pelajaran</th>}
                    <th className="px-4 py-3 text-center w-20">Tugas</th>
                    <th className="px-4 py-3 text-center w-20">UTS</th>
                    <th className="px-4 py-3 text-center w-20">UAS</th>
                    <th className="px-4 py-3 text-center w-24">Akhir</th>
                    <th className="px-4 py-3 text-center w-28">Status</th>
                    <th className="px-4 py-3 text-center w-28">Validasi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="table-cell text-center font-bold">{index + 1}</td>
                      <td className="table-cell font-mono font-bold text-slate-800">{item.nis}</td>
                      <td className="table-cell font-bold text-slate-900">{item.student_name}</td>
                      <td className="table-cell text-center font-bold text-slate-700">Kelas {item.class_name}</td>
                      {mode === "admin" && <td className="table-cell font-bold text-slate-800">{item.subject_name}</td>}
                      <td className="table-cell text-center font-mono">{item.assignment_score}</td>
                      <td className="table-cell text-center font-mono">{item.midterm_score}</td>
                      <td className="table-cell text-center font-mono">{item.final_exam_score}</td>
                      <td className="table-cell text-center font-black font-mono text-slate-900">{Number(item.final_score).toFixed(2)}</td>
                      <td className="table-cell text-center">
                        <span className="print:hidden">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                              item.status === "Lulus" ? "bg-teal-50 border-teal-100 text-teal-700" : "bg-rose-50 border-rose-100 text-rose-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </span>
                        <span className="hidden print:inline font-bold">{item.status}</span>
                      </td>
                      <td className="table-cell text-center">
                        <span className="print:hidden">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                              item.validation_status === "Valid" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-amber-50 border-amber-100 text-amber-700"
                            }`}
                          >
                            {item.validation_status}
                          </span>
                        </span>
                        <span className="hidden print:inline font-bold">{item.validation_status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Cetak (Hanya Muncul saat Cetak) */}
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
                <p className="font-bold mt-1">Guru Mata Pelajaran</p>
                <div className="h-16"></div>
                <p className="font-bold underline text-slate-900">{mode === "guru" ? teacherName : filteredData[0]?.teacher_name || "-"}</p>
                <p className="text-[10px] text-slate-500">Mata Pelajaran: {mode === "guru" ? subjectName : filteredData[0]?.subject_name || "-"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
