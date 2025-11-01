import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

interface Doctor {
  _id: any;
  name: string;
  specialty: string;
  email: string;
}

interface Appointment {
  _id: any;
  patientName: string;
  doctorId: string;
  date: string;
  timeSlot: string;
  service: string;
  department?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("reportType") || "Patient Visits";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const department = searchParams.get("department");
    const doctorId = searchParams.get("doctorId");

    await dbConnect();

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      dateFilter.$lte = endDateTime;
    }

    // Build match conditions
    const matchConditions: any = {};
    if (Object.keys(dateFilter).length > 0) {
      matchConditions.date = dateFilter;
    }
    if (department && department !== "All Departments") {
      matchConditions.department = department;
    }
    if (doctorId && doctorId !== "All Doctors") {
      matchConditions.doctorId = doctorId;
    }

    // Fetch appointments data using Mongoose
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }
    
    const appointments = await db
      .collection("appointments")
      .find(matchConditions)
      .toArray();

    if (appointments.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          appointments: [],
          statistics: {
            totalVisits: 0,
            averageDailyVisits: 0,
            peakHours: "N/A",
            utilizationRate: 0,
          },
          chartData: {
            visitsOverTime: [],
            serviceUtilization: [],
          },
        },
        message: "No data available for the selected parameters.",
      });
    }

    // Fetch doctors data for enrichment
    const doctors = await db
      .collection("doctors")
      .find({})
      .toArray();
      
    const doctorsMap = new Map<string, Doctor>(
      doctors.map((d: any) => [d._id.toString(), d as Doctor])
    );

    // Enrich appointments with doctor info
    const enrichedAppointments = appointments.map((apt: any) => ({
      ...apt,
      _id: apt._id.toString(),
      doctorName: doctorsMap.get(apt.doctorId)?.name || "Unknown Doctor",
      doctorSpecialty: doctorsMap.get(apt.doctorId)?.specialty || "Unknown",
    }));

    // Calculate statistics
    const totalVisits = enrichedAppointments.length;

    // Calculate date range for average daily visits
    const dates = enrichedAppointments.map((apt: any) => new Date(apt.date));
    const minDate = new Date(Math.min(...dates.map((d: Date) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d: Date) => d.getTime())));
    const daysDiff = Math.max(
      1,
      Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
    const averageDailyVisits = Math.round(totalVisits / daysDiff);

    // Calculate peak hours
    const hourCounts: { [key: string]: number } = {};
    enrichedAppointments.forEach((apt: any) => {
      if (apt.timeSlot) {
        const hour = apt.timeSlot.split(":")[0];
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    let peakHourStart = "10 AM";
    let peakHourEnd = "1 PM";
    let maxCount = 0;

    Object.entries(hourCounts).forEach(([hour, count]) => {
      if (count > maxCount) {
        maxCount = count;
        const hourNum = parseInt(hour);
        peakHourStart = hourNum >= 12 ? `${hourNum === 12 ? 12 : hourNum - 12} PM` : `${hourNum} AM`;
        const endHourNum = hourNum + 3;
        peakHourEnd = endHourNum >= 12 ? `${endHourNum === 12 ? 12 : endHourNum - 12} PM` : `${endHourNum} AM`;
      }
    });

    const peakHours = `${peakHourStart} - ${peakHourEnd}`;

    // Calculate service utilization
    const serviceCounts: { [key: string]: number } = {};
    enrichedAppointments.forEach((apt: any) => {
      const service = apt.service || "Other";
      serviceCounts[service] = (serviceCounts[service] || 0) + 1;
    });

    const utilizationRate = Math.round((totalVisits / (daysDiff * 10)) * 100); // Assuming 10 appointments capacity per day

    // Prepare chart data - visits over time
    const visitsPerDay: { [key: string]: number } = {};
    enrichedAppointments.forEach((apt: any) => {
      const dateStr = new Date(apt.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      visitsPerDay[dateStr] = (visitsPerDay[dateStr] || 0) + 1;
    });

    const visitsOverTime = Object.entries(visitsPerDay)
      .map(([date, count]) => ({ date, visits: count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Prepare service utilization chart data
    const serviceUtilization = Object.entries(serviceCounts).map(
      ([name, value]) => ({
        name,
        value,
        percentage: Math.round((value / totalVisits) * 100),
      })
    );

    // Prepare patient details
    const patientDetails = enrichedAppointments
      .slice(0, 100) // Limit to 100 records for performance
      .map((apt: any) => ({
        patientName: apt.patientName,
        visitDate: new Date(apt.date).toISOString().split("T")[0],
        doctor: apt.doctorName,
        department: apt.doctorSpecialty,
        serviceType: apt.service,
      }));

    return NextResponse.json({
      success: true,
      data: {
        appointments: patientDetails,
        statistics: {
          totalVisits,
          averageDailyVisits,
          peakHours,
          utilizationRate,
        },
        chartData: {
          visitsOverTime,
          serviceUtilization,
        },
      },
    });
  } catch (error) {
    console.error("Reports API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to retrieve data. Please try again later.",
      },
      { status: 500 }
    );
  }
}
