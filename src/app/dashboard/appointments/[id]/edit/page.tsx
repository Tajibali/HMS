'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Patient {
    _id: string;
    name: string;
    email: string;
}

interface Doctor {
    _id: string;
    name: string;
    specialization: string;
}

export default function EditAppointment() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const { status } = useSession();

    const [patients, setPatients] = useState<Patient[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        patientId: '',
        doctorId: '',
        date: '',
        status: 'Pending',
    });

    useEffect(() => {
        if (!id) return;
        const loadData = async () => {
            try {
                const [apptRes, patientsRes, doctorsRes] = await Promise.all([
                    fetch(`/api/appointments/${id}`),
                    fetch('/api/patients'),
                    fetch('/api/doctors'),
                ]);

                if (patientsRes.ok) setPatients(await patientsRes.json());
                if (doctorsRes.ok) setDoctors(await doctorsRes.json());

                if (apptRes.ok) {
                    const a = await apptRes.json();
                    const patientId = typeof a.patientId === 'object' ? a.patientId._id : a.patientId;
                    const doctorId = typeof a.doctorId === 'object' ? a.doctorId._id : a.doctorId;
                    setFormData({
                        patientId,
                        doctorId,
                        date: a.date ? new Date(a.date).toISOString().slice(0, 16) : '',
                        status: a.status || 'Pending',
                    });
                } else {
                    setError('Appointment not found.');
                }
            } catch (err) {
                setError('Failed to load appointment data.');
            } finally {
                setFetching(false);
            }
        };
        loadData();
    }, [id]);

    const executeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!formData.patientId || !formData.doctorId || !formData.date) {
            setError('❌ Please select a patient, doctor, and date.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/appointments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            setLoading(false);

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push('/dashboard/appointments'), 1500);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to update appointment.');
            }
        } catch (err) {
            setLoading(false);
            setError('❌ Network error: Unable to save appointment data.');
        }
    };

    if (status === 'loading' || fetching) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-12 h-12 border-4 border-teal-400/20 border-t-teal-400 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md shadow-xl">
            <h2 className="text-2xl font-bold mb-2 text-white">Edit Appointment</h2>
            <p className="text-xs text-white/50 mb-6">Update patient, doctor, date, or status.</p>

            {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-lg mb-4">{error}</div>}
            {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-lg mb-4">✅ Appointment updated successfully. Redirecting...</div>}

            <form onSubmit={executeSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-white/60 mb-2 uppercase">Patient</label>
                    <select
                        value={formData.patientId}
                        onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-teal-400 outline-none"
                        required
                    >
                        <option value="">Choose a patient...</option>
                        {patients.map((p) => (
                            <option key={p._id} value={p._id} className="bg-slate-900">
                                {p.name} ({p.email})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-white/60 mb-2 uppercase">Doctor</label>
                    <select
                        value={formData.doctorId}
                        onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-teal-400 outline-none"
                        required
                    >
                        <option value="">Choose a doctor...</option>
                        {doctors.map((d) => (
                            <option key={d._id} value={d._id} className="bg-slate-900">
                                {d.name} - {d.specialization}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-white/60 mb-2 uppercase">Appointment Date & Time</label>
                    <input
                        type="datetime-local"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-teal-400 outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-white/60 mb-2 uppercase">Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-teal-400 outline-none"
                    >
                        <option value="Pending" className="bg-slate-900">Pending</option>
                        <option value="Confirmed" className="bg-slate-900">Confirmed</option>
                    </select>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        type="button"
                        onClick={() => router.push('/dashboard/appointments')}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-semibold rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || success}
                        className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
