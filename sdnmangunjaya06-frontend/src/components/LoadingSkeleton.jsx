import React from "react";

export default function LoadingSkeleton({ type = "table", rows = 5, cards = 3 }) {
  const shimmer = "bg-slate-200 animate-pulse rounded-2xl";

  if (type === "card") {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-soft">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 shrink-0 ${shimmer}`} />
              <div className="flex-1 space-y-2">
                <div className={`h-3 w-1/3 ${shimmer}`} />
                <div className={`h-5 w-2/3 ${shimmer}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "profile") {
    return (
      <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-soft space-y-6">
        <div className="flex items-center gap-6">
          <div className={`h-20 w-20 shrink-0 rounded-full ${shimmer}`} />
          <div className="flex-1 space-y-3">
            <div className={`h-4 w-1/4 ${shimmer}`} />
            <div className={`h-6 w-1/2 ${shimmer}`} />
          </div>
        </div>
        <div className="space-y-3 border-t border-slate-100 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className={`h-3 w-1/3 ${shimmer}`} />
              <div className={`h-5 w-3/4 ${shimmer}`} />
            </div>
            <div className="space-y-2">
              <div className={`h-3 w-1/3 ${shimmer}`} />
              <div className={`h-5 w-3/4 ${shimmer}`} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: Table skeleton
  return (
    <div className="w-full space-y-4 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className={`h-8 w-48 ${shimmer}`} />
        <div className={`h-8 w-24 ${shimmer}`} />
      </div>
      <div className="space-y-3.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-1">
            <div className={`h-5 w-1/12 ${shimmer}`} />
            <div className={`h-5 w-4/12 ${shimmer}`} />
            <div className={`h-5 w-3/12 ${shimmer}`} />
            <div className={`h-5 w-2/12 ${shimmer}`} />
            <div className={`h-5 w-2/12 shrink-0 ${shimmer}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
