'use client';

export function CardSkeleton() {
  return (
    <div className="card p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="skeleton h-5 w-20" />
        <div className="skeleton h-5 w-16" />
      </div>
      <div className="skeleton h-7 w-48" />
      <div className="skeleton h-4 w-32" />
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="skeleton h-16 rounded-xl" />
        <div className="skeleton h-16 rounded-xl" />
        <div className="skeleton h-16 rounded-xl" />
        <div className="skeleton h-16 rounded-xl" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card p-6 space-y-3 animate-fade-in">
      <div className="skeleton h-6 w-56 mb-4" />
      <div className="skeleton h-10 w-full rounded-xl" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function RadarSkeleton() {
  return (
    <div className="card p-6 flex flex-col items-center justify-center animate-fade-in">
      <div className="skeleton h-6 w-48 mb-6" />
      <div className="skeleton w-56 h-56 rounded-full" />
    </div>
  );
}

export function GemCardSkeleton() {
  return (
    <div className="card p-5 space-y-3 animate-fade-in">
      <div className="flex justify-between">
        <div className="space-y-2 flex-1">
          <div className="skeleton h-5 w-32" />
          <div className="skeleton h-3 w-24" />
        </div>
        <div className="skeleton h-12 w-12 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="skeleton h-10 rounded-lg" />
        <div className="skeleton h-10 rounded-lg" />
      </div>
      <div className="flex gap-1.5">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-[3px] border-carbon-200 dark:border-carbon-700" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-[3px] border-pitch-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm font-semibold text-carbon-400 dark:text-carbon-500 animate-pulse">
          Loading data...
        </p>
      </div>
    </div>
  );
}
