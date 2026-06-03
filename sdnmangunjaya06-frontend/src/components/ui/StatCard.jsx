export default function StatCard({ icon: Icon, label, value, note }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
          {note && <p className="mt-1 text-sm text-slate-500">{note}</p>}
        </div>
        {Icon && (
          <div className="rounded-2xl bg-teal-50 p-3 text-teal-700">
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
}
