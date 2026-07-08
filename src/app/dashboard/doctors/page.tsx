'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import SkeletonLoader from '@/components/SkeletonLoader';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import Pagination from '@/components/Pagination';

interface Doctor {
    _id: string;
    name: string;
    specialization: string;
    email: string;
    availability: string[];
}

const PAGE_SIZE = 8;

export default function DoctorsListPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [specFilter, setSpecFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [status, session, router]);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/doctors');
            if (res.ok) {
                const data = await res.json();
                setDoctors(Array.isArray(data) ? data : []);
            } else {
                setError('Failed to load doctors.');
            }
        } catch (err) {
            setError('Network error while loading doctors.');
        } finally {
            setLoading(false);
        }
    };

    const specializations = useMemo(() => {
        const unique = Array.from(new Set(doctors.map((d) => d.specialization)));
        return ['all', ...unique];
    }, [doctors]);

    const filtered = useMemo(() => {
        return doctors.filter((d) => {
            const matchesSearch =
                d.name?.toLowerCase().includes(search.toLowerCase()) ||
                d.email?.toLowerCase().includes(search.toLowerCase());
            const matchesSpec = specFilter === 'all' || d.specialization === specFilter;
            return matchesSearch && matchesSpec;
        });
    }, [doctors, search, specFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => {
        setPage(1);
    }, [search, specFilter]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/doctors/${deleteTarget._id}`, { method: 'DELETE' });
            if (res.ok) {
                setDoctors((prev) => prev.filter((d) => d._id !== deleteTarget._id));
                setToast('✅ Doctor deleted successfully.');
            } else {
                const data = await res.json();
                setToast(`❌ ${data.error || 'Failed to delete doctor.'}`);
            }
        } catch (err) {
            setToast('❌ Network error while deleting doctor.');
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
            setTimeout(() => setToast(''), 3000);
        }
    };

    if (status === 'loading' || session?.user?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-12 h-12 border-4 border-teal-400/20 border-t-teal-400 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white">Doctors</h2>
                    <p className="text-xs text-white/50 mt-1">Manage onboarded medical practitioners.</p>
                </div>
                <Link
                    href="/dashboard/doctors/new"
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg text-center whitespace-nowrap"
                >
                    + Add Doctor
                </Link>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 p-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-emerald-400 text-white text-sm"
                />
                <select
                    value={specFilter}
                    onChange={(e) => setSpecFilter(e.target.value)}
                    className="p-3 bg-slate-900 border border-white/10 rounded-xl outline-none text-white text-sm sm:w-56"
                >
                    {specializations.map((s) => (
                        <option key={s} value={s} className="bg-slate-900">
                            {s === 'all' ? 'All Specializations' : s}
                        </option>
                    ))}
                </select>
            </div>

            {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-lg">{error}</div>
            )}

            {/* Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm overflow-x-auto">
                {loading ? (
                    <SkeletonLoader rows={6} columns={4} type="table" />
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 text-white/40 text-sm">No doctors found.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-white/40 text-xs uppercase tracking-wider border-b border-white/10">
                                <th className="pb-3 pr-4">Name</th>
                                <th className="pb-3 pr-4">Specialization</th>
                                <th className="pb-3 pr-4">Email</th>
                                <th className="pb-3 pr-4">Availability</th>
                                <th className="pb-3 pr-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((d) => (
                                <tr key={d._id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                                    <td className="py-3 pr-4 text-white font-medium">{d.name}</td>
                                    <td className="py-3 pr-4">
                                        <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg text-xs font-semibold">
                                            {d.specialization}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-4 text-white/60">{d.email}</td>
                                    <td className="py-3 pr-4 text-white/50 text-xs">
                                        {d.availability?.length ? d.availability.join(', ') : '—'}
                                    </td>
                                    <td className="py-3 pr-4">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/dashboard/doctors/${d._id}/edit`}
                                                className="px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-300 rounded-lg text-xs font-semibold transition-all"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => setDeleteTarget(d)}
                                                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 rounded-lg text-xs font-semibold transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {!loading && filtered.length > 0 && (
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                )}
            </div>

            <DeleteConfirmModal
                isOpen={!!deleteTarget}
                title="Delete Doctor"
                message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
                isDeleting={isDeleting}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            {toast && (
                <div className="fixed bottom-6 right-6 bg-slate-900 border border-white/10 rounded-lg px-6 py-4 text-white text-sm shadow-2xl z-50">
                    {toast}
                </div>
            )}
        </div>
    );
}
