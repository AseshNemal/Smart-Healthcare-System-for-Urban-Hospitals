/**
 * seed-test-patient.mjs
 * Creates the Playwright test patient in MongoDB if they don't already exist.
 * Run once before executing Playwright tests:
 *   node tests/seed-test-patient.mjs
 */

import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load MONGODB_URI from .env manually (no dotenv dependency needed)
const envPath = resolve(__dirname, '../.env');
const envContent = readFileSync(envPath, 'utf8');
const mongoLine = envContent.split('\n').find(l => l.startsWith('MONGODB_URI='));
if (!mongoLine) {
  console.error('MONGODB_URI not found in .env');
  process.exit(1);
}
const MONGODB_URI = mongoLine.split('=').slice(1).join('=').trim();

const PatientSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  email:       { type: String, required: true, unique: true },
  phone:       { type: String, required: true },
  dateOfBirth: { type: Date,   required: true },
  bloodGroup:  { type: String },
  gender:      { type: String },
}, { timestamps: true });

const Patient = mongoose.models.Patient || mongoose.model('Patient', PatientSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log('Connected to MongoDB');

  const email = 'adrielperera321@gmail.com';
  const existing = await Patient.findOne({ email });

  if (existing) {
    console.log(`Patient ${email} already exists — no action needed.`);
  } else {
    await Patient.create({
      name:        'Adriel Perera',
      email,
      phone:       '+60100000000',
      dateOfBirth: new Date('1998-01-01'),
      bloodGroup:  'O+',
      gender:      'Male',
    });
    console.log(`Patient ${email} created successfully.`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
