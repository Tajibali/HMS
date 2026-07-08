import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import Patient from '@/models/Patient';
import { mockDB } from '@/lib/mockDb';

let useMockDB = false;

// GET: Fetch all patients
export async function GET() {
  try {
    if (useMockDB) {
      const patients = mockDB.getAllPatients();
      return NextResponse.json(patients, { status: 200 });
    }

    await connectToDatabase();
    const patients = await Patient.find({}).sort({ createdAt: -1 });
    return NextResponse.json(patients, { status: 200 });
  } catch (error: any) {
    console.error('Patients GET error:', error?.message);
    useMockDB = true;
    const patients = mockDB.getAllPatients();
    return NextResponse.json(patients, { status: 200 });
  }
}

// POST: Create a new patient
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, phone, dateOfBirth, bloodGroup, medicalHistory, address } = body;

    // Validation
    if (!name || !email || !phone || !dateOfBirth || !bloodGroup) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (useMockDB) {
      // Check with mock DB
      const existingPatient = mockDB.getPatientByEmail(email);
      if (existingPatient) {
        return NextResponse.json({ error: 'Patient with this email already exists' }, { status: 409 });
      }

      const newPatient = mockDB.createPatient({
        name,
        email,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        bloodGroup,
        medicalHistory: medicalHistory || '',
        address: address || '',
      });

      return NextResponse.json(newPatient, { status: 201 });
    }

    try {
      await connectToDatabase();
      
      // Check if patient already exists
      const existingPatient = await Patient.findOne({ email });
      if (existingPatient) {
        return NextResponse.json({ error: 'Patient with this email already exists' }, { status: 409 });
      }

      const newPatient = await Patient.create({
        name,
        email,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        bloodGroup,
        medicalHistory: medicalHistory || '',
        address: address || ''
      });

      return NextResponse.json(newPatient, { status: 201 });
    } catch (mongoError: any) {
      console.log('MongoDB failed, switching to mock DB');
      useMockDB = true;
      
      const existingPatient = mockDB.getPatientByEmail(email);
      if (existingPatient) {
        return NextResponse.json({ error: 'Patient with this email already exists' }, { status: 409 });
      }

      const newPatient = mockDB.createPatient({
        name,
        email,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        bloodGroup,
        medicalHistory: medicalHistory || '',
        address: address || '',
      });

      return NextResponse.json(newPatient, { status: 201 });
    }
  } catch (error: any) {
    console.error('Patient creation error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create patient' }, { status: 500 });
  }
}
