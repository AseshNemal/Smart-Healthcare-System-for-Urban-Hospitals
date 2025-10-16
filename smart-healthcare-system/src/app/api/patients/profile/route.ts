import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import { Patient } from "../../../../models";
import { nanoid } from 'nanoid';

// GET - Fetch patient profile by email
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    let patient = await Patient.findOne({ email }).lean();
    
    if (!patient) {
      // Patient doesn't exist, create a new one with default values
      console.log('Patient not found, creating new patient profile...');
      const healthCardId = `HC-${nanoid(10).toUpperCase()}`;
      
      patient = await Patient.create({
        email,
        name: email.split('@')[0], // Use email prefix as temporary name
        phone: 'Not provided',
        dateOfBirth: new Date('2000-01-01'),
        gender: 'Other',
        address: 'Not provided',
        digitalHealthCardId: healthCardId,
      });
      
      console.log('New patient profile created with Health Card ID:', healthCardId);
    }

    // Generate digital health card ID if not exists (for existing patients)
    if (!(patient as any).digitalHealthCardId) {
      const healthCardId = `HC-${nanoid(10).toUpperCase()}`;
      patient = await Patient.findOneAndUpdate(
        { email },
        { $set: { digitalHealthCardId: healthCardId } },
        { new: true }
      ).lean();
    }

    return NextResponse.json({
      ...(patient as any),
      _id: (patient as any)._id.toString(),
    });
  } catch (error: any) {
    console.error('Error fetching patient profile:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch patient profile',
      details: error.message 
    }, { status: 500 });
  }
}

// PUT - Update patient profile
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { email, updates } = body;
    
    if (!email || !updates) {
      return NextResponse.json({ 
        error: "Email and updates are required" 
      }, { status: 400 });
    }

    const patient = await Patient.findOneAndUpdate(
      { email },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      patient,
    });
  } catch (error: any) {
    console.error('Error updating patient profile:', error);
    return NextResponse.json({ 
      error: 'Failed to update patient profile',
      details: error.message 
    }, { status: 500 });
  }
}
