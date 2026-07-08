'use client';

interface SkeletonLoaderProps {
  rows?: number;
  columns?: number;
  type?: 'table' | 'card' | 'form';
}

export default function SkeletonLoader({
  rows = 5,
  columns = 4,
  type = 'table',
}: SkeletonLoaderProps) {
  if (type === 'table') {
    return (
      <div className="space-y-3 animate-pulse">
        {/* Header */}
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={`header-${i}`} className="h-10 bg-white/10 rounded-lg" />
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={`row-${rowIdx}`}
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIdx) => (
              <div key={`cell-${rowIdx}-${colIdx}`} className="h-8 bg-white/5 rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="space-y-6 animate-pulse">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={`card-${i}`}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
          >
            <div className="h-6 bg-white/10 rounded-lg w-3/4" />
            <div className="space-y-3">
              <div className="h-4 bg-white/5 rounded-lg" />
              <div className="h-4 bg-white/5 rounded-lg w-5/6" />
              <div className="h-4 bg-white/5 rounded-lg w-4/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Form Title */}
        <div className="h-8 bg-white/10 rounded-lg w-1/3" />

        {/* Form Fields */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={`field-${i}`} className="space-y-3">
            <div className="h-5 bg-white/10 rounded-lg w-1/4" />
            <div className="h-12 bg-white/5 rounded-lg" />
          </div>
        ))}

        {/* Submit Button */}
        <div className="h-11 bg-teal-500/20 rounded-lg w-full" />
      </div>
    );
  }

  return null;
}
