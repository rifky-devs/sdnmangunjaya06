import { useState, useEffect } from "react";
import { ArrowRight, BookOpenCheck, ShieldCheck, UsersRound, MapPin, Clock, Map } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import logoNoBg from "../../images/logonobg.webp";
import latarsekolah from "../../images/latarsekolah.webp";
import { useFetch } from "../../hooks/useFetch.js";

const features = [
  {
    icon: ShieldCheck,
    title: "Akses Berdasarkan Role",
    text: "Admin, guru, dan siswa memiliki halaman serta hak akses berbeda.",
  },
  {
    icon: BookOpenCheck,
    title: "Perhitungan Nilai Otomatis",
    text: "Nilai akhir dihitung dari tugas, UTS, dan UAS sesuai rumus sekolah.",
  },
  {
    icon: UsersRound,
    title: "Laporan Terstruktur",
    text: "Rekap nilai, status kelulusan, dan validasi guru ditampilkan rapi.",
  },
];

export default function LandingPage() {
  const fullText = "Pengolahan nilai siswa lebih rapi, cepat, dan mudah dipantau.";
  const [typedText, setTypedText] = useState("");
  const location = useLocation();

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, index + 1));
      index++;
      if (index >= fullText.length) {
        clearInterval(interval);
      }
    }, 45);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const hash = location.hash?.replace("#", "");
    if (!hash) return;

    let attempts = 0;
    const maxAttempts = 20;

    const scrollToTarget = () => {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(scrollToTarget, 150);
      }
    };

    // Small initial delay to let React render the page first
    const timer = setTimeout(scrollToTarget, 400);
    return () => clearTimeout(timer);
  }, [location.hash]);

  const { data: statsData, loading: statsLoading } = useFetch("/dashboard/public", {
    refetchInterval: 60000, // refresh setiap 60 detik
  });

  return (
    <motion.main
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-teal-700 text-white"
    >
      {/* Background Image Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.2] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url(${latarsekolah})` }}
      />

      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg overflow-hidden ring-2 ring-white/20">
            <img src={logoNoBg} alt="Logo SDN Mangunjaya 06" className="h-full w-full object-cover rounded-full scale-[1.25]" />
          </div>
          <div>
            <p className="font-black text-white font-plus-jakarta leading-none">SDN Mangunjaya 06</p>
            <p className="text-xs font-semibold text-teal-200 mt-0.5 font-nunito">Sistem Penilaian Siswa</p>
          </div>
        </div>
        <Link to="/login" className="btn-primary font-plus-jakarta font-bold">
          Login
        </Link>
      </nav>

      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.8 }}
        className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24"
      >
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white font-inter">
            Website sekolah modern dan terstruktur
          </p>
          <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white md:text-6xl min-h-[160px] md:min-h-[220px] select-none font-plus-jakarta leading-[1.1]">
            {typedText}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-teal-100 font-nunito font-normal">
            Sistem ini membantu admin mengelola data, guru menginput nilai, dan siswa melihat
            hasil belajar pribadi dengan status kelulusan yang dihitung otomatis.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" className="btn-primary gap-2 font-plus-jakarta font-bold">
              Masuk ke Sistem <ArrowRight size={18} />
            </Link>
            <a href="#fitur" className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/10 font-plus-jakarta">
              Lihat Fitur
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-md shadow-2xl"
        >  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal-200/60 blur-3xl" />
          <div className="relative rounded-[1.7rem] bg-slate-950 p-6 text-white">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">Dashboard Sekolah</p>
                <h2 className="text-2xl font-black">Rekap Nilai</h2>
              </div>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">Aktif</span>
            </div>

            {[
              {
                label: "Siswa Aktif",
                value: statsLoading ? "..." : (statsData?.students ?? 0),
                color: "text-emerald-300"
              },
              {
                label: "Nilai Tervalidasi",
                value: statsLoading ? "..." : (statsData?.validationRate ?? "0%"),
                color: "text-teal-300"
              },
              {
                label: "Rata-rata Nilai",
                value: statsLoading ? "..." : (statsData?.averageGrade ?? "0.0"),
                color: "text-white"
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="mb-3 rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-slate-300">{label}</p>
                <p className={`text-3xl font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.section>

      <section id="fitur" className="relative z-10 mx-auto grid max-w-7xl gap-5 px-6 pb-20 md:grid-cols-3">
        {features.map((feature, idx) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:bg-white/10 hover:shadow-lg"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-teal-300">
              <feature.icon />
            </div>
            <h3 className="text-lg font-black text-white font-plus-jakarta">{feature.title}</h3>
            <p className="mt-2 text-sm leading-6 text-teal-100 font-nunito">{feature.text}</p>
          </motion.div>
        ))}
      </section>

      {/* Informasi Sekolah / Footer Section */}
      <motion.section
        id="informasi-sekolah"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto max-w-7xl px-6 pb-12"
      >
        <div className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm shadow-sm md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            
            {/* Kolom Kiri: Detail Informasi Identitas & Jam Operasional */}
            <div className="flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg overflow-hidden ring-2 ring-white/20">
                    <img src={logoNoBg} alt="Logo SDN Mangunjaya 06" className="h-full w-full object-cover rounded-full scale-[1.25]" />
                  </div>
                  <div>
                    <p className="font-black text-white font-plus-jakarta leading-none text-lg">SDN Mangunjaya 06</p>
                    <p className="text-xs text-teal-200 font-nunito mt-1">Sekolah dasar di Kabupaten Bekasi, Jawa Barat</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm text-teal-100 font-nunito font-normal">
                  <MapPin className="mt-1 text-teal-300 shrink-0" size={18} />
                  <p>Jl. Graha Prima Raya No.72, Mangunjaya, Kec. Tambun Sel., Kabupaten Bekasi, Jawa Barat 17510</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-white/5 pt-4">
                <h4 className="text-xs font-bold text-white font-plus-jakarta uppercase tracking-wider text-slate-300">Jam Operasional</h4>
                <div className="flex items-start gap-3 text-sm text-teal-100 font-nunito font-normal">
                  <Clock className="mt-0.5 text-teal-300 shrink-0" size={18} />
                  <div>
                    <div>Senin - Jumat: 07.00 - selesai kegiatan sekolah</div>
                    <div className="mt-0.5 text-teal-200/70">Sabtu - Minggu: Tutup / menyesuaikan kegiatan sekolah</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Peta Google Maps Lokasi Sekolah */}
            <div className="flex flex-col gap-3 border-t border-white/5 pt-6 lg:border-t-0 lg:border-l lg:border-white/5 lg:pt-0 lg:pl-8">
              <h4 className="text-xs font-bold text-white font-plus-jakarta uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Map size={16} className="text-teal-300" /> Lokasi Sekolah
              </h4>
              
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 p-1 shadow-inner mt-2">
                <iframe
                  src="https://www.google.com/maps?q=SDN%20Mangunjaya%2006%20Jl.%20Graha%20Prima%20Raya%20No.72%20Mangunjaya%20Tambun%20Selatan%20Bekasi&output=embed"
                  width="100%"
                  height="160"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-xl opacity-90 hover:opacity-100 transition"
                ></iframe>
              </div>
              
              <a
                href="https://www.google.com/maps/place/SDN+Mangunjaya+06/data=!4m2!3m1!1s0x0:0x90988acd52350384?sa=X&ved=1t:2428&ictx=111"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-teal-700 uppercase tracking-wider font-plus-jakarta"
              >
                Buka di Google Maps
              </a>
            </div>

          </div>

          <div className="mt-6 border-t border-white/10 pt-4 text-sm text-teal-200 font-nunito">
            <p>© 2026 SDN Mangunjaya 06. All Rights Reserved. Built with React by rifky devs.</p>
          </div>
        </div>
      </motion.section>
    </motion.main>
  );
}
