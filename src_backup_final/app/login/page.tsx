'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SubmitButton from '@/components/SubmitButton';

export default function SecurityGate() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const runAuthorization = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg('');
        setLoading(true);

        // Explicit NextAuth authorization pipeline execution
        const result = await signIn('credentials', {
            username: username.trim(),
            password: password.trim(),
            redirect: false,
        });

        setLoading(false);

        if (result?.ok) {
            router.push('/dashboard');
            router.refresh(); // Live session propagation inside client state
        } else {
            setMsg('❌ Access Denied: Invalid credentials pattern matching.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-2xl">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-white tracking-wider">SECURE LINK LOG IN</h2>
                    <p className="text-xs text-white/40 mt-1">Role-Based Access Control Node Gateway</p>
                </div>

                {msg && (
                    <p className="mb-4 text-xs text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl text-center animate-shake">
                        {msg}
                    </p>
                )}

                <form onSubmit={runAuthorization} className="space-y-4 text-sm text-white">
                    <div>
                        <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Identity Vector / Email</label>
                        <input
                            type="text"
                            placeholder="e.g., admin or staff"
                            required
                            value={username}
                            className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-teal-400 focus:bg-white/10 transition-all text-white"
                            onChange={e => setUsername(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">System Credentials Token</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            required
                            value={password}
                            className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-teal-400 focus:bg-white/10 transition-all text-white"
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    <SubmitButton
                        isLoading={loading}
                        isError={!!msg}
                        text="VERIFY CAPABILITIES"
                        loadingText="AUTHENTICATING..."
                        errorText="ACCESS DENIED"
                        size="lg"
                        className="w-full mt-2"
                    />
                </form>

                <div className="mt-6 pt-4 border-t border-white/5 text-center text-[11px] text-white/30 space-y-1">
                    <p>Demo Admin: <span className="text-teal-400/70 font-mono">admin</span> / <span className="text-teal-400/70 font-mono">admin123</span></p>
                    <p>Demo Staff: <span className="text-purple-400/70 font-mono">staff</span> / <span className="text-purple-400/70 font-mono">staff123</span></p>
                </div>
            </div>
        </div>
    );
}