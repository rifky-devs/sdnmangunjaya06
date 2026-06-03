const variants = {
  Lulus: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  'Tidak Lulus': 'bg-rose-50 text-rose-700 ring-rose-100',
  Valid: 'bg-blue-50 text-blue-700 ring-blue-100',
  Draft: 'bg-amber-50 text-amber-700 ring-amber-100',
  Aktif: 'bg-emerald-50 text-emerald-700 ring-emerald-100'
};

export default function StatusBadge({ children }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${
        variants[children] || 'bg-slate-50 text-slate-700 ring-slate-100'
      }`}
    >
      {children}
    </span>
  );
}
