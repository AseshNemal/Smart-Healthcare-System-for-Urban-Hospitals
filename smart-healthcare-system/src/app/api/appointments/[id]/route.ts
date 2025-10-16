import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import { Appointment, Doctor } from "../../../../models";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const body = await req.json().catch(() => null);
    if (!body || !body.doctorId || !body.patientName || !body.date || !body.patientEmail || !body.timeSlot || !body.service) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(body.doctorId);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Check if the time slot is already booked for this doctor on this date (excluding current appointment)
    const appointmentDate = new Date(body.date);
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingAppointment = await Appointment.findOne({
      _id: { $ne: id }, // Exclude current appointment
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
      }, { status: 409 });
    }

    // Update the appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      {
        doctorId: body.doctorId,
        patientName: String(body.patientName),
        patientEmail: String(body.patientEmail),
        date: new Date(body.date),
        timeSlot: String(body.timeSlot),
        service: String(body.service),
      },
      { new: true } // Return the updated document
    );

    if (!updatedAppointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const responseData = {
      id: updatedAppointment._id.toString(),
      doctorId: updatedAppointment.doctorId.toString(),
      patientName: updatedAppointment.patientName,
      patientEmail: updatedAppointment.patientEmail,
      date: updatedAppointment.date.toISOString(),
      timeSlot: updatedAppointment.timeSlot,
      service: updatedAppointment.service,
      paymentStatus: updatedAppointment.paymentStatus,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const deletedAppointment = await Appointment.findByIdAndDelete(id);
    
    if (!deletedAppointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
}
