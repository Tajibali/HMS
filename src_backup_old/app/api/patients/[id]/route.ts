// src/app/api/patients/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import Patient from '@/models/Patient';
import { mockDB } from '@/lib/mockDb';

let useMockDB = false;

// GET: Fetch single patient by id
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (useMockDB) {
      const patient = mockDB.getPatientById(id);
      if (!patient) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }
      return NextResponse.json(patient, { status: 200 });
    }

    await connectToDatabase();
    const patient = await Patient.findById(id);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }
    return NextResponse.json(patient, { status: 200 });
  } catch (error: any) {
    console.error('Patient GET by id error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch patient' }, { status: 500 });
  }
}

// PUT: Update a patient
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
    const { name, email, phone, dateOfBirth, bloodGroup, medicalHistory, address } = body;

    const updateData: any = {
      name,
      email,
      phone,
      bloodGroup,
      medicalHistory,
      address
    };
    if (dateOfBirth) {
      updateData.dateOfBirth = new Date(dateOfBirth);
    }

    if (useMockDB) {
      const updatedPatient = mockDB.updatePatient(id, updateData);

      if (!updatedPatient) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }

      return NextResponse.json(updatedPatient, { status: 200 });
    }

    try {
      await connectToDatabase();

      const updatedPatient = await Patient.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedPatient) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }

      return NextResponse.json(updatedPatient, { status: 200 });
    } catch (mongoError: any) {
      console.log('MongoDB failed, switching to mock DB');
      useMockDB = true;

      const updatedPatient = mockDB.updatePatient(id, updateData);

      if (!updatedPatient) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }

      return NextResponse.json(updatedPatient, { status: 200 });
    }
  } catch (error: any) {
    console.error('Patient update error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update patient' }, { status: 500 });
  }
}

// DELETE: Remove a patient
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
      const deleted = mockDB.deletePatient(id);
      if (!deleted) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Patient deleted successfully' }, { status: 200 });
    }

    try {
      await connectToDatabase();

      const deletedPatient = await Patient.findByIdAndDelete(id);
      if (!deletedPatient) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Patient deleted successfully' }, { status: 200 });
    } catch (mongoError: any) {
      console.log('MongoDB failed, switching to mock DB');
      useMockDB = true;

      const deleted = mockDB.deletePatient(id);
      if (!deleted) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Patient deleted successfully' }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Patient delete error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete patient' }, { status: 500 });
  }
}