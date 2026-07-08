'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalDoctors: 0,
        totalAppointments: 0,
        todayAppointments: 0,
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        // Fetch statistics from API
        const fetchStats = async () => {
            try {
                const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
                    fetch('/api/patients'),
                    fetch('/api/doctors'),
                    fetch('/api/appointments'),
                ]);

                let patients = [];
                let doctors = [];
                let appointments = [];

                if (patientsRes.ok) patients = await patientsRes.json();
                if (doctorsRes.ok) doctors = await doctorsRes.json();
                if (appointmentsRes.ok) appointments = await appointmentsRes.json();

                // Calculate today's appointments
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                const todayAppointments = appointments.filter((apt: any) => {
                    const aptDate = new Date(apt.date);
                    aptDate.setHours(0, 0, 0, 0);
                    return aptDate.getTime() === today.getTime();
                }).length;

                setStats({
                    totalPatients: patients.length,
                    totalDoctors: doctors.length,
                    totalAppointments: appointments.length,
                    todayAppointments: todayAppointments,
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };

        fetchStats();
    }, []);

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-teal-400/20 border-t-teal-400 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <main className="flex-1 p-8 space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-blue-500/10 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h2 className="text-2xl font-black text-white mb-2">Welcome Back, {session?.user?.name || 'User'}</h2>
                <p className="text-sm text-white/60">
                    {session?.user?.role === 'admin' 
                        ? '🔐 Administrator Access Enabled - Full System Control'
                        : '👤 Staff Access - Limited Permissions Active'}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon="👥"
                    label="Total Patients"
                    value={stats.totalPatients}
                    color="from-blue-600 to-blue-800"
                />
                <StatCard
                    icon="👨‍⚕️"
                    label="Total Doctors"
                    value={stats.totalDoctors}
                    color="from-purple-600 to-purple-800"
                />
                <StatCard
                    icon="📅"
                    label="Total Appointments"
                    value={stats.totalAppointments}
                    color="from-teal-600 to-cyan-800"
                />
                <StatCard
                    icon="📍"
                    label="Today's Appointments"
                    value={stats.todayAppointments}
                    color="from-orange-600 to-red-800"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <QuickActionButton href="/dashboard/appointments/new" icon="📅" label="Book New Appointment" />
                    {session?.user?.role === 'admin' && (
                        <>
                            <QuickActionButton href="/dashboard/patients/new" icon="➕" label="Add New Patient" />
                            <QuickActionButton href="/dashboard/doctors/new" icon="➕" label="Add New Doctor" />
                        </>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    <ActivityItem timestamp="2 hours ago" action="Appointment booked" detail="Patient: John Doe" />
                    <ActivityItem timestamp="5 hours ago" action="Doctor added" detail="Dr. Sarah Johnson" />
                    <ActivityItem timestamp="1 day ago" action="Patient registered" detail="New patient from Mumbai" />
                </div>
            </div>
        </main>
    );
}

interface StatCardProps {
    icon: string;
    label: string;
    value: number;
    color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
    return (
        <div className={`bg-gradient-to-br ${color} bg-opacity-20 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:border-white/20 transition-all`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-white/60 text-sm font-medium">{label}</p>
                    <p className="text-3xl font-black text-white mt-2">{value}</p>
                </div>
                <span className="text-4xl">{icon}</span>
            </div>
        </div>
    );
}

interface QuickActionButtonProps {
    href: string;
    icon: string;
    label: string;
}

function QuickActionButton({ href, icon, label }: QuickActionButtonProps) {
    return (
        <a
            href={href}
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-400/50 rounded-xl transition-all group"
        >
            <span className="text-2xl group-hover:scale-125 transition-transform">{icon}</span>
            <span className="font-semibold text-white/80 group-hover:text-white">{label}</span>
        </a>
    );
}

interface ActivityItemProps {
    timestamp: string;
    action: string;
    detail: string;
}

function ActivityItem({ timestamp, action, detail }: ActivityItemProps) {
    return (
        <div className="flex justify-between items-start p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5">
            <div>
                <p className="text-white font-medium text-sm">{action}</p>
                <p className="text-white/50 text-xs mt-1">{detail}</p>
            </div>
            <span className="text-white/40 text-xs whitespace-nowrap ml-4">{timestamp}</span>
        </div>
    );
}
