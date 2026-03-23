'use client';

export default function Loading() {
  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse mb-3" />
        <div className="h-4 w-96 bg-slate-100 rounded-lg animate-pulse" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-20 bg-slate-100 rounded animate-pulse mb-2" />
                <div className="h-6 w-12 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="h-5 w-40 bg-slate-200 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg animate-pulse" />
                <div className="flex-1 h-4 bg-slate-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="h-5 w-40 bg-slate-200 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
