'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function DoctorOnboarding() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({ name: '', specialization: 'General Medicine', email: '', availability: [] as string[] });

    // Check if user is admin
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [status, session, router]);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const handleCheckbox = (day: string) => {
        const updated = formData.availability.includes(day)
            ? formData.availability.filter(d => d !== day)
            : [...formData.availability, day];
        setFormData({ ...formData, availability: updated });
    };

    const executeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        // Regex checking institutional standard email criteria
        if (!formData.email.endsWith('@hms.com') && !formData.email.endsWith('@hospital.com')) {
            setError('❌ Validation Error: Requires an official institutional email (@hms.com).');
            return;
        }

        setLoading(true);
        const res = await fetch('/api/doctors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        setLoading(false);

        if (res.ok) {
            setSuccess(true);
            setFormData({ name: '', specialization: 'General Medicine', email: '', availability: [] });
            setTimeout(() => router.push('/dashboard'), 2000);
        }
        else setError('Failed to onboarding doctor profile configuration.');
    };

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-teal-400/20 border-t-teal-400 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (session?.user?.role !== 'admin') {
        return (
            <div className="max-w-xl mx-auto bg-rose-500/10 border border-rose-500/20 p-8 rounded-3xl backdrop-blur-2xl shadow-2xl">
                <h2 className="text-2xl font-black tracking-tight text-rose-300">Access Denied</h2>
                <p className="text-sm text-white/60 mt-3">❌ Only administrators can onboard doctors.</p>
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
            <h2 className="text-xl font-bold tracking-tight mb-2">Practitioner Profiles Setup</h2>
            <p className="text-xs text-white/50 mb-6">Register medical personnel metadata within the global ledger.</p>

            {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-lg mb-4">{error}</div>}
            {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-lg mb-4">🎉 Doctor entity created within node network.</div>}

            <form onSubmit={executeSubmit} className="space-y-4 text-sm">
                <input type="text" placeholder="Physician Name" required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-teal-400" onChange={e => setFormData({ ...formData, name: e.target.value })} />

                <select className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl text-white/80 outline-none" onChange={e => setFormData({ ...formData, specialization: e.target.value })}>
                    <option>General Medicine</option><option>Cardiology</option><option>Pediatrics</option><option>Neurology</option>
                </select>

                <input type="email" placeholder="Institutional Email Addresses" required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white outline-none focus:border-teal-400" onChange={e => setFormData({ ...formData, email: e.target.value })} />

                <div>
                    <label className="block text-xs text-white/60 mb-2 font-semibold">Weekly Schedule Availability</label>
                    <div className="flex flex-wrap gap-3">
                        {days.map(day => (
                            <label key={day} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 text-xs cursor-pointer hover:bg-white/10">
                                <input type="checkbox" checked={formData.availability.includes(day)} onChange={() => handleCheckbox(day)} className="rounded accent-teal-400" />
                                {day}
                            </label>
                        ))}
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold p-3 rounded-xl shadow-lg transition-all active:scale-[0.99]">
                    {loading ? 'Executing Network Operations...' : 'Commit System Configuration'}
                </button>
            </form>
        </div>
    );
}