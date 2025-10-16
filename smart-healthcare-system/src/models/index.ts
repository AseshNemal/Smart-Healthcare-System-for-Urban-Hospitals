import mongoose from 'mongoose';

const DoctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  specialty: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows null values to be non-unique
  },
  userId: {
    type: String, // Firebase UID
    unique: true,
    sparse: true,
  },
}, {
  timestamps: true,
});

const AppointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  patientEmail: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

const PatientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

export const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);
export const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
export const Patient = mongoose.models.Patient || mongoose.model('Patient', PatientSchema);