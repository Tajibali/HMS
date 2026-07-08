'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function EditDoctor() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        specialization: 'General Medicine',
        email: '',
        availability: [] as string[],
    });

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [status, session, router]);

    useEffect(() => {
        if (!id) return;
        const loadDoctor = async () => {
            try {
                const res = await fetch(`/api/doctors/${id}`);
                if (res.ok) {
                    const d = await res.json();
                    setFormData({
                        name: d.name || '',
                        specialization: d.specialization || 'General Medicine',
                        email: d.email || '',
                        availability: d.availability || [],
                    });
                } else {
                    setError('Doctor not found.');
                }
            } catch (err) {
                setError('Failed to load doctor data.');
            } finally {
                setFetching(false);
            }
        };
        loadDoctor();
    }, [id]);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const specs = ['General Medicine', 'Cardiology', 'Pediatrics', 'Surgery', 'Dermatology', 'Neurology'];

    const handleCheckbox = (day: string) => {
        const updated = formData.availability.includes(day)
            ? formData.availability.filter((d) => d !== day)
            : [...formData.availability, day];
        setFormData({ ...formData, availability: updated });
    };

    const executeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!formData.email.endsWith('@hms.com') && !formData.email.endsWith('@hospital.com')) {
            setError('❌ Validation Error: Requires an official institutional email (@hms.com).');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/doctors/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            setLoading(false);

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push('/dashboard/doctors'), 1500);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to update doctor profile.');
            }
        } catch (err) {
            setLoading(false);
            setError('❌ Network error: Unable to save doctor data.');
        }
    };

    if (status === 'loading' || fetching) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-12 h-12 border-4 border-teal-400/20 border-t-teal-400 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (session?.user?.role !== 'admin') {
        return (
            <div className="max-w-xl mx-auto bg-rose-500/10 border border-rose-500/20 p-8 rounded-3xl backdrop-blur-2xl shadow-2xl">
                <h2 className="text-2xl font-black tracking-tight text-rose-300">Access Denied</h2>
                <p className="text-sm text-white/60 mt-3">❌ Only administrators can edit doctors.</p>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="mt-6 w-full py-3 bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-bold rounded-xl"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto backdrop-blur-3xl bg-white/5 border border-white/10 p-8 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold tracking-tight mb-2 text-white">Edit Doctor Profile</h2>
            <p className="text-xs text-white/50 mb-6">Update practitioner details in the system.</p>

            {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-lg mb-4">{error}</div>}
            {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-lg mb-4">✅ Doctor profile updated successfully. Redirecting...</div>}

            <form onSubmit={executeSubmit} className="space-y-4 text-sm">
                <div>
                    <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Physician Name</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-teal-400"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Specialization</label>
                    <select
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl text-white/80 outline-none"
                    >
                        {specs.map((s) => (
                            <option key={s} value={s} className="bg-slate-900">{s}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Institutional Email</label>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-teal-400"
                    />
                </div>

                <div>
                    <label className="block text-xs text-white/60 mb-2 font-semibold">Weekly Schedule Availability</label>
                    <div className="flex flex-wrap gap-3">
                        {days.map((day) => (
                            <label key={day} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 text-xs cursor-pointer hover:bg-white/10">
                                <input type="checkbox" checked={formData.availability.includes(day)} onChange={() => handleCheckbox(day)} className="rounded accent-teal-400" />
                                {day}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        type="button"
                        onClick={() => router.push('/dashboard/doctors')}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-semibold rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || success}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold p-3 rounded-xl shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
