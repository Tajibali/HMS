import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import Doctor from '@/models/Doctor';
import { mockDB } from '@/lib/mockDb';

let useMockDB = false;

// GET: Fetch all doctors
export async function GET() {
  try {
    if (useMockDB) {
      const doctors = mockDB.getAllDoctors();
      return NextResponse.json(doctors, { status: 200 });
    }

    await connectToDatabase();
    const doctors = await Doctor.find({}).sort({ createdAt: -1 });
    return NextResponse.json(doctors, { status: 200 });
  } catch (error: any) {
    console.error('Doctors GET error:', error?.message);
    useMockDB = true;
    const doctors = mockDB.getAllDoctors();
    return NextResponse.json(doctors, { status: 200 });
  }
}

// POST: Create a new doctor
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { name, specialization, email, availability } = body;

    // Validation
    if (!name || !specialization || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Email validation
    if (!email.endsWith('@hms.com') && !email.endsWith('@hospital.com')) {
      return NextResponse.json({ error: 'Doctor email must end with @hms.com or @hospital.com' }, { status: 400 });
    }

    if (useMockDB) {
      const existingDoctor = mockDB.getDoctorByEmail(email);
      if (existingDoctor) {
        return NextResponse.json({ error: 'Doctor with this email already exists' }, { status: 409 });
      }

      const newDoctor = mockDB.createDoctor({
        name,
        specialization,
        email,
        availability: availability || []
      });

      return NextResponse.json(newDoctor, { status: 201 });
    }

    try {
      await connectToDatabase();
      
      // Check if doctor already exists
      const existingDoctor = await Doctor.findOne({ email });
      if (existingDoctor) {
        return NextResponse.json({ error: 'Doctor with this email already exists' }, { status: 409 });
      }

      const newDoctor = await Doctor.create({
        name,
        specialization,
        email,
        availability: availability || []
      });

      return NextResponse.json(newDoctor, { status: 201 });
    } catch (mongoError: any) {
      console.log('MongoDB failed, switching to mock DB');
      useMockDB = true;
      
      const existingDoctor = mockDB.getDoctorByEmail(email);
      if (existingDoctor) {
        return NextResponse.json({ error: 'Doctor with this email already exists' }, { status: 409 });
      }

      const newDoctor = mockDB.createDoctor({
        name,
        specialization,
        email,
        availability: availability || []
      });

      return NextResponse.json(newDoctor, { status: 201 });
    }
  } catch (error: any) {
    console.error('Doctor creation error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create doctor' }, { status: 500 });
  }
}
