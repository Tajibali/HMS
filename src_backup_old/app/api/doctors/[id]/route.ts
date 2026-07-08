// src/app/api/doctors/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import Doctor from '@/models/Doctor';
import { mockDB } from '@/lib/mockDb';

let useMockDB = false;

// PUT: Update a doctor
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { name, specialization, email, availability } = body;

    if (useMockDB) {
      const updatedDoctor = mockDB.updateDoctor(id, {
        name,
        specialization,
        email,
        availability
      });

      if (!updatedDoctor) {
        return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
      }

      return NextResponse.json(updatedDoctor, { status: 200 });
    }

    try {
      await connectToDatabase();

      const updatedDoctor = await Doctor.findByIdAndUpdate(
        id,
        { name, specialization, email, availability },
        { new: true, runValidators: true }
      );

      if (!updatedDoctor) {
        return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
      }

      return NextResponse.json(updatedDoctor, { status: 200 });
    } catch (mongoError: any) {
      console.log('MongoDB failed, switching to mock DB');
      useMockDB = true;

      const updatedDoctor = mockDB.updateDoctor(id, {
        name,
        specialization,
        email,
        availability
      });

      if (!updatedDoctor) {
        return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
      }

      return NextResponse.json(updatedDoctor, { status: 200 });
    }
  } catch (error: any) {
    console.error('Doctor update error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update doctor' }, { status: 500 });
  }
}

// DELETE: Remove a doctor
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = params;

    if (useMockDB) {
      const deleted = mockDB.deleteDoctor(id);
      if (!deleted) {
        return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Doctor deleted successfully' }, { status: 200 });
    }

    try {
      await connectToDatabase();

      const deletedDoctor = await Doctor.findByIdAndDelete(id);
      if (!deletedDoctor) {
        return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Doctor deleted successfully' }, { status: 200 });
    } catch (mongoError: any) {
      console.log('MongoDB failed, switching to mock DB');
      useMockDB = true;

      const deleted = mockDB.deleteDoctor(id);
      if (!deleted) {
        return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Doctor deleted successfully' }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Doctor delete error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete doctor' }, { status: 500 });
  }
}

// GET: Fetch single doctor by id (optional, but useful)
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (useMockDB) {
      const doctor = mockDB.getDoctorById(id);
      if (!doctor) {
        return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
      }
      return NextResponse.json(doctor, { status: 200 });
    }

    await connectToDatabase();
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }
    return NextResponse.json(doctor, { status: 200 });
  } catch (error: any) {
    console.error('Doctor GET by id error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch doctor' }, { status: 500 });
  }
}