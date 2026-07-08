'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AddPatient() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        bloodGroup: 'O+',
        medicalHistory: '',
        address: '',
    });

    // Check if user is admin
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [status, session, router]);

    const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const executeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        // Validation
        if (!formData.name || !formData.email || !formData.phone) {
            setError('❌ Validation Error: Name, email, and phone are required.');
            return;
        }

        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setError('❌ Invalid email format.');
            return;
        }

        if (!formData.dateOfBirth) {
            setError('❌ Date of birth is required.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/patients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            setLoading(false);

            if (res.ok) {
                setSuccess(true);
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    dateOfBirth: '',
                    bloodGroup: 'O+',
                    medicalHistory: '',
                    address: '',
                });
                setTimeout(() => router.push('/dashboard'), 2000);
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to create patient record.');
            }
        } catch (err) {
            setLoading(false);
            setError('❌ Network error: Unable to save patient data.');
        }
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
                <p className="text-sm text-white/60 mt-3">❌ Only administrators can register new patients.</p>
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
        <div className="max-w-2xl mx-auto backdrop-blur-3xl bg-white/5 border border-white/10 p-8 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold tracking-tight mb-2 text-white">Patient Registration</h2>
            <p className="text-xs text-white/50 mb-6">Create a new patient record in the system.</p>

            {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-lg mb-4">
                    {error}
                </div>
            )}
            {success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-lg mb-4">
                    ✅ Patient record created successfully. Redirecting...
                </div>
            )}

            <form onSubmit={executeSubmit} className="space-y-4 text-sm">
                {/* Name */}
                <div>
                    <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">
                        Full Name *
                    </label>
                    <input
                        type="text"
                        name="name"
                        placeholder="e.g., John Doe"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-teal-400 focus:bg-white/10 transition-all text-white"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">
                        Email Address *
                    </label>
                    <input
                        type="email"
                        name="email"
                        placeholder="e.g., john@example.com"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-teal-400 focus:bg-white/10 transition-all text-white"
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">
                        Phone Number *
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        placeholder="e.g., +92-300-1234567"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-teal-400 focus:bg-white/10 transition-all text-white"
                    />
                </div>

                {/* Date of Birth */}
                <div>
                    <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">
                        Date of Birth *
                    </label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        required
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-teal-400 focus:bg-white/10 transition-all text-white"
                    />
                </div>

                {/* Blood Group */}
                <div>
                    <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">
                        Blood Group
                    </label>
                    <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-teal-400 focus:bg-white/10 transition-all text-white"
                    >
                        {bloodGroups.map(bg => (
                            <option key={bg} value={bg} className="bg-slate-900">
                                {bg}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Address */}
                <div>
                    <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">
                        Address
                    </label>
                    <input
                        type="text"
                        name="address"
                        placeholder="e.g., 123 Main Street, City"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-teal-400 focus:bg-white/10 transition-all text-white"
                    />
                </div>

                {/* Medical History */}
                <div>
                    <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">
                        Medical History
                    </label>
                    <textarea
                        name="medicalHistory"
                        placeholder="e.g., Allergies, past surgeries, chronic conditions..."
                        value={formData.medicalHistory}
                        onChange={handleChange}
                        rows={4}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-teal-400 focus:bg-white/10 transition-all text-white resize-none"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || success}
                    className="w-full py-3 mt-6 bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-bold tracking-wide rounded-xl shadow-lg active:scale-95 disabled:opacity-50 transition-all"
                >
                    {loading ? 'REGISTERING PATIENT...' : 'CREATE PATIENT RECORD'}
                </button>
            </form>

            <div className="mt-6 pt-4 border-t border-white/10 text-center">
                <button
                    onClick={() => router.back()}
                    className="text-xs text-white/50 hover:text-white transition-colors"
                >
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    );
}
