export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        {eyebrow && (
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-teal-700">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
          {title}
        </h1>
        {description && <p className="mt-2 max-w-3xl text-slate-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}
