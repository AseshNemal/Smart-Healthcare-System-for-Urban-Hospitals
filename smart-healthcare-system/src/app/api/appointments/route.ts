import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import { Appointment, Doctor } from "../../../models";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get query params for filtering
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');
    const checkAvailability = searchParams.get('checkAvailability');
    
    // Special endpoint to check booked time slots for a doctor on a specific date
    if (checkAvailability === 'true' && doctorId && date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const bookedAppointments = await Appointment.find({
        doctorId: doctorId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });
      
      const bookedTimeSlots = bookedAppointments.map(appt => appt.timeSlot);
      return NextResponse.json({ bookedTimeSlots });
    }
    
    const filter: any = {};
    if (email) {
      filter.patientEmail = email;
    }
    if (doctorId) {
      filter.doctorId = doctorId;
    }
    
    const appointments = await Appointment.find(filter)
      .populate('doctorId', 'name specialty')
      .sort({ date: 1 });
    
    // Transform to match frontend expectations
    const appointmentsWithId = appointments.map(appt => ({
      id: appt._id.toString(),
      doctorId: appt.doctorId._id.toString(),
      patientName: appt.patientName,
      patientEmail: appt.patientEmail,
      date: appt.date.toISOString(),
      timeSlot: appt.timeSlot || '',
      service: appt.service || '',
      paymentStatus: appt.paymentStatus || false,
    }));
    
    return NextResponse.json(appointmentsWithId);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json().catch(() => null);
    if (!body || !body.doctorId || !body.patientName || !body.date || !body.patientEmail || !body.timeSlot || !body.service) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(body.doctorId);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Check if the time slot is already booked for this doctor on this date
    const appointmentDate = new Date(body.date);
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingAppointment = await Appointment.findOne({
      doctorId: body.doctorId,
      timeSlot: body.timeSlot,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });
    
    if (existingAppointment) {
      return NextResponse.json({ 
        error: "This time slot is already booked for the selected doctor. Please choose a different time slot." 
      }, { status: 409 }); // 409 Conflict
    }

    const appointment = new Appointment({
      doctorId: body.doctorId,
      patientName: String(body.patientName),
      patientEmail: String(body.patientEmail),
      date: new Date(body.date),
      timeSlot: String(body.timeSlot),
      service: String(body.service),
      paymentStatus: false, // Default to false for new appointments
    });

    const savedAppointment = await appointment.save();
    
    // Return appointment with id as string for frontend compatibility
    const responseData = {
      id: savedAppointment._id.toString(),
      doctorId: savedAppointment.doctorId.toString(),
      patientName: savedAppointment.patientName,
      patientEmail: savedAppointment.patientEmail,
      date: savedAppointment.date.toISOString(),
      timeSlot: savedAppointment.timeSlot,
      service: savedAppointment.service,
      paymentStatus: savedAppointment.paymentStatus,
    };
    
    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
