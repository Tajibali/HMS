// In-memory mock database for development when MongoDB is not available
import { Types } from 'mongoose';

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  bloodGroup: string;
  medicalHistory: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  email: string;
  availability: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Appointment {
  _id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

class MockDB {
  private patients: Map<string, Patient> = new Map();
  private doctors: Map<string, Doctor> = new Map();
  private appointments: Map<string, Appointment> = new Map();

  // Patient methods
  createPatient(data: Omit<Patient, '_id' | 'createdAt' | 'updatedAt'>): Patient {
    const id = new Types.ObjectId().toString();
    const patient: Patient = {
      ...data,
      _id: id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.patients.set(id, patient);
    return patient;
  }

  getPatientByEmail(email: string): Patient | undefined {
    return Array.from(this.patients.values()).find(p => p.email === email);
  }

  getAllPatients(): Patient[] {
    return Array.from(this.patients.values()).sort((a, b) =>
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  getPatientById(id: string): Patient | undefined {
    return this.patients.get(id);
  }

  updatePatient(id: string, data: Partial<Patient>): Patient | null {
    const existing = this.patients.get(id);
    if (!existing) return null;

    const updated: Patient = {
      ...existing,
      ...data,
      _id: existing._id,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };
    this.patients.set(id, updated);
    return updated;
  }

  deletePatient(id: string): boolean {
    return this.patients.delete(id);
  }

  // Doctor methods
  createDoctor(data: Omit<Doctor, '_id' | 'createdAt' | 'updatedAt'>): Doctor {
    const id = new Types.ObjectId().toString();
    const doctor: Doctor = {
      ...data,
      _id: id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.doctors.set(id, doctor);
    return doctor;
  }

  getDoctorByEmail(email: string): Doctor | undefined {
    return Array.from(this.doctors.values()).find(d => d.email === email);
  }

  getAllDoctors(): Doctor[] {
    return Array.from(this.doctors.values()).sort((a, b) =>
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  getDoctorById(id: string): Doctor | undefined {
    return this.doctors.get(id);
  }

  updateDoctor(id: string, data: Partial<Doctor>): Doctor | null {
    const existing = this.doctors.get(id);
    if (!existing) return null;

    const updated: Doctor = {
      ...existing,
      ...data,
      _id: existing._id,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };
    this.doctors.set(id, updated);
    return updated;
  }

  deleteDoctor(id: string): boolean {
    return this.doctors.delete(id);
  }

  // Appointment methods
  createAppointment(data: Omit<Appointment, '_id' | 'createdAt' | 'updatedAt'>): Appointment {
    const id = new Types.ObjectId().toString();
    const appointment: Appointment = {
      ...data,
      _id: id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  getAllAppointments(): Appointment[] {
    return Array.from(this.appointments.values()).sort((a, b) =>
      b.date.getTime() - a.date.getTime()
    );
  }

  getAppointmentById(id: string): Appointment | undefined {
    return this.appointments.get(id);
  }

  updateAppointment(id: string, data: Partial<Appointment>): Appointment | null {
    const existing = this.appointments.get(id);
    if (!existing) return null;

    const updated: Appointment = {
      ...existing,
      ...data,
      _id: existing._id,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };
    this.appointments.set(id, updated);
    return updated;
  }

  deleteAppointment(id: string): boolean {
    return this.appointments.delete(id);
  }
}

export const mockDB = new MockDB();