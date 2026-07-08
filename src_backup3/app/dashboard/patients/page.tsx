'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import SkeletonLoader from '@/components/SkeletonLoader';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import Pagination from '@/components/Pagination';

interface Patient {
    _id: string;
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    bloodGroup: string;
    address?: string;
    medicalHistory?: string;
}

const PAGE_SIZE = 8;

export default function PatientsListPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [bloodFilter, setBloodFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [status, session, router]);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/patients');
            if (res.ok) {
                const data = await res.json();
                setPatients(Array.isArray(data) ? data : []);
            } else {
                setError('Failed to load patients.');
            }
        } catch (err) {
            setError('Network error while loading patients.');
        } finally {
            setLoading(false);
        }
    };

    const bloodGroups = ['all', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

    const filtered = useMemo(() => {
        return patients.filter((p) => {
            const matchesSearch =
                p.name?.toLowerCase().includes(search.toLowerCase()) ||
                p.email?.toLowerCase().includes(search.toLowerCase()) ||
                p.phone?.includes(search);
            const matchesBlood = bloodFilter === 'all' || p.bloodGroup === bloodFilter;
            return matchesSearch && matchesBlood;
        });
    }, [patients, search, bloodFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => {
        setPage(1);
    }, [search, bloodFilter]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/patients/${deleteTarget._id}`, { method: 'DELETE' });
            if (res.ok) {
                setPatients((prev) => prev.filter((p) => p._id !== deleteTarget._id));
                setToast('✅ Patient deleted successfully.');
            } else {
                const data = await res.json();
                setToast(`❌ ${data.error || 'Failed to delete patient.'}`);
            }
        } catch (err) {
            setToast('❌ Network error while deleting patient.');
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
                    <h2 className="text-2xl font-black text-white">Patients</h2>
                    <p className="text-xs text-white/50 mt-1">Manage registered patient records.</p>
                </div>
                <Link
                    href="/dashboard/patients/new"
                    className="px-5 py-2.5 bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg text-center whitespace-nowrap"
                >
                    + Add Patient
                </Link>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 p-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-teal-400 text-white text-sm"
                />
                <select
                    value={bloodFilter}
                    onChange={(e) => setBloodFilter(e.target.value)}
                    className="p-3 bg-slate-900 border border-white/10 rounded-xl outline-none text-white text-sm sm:w-48"
                >
                    {bloodGroups.map((bg) => (
                        <option key={bg} value={bg} className="bg-slate-900">
                            {bg === 'all' ? 'All Blood Groups' : bg}
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
                    <SkeletonLoader rows={6} columns={5} type="table" />
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 text-white/40 text-sm">No patients found.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-white/40 text-xs uppercase tracking-wider border-b border-white/10">
                                <th className="pb-3 pr-4">Name</th>
                                <th className="pb-3 pr-4">Contact</th>
                                <th className="pb-3 pr-4">Date of Birth</th>
                                <th className="pb-3 pr-4">Blood Group</th>
                                <th className="pb-3 pr-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((p) => (
                                <tr key={p._id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                                    <td className="py-3 pr-4 text-white font-medium">{p.name}</td>
                                    <td className="py-3 pr-4 text-white/60">
                                        <div>{p.email}</div>
                                        <div className="text-xs text-white/40">{p.phone}</div>
                                    </td>
                                    <td className="py-3 pr-4 text-white/60">
                                        {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="py-3 pr-4">
                                        <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-xs font-semibold">
                                            {p.bloodGroup}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-4">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/dashboard/patients/${p._id}/edit`}
                                                className="px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-300 rounded-lg text-xs font-semibold transition-all"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => setDeleteTarget(p)}
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
                title="Delete Patient"
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
