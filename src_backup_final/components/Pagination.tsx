'use client';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);

    return (
        <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
            <p className="text-xs text-white/40">
                Page <span className="text-white/70 font-semibold">{currentPage}</span> of{' '}
                <span className="text-white/70 font-semibold">{totalPages}</span>
            </p>
            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    ← Prev
                </button>
                {start > 1 && <span className="text-white/30 px-1">…</span>}
                {pages.map((p) => (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`w-8 h-8 text-xs rounded-lg transition-all ${p === currentPage
                                ? 'bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-bold'
                                : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white/70'
                            }`}
                    >
                        {p}
                    </button>
                ))}
                {end < totalPages && <span className="text-white/30 px-1">…</span>}
                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}
