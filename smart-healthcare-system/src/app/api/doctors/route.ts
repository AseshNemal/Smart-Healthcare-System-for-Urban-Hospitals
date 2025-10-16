import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import { Doctor } from "../../../models";

export async function GET() {
  try {
    await dbConnect();
    
    // Check if we have doctors in the database, if not, seed with initial data
    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0) {
      const initialDoctors = [
        { name: "Dr. A. Perera", specialty: "Cardiologist" },
        { name: "Dr. S. Fernando", specialty: "Pediatrician" },
        { name: "Dr. K. De Silva", specialty: "Dermatologist" },
      ];
      await Doctor.insertMany(initialDoctors);
    }

    const doctors = await Doctor.find({}).select('_id name specialty');
    
    // Transform to match frontend expectations
    const doctorsWithId = doctors.map(doc => ({
      id: doc._id.toString(),
      name: doc.name,
      specialty: doc.specialty
    }));
    
    return NextResponse.json(doctorsWithId);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 });
  }
}
