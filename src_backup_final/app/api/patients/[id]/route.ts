import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import Patient from '@/models/Patient';
import { mockDB } from '@/lib/mockDb';
import { Types } from 'mongoose';

let useMockDB = false;

// GET: Fetch a single patient by ID
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    if (useMockDB) {
      const patient = mockDB.getPatientById(id);
      if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      return NextResponse.json(patient, { status: 200 });
    }

    await connectToDatabase();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid patient ID' }, { status: 400 });
    }

    const patient = await Patient.findById(id);
    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

    return NextResponse.json(patient, { status: 200 });
  } catch (error: any) {
    console.error('Patient GET error:', error);
    const patient = mockDB.getPatientById(id);
    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    return NextResponse.json(patient, { status: 200 });
  }
}

// PUT: Update a patient (Admin Only)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, phone, dateOfBirth, bloodGroup, medicalHistory, address } = body;

    if (!name || !email || !phone || !dateOfBirth || !bloodGroup) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updateData = {
      name,
      email,
      phone,
      dateOfBirth: new Date(dateOfBirth),
      bloodGroup,
      medicalHistory: medicalHistory || '',
      address: address || '',
    };

    if (useMockDB) {
      const updated = mockDB.updatePatient(id, updateData);
      if (!updated) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      return NextResponse.json(updated, { status: 200 });
    }

    try {
      await connectToDatabase();

      if (!Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid patient ID' }, { status: 400 });
      }

      const updated = await Patient.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
      if (!updated) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

      return NextResponse.json(updated, { status: 200 });
    } catch (mongoError: any) {
      console.log('MongoDB failed, switching to mock DB');
      useMockDB = true;
      const updated = mockDB.updatePatient(id, updateData);
      if (!updated) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      return NextResponse.json(updated, { status: 200 });
    }
  } catch (error: any) {
    console.error('Patient update error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update patient' }, { status: 500 });
  }
}

// DELETE: Remove a patient (Admin Only)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (useMockDB) {
      const deleted = mockDB.deletePatient(id);
      if (!deleted) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      return NextResponse.json({ success: true, message: 'Patient deleted successfully' }, { status: 200 });
    }

    try {
      await connectToDatabase();

      if (!Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid patient ID' }, { status: 400 });
      }

      const deleted = await Patient.findByIdAndDelete(id);
      if (!deleted) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

      return NextResponse.json({ success: true, message: 'Patient deleted successfully' }, { status: 200 });
    } catch (mongoError: any) {
      console.log('MongoDB failed, switching to mock DB');
      useMockDB = true;
      const deleted = mockDB.deletePatient(id);
      if (!deleted) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      return NextResponse.json({ success: true, message: 'Patient deleted successfully' }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Patient delete error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete patient' }, { status: 500 });
  }
}
