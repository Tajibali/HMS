import mongoose, { Schema, model, models } from 'mongoose';

const PatientSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  bloodGroup: { type: String, required: true },
  medicalHistory: { type: String, default: '' },
  address: { type: String, default: '' },
}, { timestamps: true });

export default models.Patient || model('Patient', PatientSchema);
