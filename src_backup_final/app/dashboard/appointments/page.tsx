'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import SkeletonLoader from '@/components/SkeletonLoader';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import Pagination from '@/components/Pagination';

interface Appointment {
    _id: string;
    patientId: { _id: string; name: string; email?: string; phone?: string } | string;
    doctorId: { _id: string; name: string; specialization?: string } | string;
    date: string;
    status: string;
}

const PAGE_SIZE = 8;

export default function AppointmentsListPage() {
    const { data: session, status } = useSession();
    const isAdmin = session?.user?.role === 'admin';
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/appointments');
            if (res.ok) {
                const data = await res.json();
                setAppointments(Array.isArray(data) ? data : []);
            } else {
                setError('Failed to load appointments.');
            }
        } catch (err) {
            setError('Network error while loading appointments.');
        } finally {
            setLoading(false);
        }
    };

    const getName = (val: Appointment['patientId'] | Appointment['doctorId']) =>
        typeof val === 'object' && val ? val.name : String(val || '-');

    const filtered = useMemo(() => {
        return appointments.filter((a) => {
            const patientName = getName(a.patientId).toLowerCase();
            const doctorName = getName(a.doctorId).toLowerCase();
            const matchesSearch =
                patientName.includes(search.toLowerCase()) || doctorName.includes(search.toLowerCase());
            const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [appointments, search, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => {
        setPage(1);
    }, [search, statusFilter]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/appointments/${deleteTarget._id}`, { method: 'DELETE' });
            if (res.ok) {
                setAppointments((prev) => prev.filter((a) => a._id !== deleteTarget._id));
                setToast('✅ Appointment deleted successfully.');
            } else {
                const data = await res.json();
                setToast(`❌ ${data.error || 'Failed to delete appointment.'}`);
            }
        } catch (err) {
            setToast('❌ Network error while deleting appointment.');
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
            setTimeout(() => setToast(''), 3000);
        }
    };

    if (status === 'loading') {
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
                    <h2 className="text-2xl font-black text-white">Appointments</h2>
                    <p className="text-xs text-white/50 mt-1">
                        {isAdmin ? 'Manage all scheduled appointments.' : 'View scheduled appointments.'}
                    </p>
                </div>
                <Link
                    href="/dashboard/appointments/new"
                    className="px-5 py-2.5 bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg text-center whitespace-nowrap"
                >
                    + Book Appointment
                </Link>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                <input
                    type="text"
                    placeholder="Search by patient or doctor name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 p-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-teal-400 text-white text-sm"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="p-3 bg-slate-900 border border-white/10 rounded-xl outline-none text-white text-sm sm:w-48"
                >
                    <option value="all" className="bg-slate-900">All Statuses</option>
                    <option value="Pending" className="bg-slate-900">Pending</option>
                    <option value="Confirmed" className="bg-slate-900">Confirmed</option>
                </select>
            </div>

            {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-lg">{error}</div>
            )}

            {/* Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm overflow-x-auto">
                {loading ? (
                    <SkeletonLoader rows={6} columns={5} type="table" />
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 text-white/40 text-sm">No appointments found.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-white/40 text-xs uppercase tracking-wider border-b border-white/10">
                                <th className="pb-3 pr-4">Patient</th>
                                <th className="pb-3 pr-4">Doctor</th>
                                <th className="pb-3 pr-4">Date & Time</th>
                                <th className="pb-3 pr-4">Status</th>
                                <th className="pb-3 pr-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((a) => (
                                <tr key={a._id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                                    <td className="py-3 pr-4 text-white font-medium">{getName(a.patientId)}</td>
                                    <td className="py-3 pr-4 text-white/70">{getName(a.doctorId)}</td>
                                    <td className="py-3 pr-4 text-white/60">
                                        {a.date ? new Date(a.date).toLocaleString() : '-'}
                                    </td>
                                    <td className="py-3 pr-4">
                                        <span
                                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${a.status === 'Confirmed'
                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                                                    : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                                                }`}
                                        >
                                            {a.status}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-4">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/dashboard/appointments/${a._id}/edit`}
                                                className="px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-300 rounded-lg text-xs font-semibold transition-all"
                                            >
                                                Edit
                                            </Link>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => setDeleteTarget(a)}
                                                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 rounded-lg text-xs font-semibold transition-all"
                                                >
                                                    Delete
                                                </button>
                                            )}
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
                title="Delete Appointment"
                message="Are you sure you want to delete this appointment? This action cannot be undone."
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
