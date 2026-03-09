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

// Load environment variables from .env manually (no dotenv dependency needed)
const envPath = resolve(__dirname, '../.env');
const envContent = readFileSync(envPath, 'utf8');

const DEFAULT_TEST_PATIENT_NAME = 'Test Patient';

function readEnvVar(content, key) {
  const line = content.split('\n').find(l => l.startsWith(`${key}=`));
  return line ? line.split('=').slice(1).join('=').trim() : undefined;
}

const MONGODB_URI = process.env.MONGODB_URI || readEnvVar(envContent, 'MONGODB_URI');
if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in .env');
  process.exit(1);
}

const TEST_PATIENT_EMAIL = process.env.TEST_PATIENT_EMAIL || readEnvVar(envContent, 'TEST_PATIENT_EMAIL');
const TEST_PATIENT_NAME  = process.env.TEST_PATIENT_NAME  || readEnvVar(envContent, 'TEST_PATIENT_NAME') || DEFAULT_TEST_PATIENT_NAME;

if (!TEST_PATIENT_EMAIL) {
  console.error('TEST_PATIENT_EMAIL not found. Set it in .env or as an environment variable.');
  process.exit(1);
}

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

  const email = TEST_PATIENT_EMAIL;
  const name  = TEST_PATIENT_NAME;
  const existing = await Patient.findOne({ email });

  if (existing) {
    console.log(`Patient ${email} already exists — no action needed.`);
  } else {
    await Patient.create({
      name:        name,
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
