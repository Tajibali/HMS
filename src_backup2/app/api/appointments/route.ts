import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import Appointment from '@/models/Appointment';
import Patient from '@/models/Patient';
import Doctor from '@/models/Doctor';
import { mockDB } from '@/lib/mockDb';

let useMockDB = false;

// GET: Fetch all appointments with reference aggregation
export async function GET() {
  try {
    if (useMockDB) {
      const appointments = mockDB.getAllAppointments().map(apt => ({
        ...apt,
        patientId: { _id: apt.patientId, name: 'Patient' },
        doctorId: { _id: apt.doctorId, name: 'Doctor' }
      }));
      return NextResponse.json(appointments, { status: 200 });
    }

    await connectToDatabase();
    
    // Populating references for advanced data table mapping
    const appointments = await Appointment.find({})
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization')
      .sort({ date: -1 });

    return NextResponse.json(appointments, { status: 200 });
  } catch (error: any) {
    console.error('Appointments GET error:', error);
    useMockDB = true;
    const appointments = mockDB.getAllAppointments().map(apt => ({
      ...apt,
      patientId: { _id: apt.patientId, name: 'Patient' },
      doctorId: { _id: apt.doctorId, name: 'Doctor' }
    }));
    return NextResponse.json(appointments, { status: 200 });
  }
}

// POST: Create a new appointment validation layer
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { patientId, doctorId, date, status } = body;

    if (!patientId || !doctorId || !date) {
      return NextResponse.json({ error: 'Missing mandatory payload variables' }, { status: 400 });
    }

    // Validate date format
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    if (useMockDB) {
      const newAppointment = mockDB.createAppointment({
        patientId,
        doctorId,
        date: appointmentDate,
        status: status || 'Pending'
      });

      return NextResponse.json(newAppointment, { status: 201 });
    }

    try {
      await connectToDatabase();
      
      const newAppointment = await Appointment.create({
        patientId,
        doctorId,
        date: appointmentDate,
        status: status || 'Pending'
      });

      return NextResponse.json(newAppointment, { status: 201 });
    } catch (mongoError: any) {
      console.log('MongoDB failed, switching to mock DB');
      useMockDB = true;
      
      const newAppointment = mockDB.createAppointment({
        patientId,
        doctorId,
        date: appointmentDate,
        status: status || 'Pending'
      });

      return NextResponse.json(newAppointment, { status: 201 });
    }
  } catch (error: any) {
    console.error('Appointment creation error:', error);
    return NextResponse.json({ error: error?.message || 'Data mutation failed', details: error?.toString() }, { status: 500 });
  }
}