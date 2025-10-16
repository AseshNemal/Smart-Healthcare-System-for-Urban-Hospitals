"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../components/AuthProvider";

type DoctorProfile = {
  id: string;
  name: string;
  email: string;
  specialty: string;
};

type Appointment = {
  id: string;
  doctorId: string;
  patientName: string;
  patientEmail: string;
  date: string;
  reason: string;
};

export default function DoctorDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "today" | "upcoming">("upcoming");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/doctor/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.email) {
      loadDoctorData();
    }
  }, [user]);

  const loadDoctorData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get doctor profile
      const profileRes = await fetch(`/api/doctors/profile?email=${user?.email}`);
      if (!profileRes.ok) {
        throw new Error("Doctor profile not found. Please contact administration.");
      }
      const profile = await profileRes.json();
      setDoctorProfile(profile);

      // Get appointments for this doctor
      const appointmentsRes = await fetch(`/api/appointments?doctorId=${profile.id}`);
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData.appointments || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load doctor data");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAppointments = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (filter) {
      case "today":
        return appointments.filter(a => {
          const apptDate = new Date(a.date);
          return apptDate >= today && apptDate < tomorrow;
        });
      case "upcoming":
        return appointments.filter(a => new Date(a.date) >= now);
      case "all":
      default:
        return appointments;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground/70">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
          {error}
        </div>
        <button
          onClick={() => router.push("/doctor/login")}
          className="px-5 py-2.5 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90"
        >
          Back to Login
        </button>
      </div>
    );
  }

  if (!user || !doctorProfile) {
    return null;
  }

  const filteredAppointments = getFilteredAppointments();
  const todayCount = appointments.filter(a => {
    const apptDate = new Date(a.date);
    const today = new Date();
    return apptDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-xl">
                <span className="text-2xl">👨‍⚕️</span>
              </div>
              <h1 className="text-3xl font-bold">Doctor Portal</h1>
            </div>
            <div className="space-y-1">
              <p className="text-xl font-semibold">{doctorProfile.name}</p>
              <p className="text-white/80">{doctorProfile.specialty}</p>
              <p className="text-sm text-white/70">{doctorProfile.email}</p>
            </div>
          </div>
          <div className="bg-white/10 p-6 rounded-xl text-center min-w-[180px]">
            <div className="text-5xl font-bold mb-2">{todayCount}</div>
            <div className="text-sm text-white/80">Today's Appointments</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <button
          onClick={() => router.push('/doctor/records')}
          className="bg-white dark:bg-gray-800 shadow-md hover:shadow-xl rounded-xl p-6 text-left transition-all duration-300 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/10 group-hover:to-blue-500/5 transition-all duration-500"></div>
          <div className="relative">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg w-fit mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">Patient Records</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Search and manage patient medical records</p>
          </div>
        </button>
        <button
          onClick={() => router.push('/doctor/scan-qr')}
          className="bg-white dark:bg-gray-800 shadow-md hover:shadow-xl rounded-xl p-6 text-left transition-all duration-300 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:via-green-500/10 group-hover:to-green-500/5 transition-all duration-500"></div>
          <div className="relative">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg w-fit mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-green-600 dark:text-green-400">Scan Health Card</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Quick patient access via QR code</p>
          </div>
        </button>
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-purple-500/10 to-purple-500/5"></div>
          <div className="relative">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg w-fit mb-4">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-purple-600 dark:text-purple-400">Appointments</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">View your scheduled appointments below</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{appointments.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Appointments</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <span className="text-2xl">🔜</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {appointments.filter(a => new Date(a.date) >= new Date()).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {new Set(appointments.map(a => a.patientEmail)).size}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Unique Patients</div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <span className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <span className="text-xl">📋</span>
            </span>
            Appointment Schedule
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("today")}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                filter === "today"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              📅 Today
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                filter === "upcoming"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              🔜 Upcoming
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                filter === "all"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              📚 All
            </button>
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-12 text-center">
            <div className="text-4xl mb-4">🗓️</div>
            <p className="text-gray-600 dark:text-gray-400">No appointments found for this filter.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAppointments
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((appt) => {
                const apptDate = new Date(appt.date);
                const isPast = apptDate < new Date();
                const isToday = apptDate.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={appt.id}
                    className={`relative bg-white dark:bg-gray-800/50 rounded-xl p-6 transition-all duration-300
                      ${isPast ? "opacity-75" : "hover:shadow-lg"}
                      ${isToday ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""}
                    `}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold">{appt.patientName}</h3>
                          {isToday && (
                            <span className="text-xs px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium">
                              Today's Appointment
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                              📧
                            </span>
                            {appt.patientEmail}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                              📅
                            </span>
                            {apptDate.toLocaleDateString()} at {apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        
                        {appt.reason && (
                          <div className="flex items-start gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mt-0.5">
                              📝
                            </span>
                            <p>{appt.reason}</p>
                          </div>
                        )}
                      </div>

                      <div className="sm:text-right">
                        {isPast ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Scheduled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
