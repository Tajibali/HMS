import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/db';
import Appointment from '@/models/Appointment';
import { Types } from 'mongoose';

// GET: Fetch specific appointment
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 });
    }

    const appointment = await Appointment.findById(params.id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name specialization');

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json(appointment, { status: 200 });
  } catch (error: any) {
    console.error('Appointment GET error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch appointment' }, { status: 500 });
  }
}

// PUT: Update appointment schema details
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 });
    }

    const body = await req.json();

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true }
    );

    if (!updatedAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json(updatedAppointment, { status: 200 });
  } catch (error: any) {
    console.error('Appointment update error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update appointment' }, { status: 500 });
  }
}

// DELETE: Restricted Route (Admin Only) destruct mutation
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Explicit Admin authorization interceptor
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Privileged access identity required' }, { status: 403 });
    }

    await connectToDatabase();
    
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 });
    }

    const deletedAppointment = await Appointment.findByIdAndDelete(params.id);
    
    if (!deletedAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Entity purged successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Appointment delete error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete appointment' }, { status: 500 });
  }
}