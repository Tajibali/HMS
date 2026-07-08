import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import Doctor from '@/models/Doctor';
import { mockDB } from '@/lib/mockDb';
import { Types } from 'mongoose';

let useMockDB = false;

// GET: Fetch a single doctor by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    if (useMockDB) {
      const doctor = mockDB.getDoctorById(params.id);
      if (!doctor) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
      return NextResponse.json(doctor, { status: 200 });
    }

    await connectToDatabase();

    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid doctor ID' }, { status: 400 });
    }

    const doctor = await Doctor.findById(params.id);
    if (!doctor) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });

    return NextResponse.json(doctor, { status: 200 });
  } catch (error: any) {
    console.error('Doctor GET error:', error);
    const doctor = mockDB.getDoctorById(params.id);
    if (!doctor) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    return NextResponse.json(doctor, { status: 200 });
  }
}

// PUT: Update a doctor (Admin Only)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { name, specialization, email, availability } = body;

    if (!name || !specialization || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!email.endsWith('@hms.com') && !email.endsWith('@hospital.com')) {
      return NextResponse.json({ error: 'Doctor email must end with @hms.com or @hospital.com' }, { status: 400 });
    }

    const updateData = { name, specialization, email, availability: availability || [] };

    if (useMockDB) {
      const updated = mockDB.updateDoctor(params.id, updateData);
      if (!updated) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
      return NextResponse.json(updated, { status: 200 });
    }

    try {
      await connectToDatabase();

      if (!Types.ObjectId.isValid(params.id)) {
        return NextResponse.json({ error: 'Invalid doctor ID' }, { status: 400 });
      }

      const updated = await Doctor.findByIdAndUpdate(params.id, { $set: updateData }, { new: true, runValidators: true });
      if (!updated) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });

      return NextResponse.json(updated, { status: 200 });
    } catch (mongoError: any) {
      console.log('MongoDB failed, switching to mock DB');
      useMockDB = true;
      const updated = mockDB.updateDoctor(params.id, updateData);
      if (!updated) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
      return NextResponse.json(updated, { status: 200 });
    }
  } catch (error: any) {
    console.error('Doctor update error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update doctor' }, { status: 500 });
  }
}

// DELETE: Remove a doctor (Admin Only)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (useMockDB) {
      const deleted = mockDB.deleteDoctor(params.id);
      if (!deleted) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
      return NextResponse.json({ success: true, message: 'Doctor deleted successfully' }, { status: 200 });
    }

    try {
      await connectToDatabase();

      if (!Types.ObjectId.isValid(params.id)) {
        return NextResponse.json({ error: 'Invalid doctor ID' }, { status: 400 });
      }

      const deleted = await Doctor.findByIdAndDelete(params.id);
      if (!deleted) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });

      return NextResponse.json({ success: true, message: 'Doctor deleted successfully' }, { status: 200 });
    } catch (mongoError: any) {
      console.log('MongoDB failed, switching to mock DB');
      useMockDB = true;
      const deleted = mockDB.deleteDoctor(params.id);
      if (!deleted) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
      return NextResponse.json({ success: true, message: 'Doctor deleted successfully' }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Doctor delete error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete doctor' }, { status: 500 });
  }
}
