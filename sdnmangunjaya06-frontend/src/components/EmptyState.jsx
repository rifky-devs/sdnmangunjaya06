import React from "react";
import { motion } from "framer-motion";
import { FolderOpen } from "lucide-react";

export default function EmptyState({
  title = "Data Belum Tersedia",
  description = "Maaf, saat ini belum ada catatan data yang terdaftar di dalam sistem.",
  icon: IconComponent = FolderOpen,
  actionText,
  onAction,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-slate-200/80 bg-white/95 p-12 text-center shadow-soft backdrop-blur-sm"
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-teal-50 text-teal-600 ring-8 ring-teal-50/50 shadow-inner">
        <IconComponent size={28} className="animate-pulse" />
      </div>
      <h3 className="text-lg font-black text-slate-900 tracking-tight font-plus-jakarta">{title}</h3>
      {description && (
        <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-slate-500 font-nunito">{description}</p>
      )}
      {actionText && onAction && (
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-teal-700/10 hover:shadow-lg hover:shadow-teal-700/15 transition-all font-plus-jakarta"
        >
          {actionText}
        </motion.button>
      )}
    </motion.div>
  );
}
