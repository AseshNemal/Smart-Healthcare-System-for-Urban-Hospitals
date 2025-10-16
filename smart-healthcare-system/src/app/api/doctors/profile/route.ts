import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import { Doctor } from "../../../../models";

// GET doctor profile by email
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }
    
    const doctor = await Doctor.findOne({ email }).select('_id name email specialty');
    
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }
    
    return NextResponse.json({
      id: doctor._id.toString(),
      name: doctor.name,
      email: doctor.email,
      specialty: doctor.specialty,
    });
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    return NextResponse.json({ error: 'Failed to fetch doctor profile' }, { status: 500 });
  }
}

// POST create doctor profile
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json().catch(() => null);
    if (!body || !body.name || !body.email || !body.specialty) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if doctor already exists
    const existing = await Doctor.findOne({ email: body.email });
    if (existing) {
      return NextResponse.json({ error: "Doctor account already exists" }, { status: 409 });
    }

    const doctor = new Doctor({
      name: body.name,
      email: body.email,
      specialty: body.specialty,
      userId: body.userId || null,
    });

    const savedDoctor = await doctor.save();
    
    return NextResponse.json({
      id: savedDoctor._id.toString(),
      name: savedDoctor.name,
      email: savedDoctor.email,
      specialty: savedDoctor.specialty,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating doctor profile:', error);
    return NextResponse.json({ error: 'Failed to create doctor profile' }, { status: 500 });
  }
}
