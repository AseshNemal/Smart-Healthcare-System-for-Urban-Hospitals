import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import { Payment, Appointment, Doctor } from "../../../models";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json().catch(() => null);
    if (!body || !body.appointmentId || !body.paymentMethod || !body.amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get appointment details
    const appointment = await Appointment.findById(body.appointmentId).populate('doctorId');
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Get doctor details
    const doctor = await Doctor.findById(appointment.doctorId);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Generate transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create payment record
    const payment = new Payment({
      appointmentId: body.appointmentId,
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      doctorId: appointment.doctorId,
      doctorName: doctor.name,
      service: appointment.service,
      appointmentDate: appointment.date,
      amount: body.amount,
      currency: 'Rs.',
      paymentMethod: body.paymentMethod,
      paymentStatus: 'completed',
      paidAt: new Date(),
      transactionId: transactionId,
    });

    const savedPayment = await payment.save();

    // Return payment data
    const responseData = {
      id: savedPayment._id.toString(),
      appointmentId: savedPayment.appointmentId.toString(),
      patientName: savedPayment.patientName,
      patientEmail: savedPayment.patientEmail,
      doctorName: savedPayment.doctorName,
      service: savedPayment.service,
      appointmentDate: savedPayment.appointmentDate.toISOString(),
      amount: savedPayment.amount,
      currency: savedPayment.currency,
      paymentMethod: savedPayment.paymentMethod,
      paymentStatus: savedPayment.paymentStatus,
      paidAt: savedPayment.paidAt.toISOString(),
      transactionId: savedPayment.transactionId,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get query params for filtering
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const appointmentId = searchParams.get('appointmentId');
    
    const filter: any = {};
    if (email) {
      filter.patientEmail = email;
    }
    if (appointmentId) {
      filter.appointmentId = appointmentId;
    }
    
    const payments = await Payment.find(filter)
      .populate('appointmentId')
      .populate('doctorId', 'name specialty')
      .sort({ paidAt: -1 }); // Most recent first
    
    // Transform to match frontend expectations
    const paymentsWithId = payments.map(payment => ({
      id: payment._id.toString(),
      appointmentId: payment.appointmentId._id.toString(),
      patientName: payment.patientName,
      patientEmail: payment.patientEmail,
      doctorName: payment.doctorName,
      service: payment.service,
      appointmentDate: payment.appointmentDate.toISOString(),
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentStatus,
      paidAt: payment.paidAt.toISOString(),
      transactionId: payment.transactionId,
    }));
    
    return NextResponse.json(paymentsWithId);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
