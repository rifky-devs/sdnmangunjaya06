import React from "react";
import { Shield, BookOpen, GraduationCap } from "lucide-react";

export default function RoleBadge({ role = "", className = "" }) {
  const normalizedRole = role.toLowerCase();

  const config = {
    admin: {
      text: "Administrator",
      icon: Shield,
      styles: "bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/10",
    },
    guru: {
      text: "Guru Pengampu",
      icon: BookOpen,
      styles: "bg-teal-50 text-teal-700 border-teal-100 ring-teal-500/10",
    },
    siswa: {
      text: "Siswa Mandiri",
      icon: GraduationCap,
      styles: "bg-cyan-50 text-cyan-700 border-cyan-100 ring-cyan-500/10",
    },
  };

  // Safe fallback to student styling if role has another format
  const activeConfig = config[normalizedRole] || {
    text: role || "Siswa",
    icon: GraduationCap,
    styles: "bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/10",
  };

  const IconComponent = activeConfig.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ring-4 select-none ${activeConfig.styles} ${className}`}
    >
      <IconComponent size={13} className="shrink-0" />
      <span>{activeConfig.text}</span>
    </div>
  );
}
