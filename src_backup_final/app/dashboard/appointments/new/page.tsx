'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SubmitButton from '@/components/SubmitButton';

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  email: string;
}

export default function AppointmentBookingForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<'appointment' | 'patient' | 'doctor'>('appointment');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Patients state
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    bloodGroup: 'O+',
    medicalHistory: '',
    address: '',
  });

  // Doctors state
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialization: 'General Medicine',
    email: '',
    availability: ['Monday', 'Wednesday', 'Friday'] as string[],
  });

  // Appointment state
  const [appointment, setAppointment] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    status: 'Pending',
  });

  // Fetch patients and doctors on load
  useEffect(() => {
    fetchData();
  }, []);

  // Check if user is admin
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  const fetchData = async () => {
    try {
      const [pRes, dRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/doctors')
      ]);
      
      if (pRes.ok) {
        const pData = await pRes.json();
        setPatients(Array.isArray(pData) ? pData : []);
      }
      if (dRes.ok) {
        const dData = await dRes.json();
        setDoctors(Array.isArray(dData) ? dData : []);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  // Add new patient
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatient),
      });

      if (res.ok) {
        const patient = await res.json();
        setPatients([...patients, patient]);
        setSelectedPatient(patient._id);
        setSuccess('✅ Patient added successfully!');
        setNewPatient({
          name: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          bloodGroup: 'O+',
          medicalHistory: '',
          address: '',
        });
        // Refresh patient list
        await fetchData();
        setTimeout(() => setTab('appointment'), 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add patient');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add new doctor
  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoctor),
      });

      if (res.ok) {
        const doctor = await res.json();
        setDoctors([...doctors, doctor]);
        setSelectedDoctor(doctor._id);
        setSuccess('✅ Doctor added successfully!');
        setNewDoctor({
          name: '',
          specialization: 'General Medicine',
          email: '',
          availability: ['Monday', 'Wednesday', 'Friday'],
        });
        // Refresh doctor list
        await fetchData();
        setTimeout(() => setTab('appointment'), 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add doctor');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create appointment
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const patientId = selectedPatient || newPatient.name;
    const doctorId = selectedDoctor || newDoctor.name;

    if (!patientId || !doctorId || !appointment.date) {
      setError('❌ Please select/add patient, doctor, and date');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          doctorId,
          date: appointment.date,
          status: appointment.status,
        }),
      });

      if (res.ok) {
        setSuccess('✅ Appointment booked successfully!');
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create appointment');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      <div className="max-w-xl mx-auto bg-rose-500/10 border border-rose-500/20 p-8 rounded-3xl backdrop-blur-2xl">
        <h2 className="text-2xl font-black text-rose-300">Access Denied</h2>
        <p className="text-sm text-white/60 mt-3">Only administrators can manage appointments.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setTab('patient')}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            tab === 'patient'
              ? 'bg-purple-500 text-white'
              : 'bg-white/5 border border-white/10 text-white/60 hover:border-white/20'
          }`}
        >
          👤 Add Patient
        </button>
        <button
          onClick={() => setTab('doctor')}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            tab === 'doctor'
              ? 'bg-emerald-500 text-white'
              : 'bg-white/5 border border-white/10 text-white/60 hover:border-white/20'
          }`}
        >
          🩺 Add Doctor
        </button>
        <button
          onClick={() => setTab('appointment')}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            tab === 'appointment'
              ? 'bg-teal-500 text-white'
              : 'bg-white/5 border border-white/10 text-white/60 hover:border-white/20'
          }`}
        >
          📅 Book Appointment
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-sm">
          {success}
        </div>
      )}

      {/* Add Patient Tab */}
      {tab === 'patient' && (
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md">
          <h2 className="text-2xl font-bold mb-6 text-white">Register New Patient</h2>
          <form onSubmit={handleAddPatient} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2 uppercase">Name</label>
              <input
                type="text"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-400 outline-none"
                placeholder="Full name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase">Email</label>
                <input
                  type="email"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-400 outline-none"
                  placeholder="patient@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase">Phone</label>
                <input
                  type="tel"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-400 outline-none"
                  placeholder="+92-300-1234567"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase">DOB</label>
                <input
                  type="date"
                  value={newPatient.dateOfBirth}
                  onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-400 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase">Blood Group</label>
                <select
                  value={newPatient.bloodGroup}
                  onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-400 outline-none"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                    <option key={bg} value={bg} className="bg-slate-900">{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2 uppercase">Address</label>
              <input
                type="text"
                value={newPatient.address}
                onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-400 outline-none"
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2 uppercase">Medical History</label>
              <textarea
                value={newPatient.medicalHistory}
                onChange={(e) => setNewPatient({ ...newPatient, medicalHistory: e.target.value })}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-400 outline-none resize-none"
                placeholder="Any allergies or conditions..."
                rows={3}
              />
            </div>

            <SubmitButton
              isLoading={loading}
              isSuccess={!!success}
              isError={!!error}
              text="Add Patient"
              loadingText="Adding Patient..."
              successText="Patient Added!"
              errorText="Failed to Add"
              className="w-full mt-6"
              size="lg"
            />
          </form>
        </div>
      )}

      {/* Add Doctor Tab */}
      {tab === 'doctor' && (
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md">
          <h2 className="text-2xl font-bold mb-6 text-white">Register New Doctor</h2>
          <form onSubmit={handleAddDoctor} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2 uppercase">Name</label>
              <input
                type="text"
                value={newDoctor.name}
                onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-emerald-400 outline-none"
                placeholder="Dr. Name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase">Specialization</label>
                <select
                  value={newDoctor.specialization}
                  onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-emerald-400 outline-none"
                >
                  {['General Medicine', 'Cardiology', 'Pediatrics', 'Surgery', 'Dermatology', 'Neurology'].map(spec => (
                    <option key={spec} value={spec} className="bg-slate-900">{spec}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase">Email (HMS)</label>
                <input
                  type="email"
                  value={newDoctor.email}
                  onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-emerald-400 outline-none"
                  placeholder="dr.name@hms.com"
                  required
                />
              </div>
            </div>

            <SubmitButton
              isLoading={loading}
              isSuccess={!!success}
              isError={!!error}
              text="Add Doctor"
              loadingText="Adding Doctor..."
              successText="Doctor Added!"
              errorText="Failed to Add"
              className="w-full mt-6"
              size="lg"
            />
          </form>
        </div>
      )}

      {/* Book Appointment Tab */}
      {tab === 'appointment' && (
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md">
          <h2 className="text-2xl font-bold mb-6 text-white">Book Appointment</h2>
          <form onSubmit={handleCreateAppointment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2 uppercase">Select Patient</label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-teal-400 outline-none"
              >
                <option value="">Choose a patient...</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id} className="bg-slate-900">
                    {p.name} ({p.email})
                  </option>
                ))}
              </select>
              {patients.length === 0 && <p className="text-xs text-white/40 mt-1">No patients yet. Add one first.</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2 uppercase">Select Doctor</label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-teal-400 outline-none"
              >
                <option value="">Choose a doctor...</option>
                {doctors.map(d => (
                  <option key={d._id} value={d._id} className="bg-slate-900">
                    {d.name} - {d.specialization}
                  </option>
                ))}
              </select>
              {doctors.length === 0 && <p className="text-xs text-white/40 mt-1">No doctors yet. Add one first.</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2 uppercase">Appointment Date & Time</label>
              <input
                type="datetime-local"
                value={appointment.date}
                onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-teal-400 outline-none"
                required
              />
            </div>

            <SubmitButton
              isLoading={loading}
              isSuccess={!!success}
              isError={!!error}
              disabled={!selectedPatient || !selectedDoctor}
              text="Book Appointment"
              loadingText="Booking..."
              successText="Appointment Booked!"
              errorText="Booking Failed"
              className="w-full mt-6"
              size="lg"
            />
          </form>
        </div>
      )}
    </div>
  );
}