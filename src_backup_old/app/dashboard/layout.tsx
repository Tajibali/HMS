'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState('blue');
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';

    const getThemeClass = () => {
        if (theme === 'purple') return 'from-slate-950 via-purple-950 to-slate-950';
        if (theme === 'emerald') return 'from-zinc-950 via-emerald-950 to-zinc-950';
        return 'from-slate-950 via-slate-900 to-cyan-950';
    };

    return (
        <div className={`min-h-screen text-slate-100 bg-gradient-to-tr ${getThemeClass()} transition-all duration-700 ease-in-out`}>
            {/* High-end Header Dashboard */}
            <header className="backdrop-blur-xl bg-black/30 border-b border-white/5 sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-2xl">
                <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-teal-400 animate-pulse"></span>
                    <h1 className="text-lg font-bold tracking-wider uppercase bg-gradient-to-r from-teal-200 via-white to-slate-400 bg-clip-text text-transparent">
                        HMS Core Engine
                    </h1>
                </div>

                {/* Dynamic Theme Switches */}
                <div className="flex items-center gap-6">
                    <div className="flex gap-2.5 bg-white/5 p-1.5 rounded-full border border-white/10 shadow-inner">
                        <button onClick={() => setTheme('blue')} className={`w-4 h-4 rounded-full bg-cyan-500 transition-transform ${theme === 'blue' ? 'scale-125 ring-2 ring-white' : 'opacity-60'}`} title="Ocean Theme" />
                        <button onClick={() => setTheme('purple')} className={`w-4 h-4 rounded-full bg-purple-500 transition-transform ${theme === 'purple' ? 'scale-125 ring-2 ring-white' : 'opacity-60'}`} title="Luxury Theme" />
                        <button onClick={() => setTheme('emerald')} className={`w-4 h-4 rounded-full bg-emerald-500 transition-transform ${theme === 'emerald' ? 'scale-125 ring-2 ring-white' : 'opacity-60'}`} title="Emerald Theme" />
                    </div>

                    <button onClick={() => signOut()} className="text-xs font-semibold px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 rounded-lg transition-all duration-300">
                        Terminate Session
                    </button>
                </div>
            </header>

            <div className="flex">
                {/* Persistent Side Navigation */}
                <aside className="w-72 min-h-[calc(100vh-73px)] bg-black/20 backdrop-blur-md border-r border-white/5 p-6 flex flex-col justify-between">
                    <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold px-3 mb-4">Navigation Base</p>
                        <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-sm font-medium transition-all group">
                            <span className="text-white/40 group-hover:text-white">📊</span> Dashboard Overview
                        </Link>
                        
                        {isAdmin ? (
                            <>
                                <Link href="/dashboard/appointments/new" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-sm font-medium text-teal-300 transition-all">
                                    <span>📅</span> Create Appointment
                                </Link>
                                <Link href="/dashboard/patients/new" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-sm font-medium text-purple-300 transition-all">
                                    <span>👤</span> Register Patient
                                </Link>
                                <Link href="/dashboard/doctors/new" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-sm font-medium text-emerald-300 transition-all">
                                    <span>🩺</span> Onboard Doctor
                                </Link>
                            </>
                        ) : (
                            <Link href="/dashboard/appointments" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-sm font-medium text-teal-300 transition-all">
                                <span>📋</span> View Appointments
                            </Link>
                        )}
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-white/50">
                        Role: <span className={`font-bold ${isAdmin ? 'text-amber-400' : 'text-blue-400'}`}>{isAdmin ? 'Administrator' : 'Staff'}</span>
                    </div>
                </aside>

                {/* Dynamic Dynamic Content Window */}
                <main className="flex-1 p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}