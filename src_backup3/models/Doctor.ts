import mongoose, { Schema, model, models } from 'mongoose';

const DoctorSchema = new Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  availability: [{ type: String }],
}, { timestamps: true });

export default models.Doctor || model('Doctor', DoctorSchema);
