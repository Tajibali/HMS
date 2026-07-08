import mongoose, { Schema, model, models } from 'mongoose';

const AppointmentSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: Date, required: true },
  status: { type: String, required: true, enum: ['Pending', 'Confirmed'], default: 'Pending' }
}, { timestamps: true });

export default models.Appointment || model('Appointment', AppointmentSchema);