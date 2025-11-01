"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthProvider";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

interface DoctorsClientProps {
  doctors: Doctor[];
}

export default function DoctorsClient({ doctors }: DoctorsClientProps) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [form, setForm] = useState({
    doctorId: "",
    patientName: "",
    patientEmail: "",
    date: "",
    timeSlot: "",
    service: "",
  });
  const [bookedTimeSlots, setBookedTimeSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group doctors by specialty
  const doctorsBySpecialty = doctors.reduce((acc: any, doctor) => {
    if (!acc[doctor.specialty]) {
      acc[doctor.specialty] = [];
    }
    acc[doctor.specialty].push(doctor);
    return acc;
  }, {});

  const specialtyIcons: { [key: string]: string } = {
    'Cardiologist': '❤️',
    'Pediatrician': '👶',
    'Dermatologist': '✨',
    'Neurologist': '🧠',
    'Orthopedic Surgeon': '🦴',
    'General Practitioner': '🩺',
    'Ophthalmologist': '👁️',
    'Psychiatrist': '🧘',
  };

  const services = [
    'General Checkup',
    'Consultation',
    'Follow-up Visit',
    'Vaccination',
    'Laboratory Tests',
    'X-Ray/Imaging',
    'Physical Therapy',
    'Emergency Care',
    'Dental Care',
    'Pediatric Care',
    'Other'
  ];

  // Fetch booked time slots when doctor and date change
  useEffect(() => {
    if (form.doctorId && form.date) {
      fetchBookedTimeSlots(form.doctorId, form.date);
    } else {
      setBookedTimeSlots([]);
    }
  }, [form.doctorId, form.date]);

  const fetchBookedTimeSlots = async (doctorId: string, date: string) => {
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/appointments?checkAvailability=true&doctorId=${doctorId}&date=${date}`);
      const data = await res.json();
      setBookedTimeSlots(data.bookedTimeSlots || []);
    } catch (err) {
      console.error('Error fetching booked slots:', err);
      setBookedTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookClick = (doctor: Doctor) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setSelectedDoctor(doctor);
    setForm({
      doctorId: doctor.id,
      patientName: user.displayName || "",
      patientEmail: user.email || "",
      date: "",
      timeSlot: "",
      service: "",
    });
    setError(null);
    setShowForm(true);
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setSelectedDoctor(null);
    setForm({
      doctorId: "",
      patientName: "",
      patientEmail: "",
      date: "",
      timeSlot: "",
      service: "",
    });
    setError(null);
  };

  const getMinDate = () => {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    return now.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  const getAvailableTimeSlots = () => {
    const slots = [];
    const startHour = 9;
    const endHour = 21;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute of [0, 30]) {
        const timeValue = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const displayHour = hour > 12 ? hour - 12 : hour;
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayMinute = String(minute).padStart(2, '0');
        
        const isBooked = bookedTimeSlots.includes(timeValue);
        
        slots.push({
          value: timeValue,
          label: `${displayHour}:${displayMinute} ${period}${isBooked ? ' (Booked)' : ''}`,
          disabled: isBooked
        });
      }
    }

    return slots;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!form.service) {
      setError("Please select a service");
      setLoading(false);
      return;
    }

    try {
      const selectedDateTime = new Date(`${form.date}T${form.timeSlot}`);
      const now = new Date();
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      if (selectedDateTime < twoHoursFromNow) {
        setError("Appointments must be booked at least 2 hours in advance");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          date: `${form.date}T${form.timeSlot}:00.000Z`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to book appointment");
      }

      // Redirect to dashboard on success
      handleCloseModal();
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-2">
          <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">👨‍⚕️ Our Medical Team</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
          Meet Our Specialists
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
          Connect with experienced healthcare professionals dedicated to your wellbeing<br/>
          {doctors.length > 0 && `  ${doctors.length} doctors available`}
        </p>
      </div>

      {doctors.length === 0 ? (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">👨‍⚕️</div>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">No doctors available at the moment.</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Visit <Link href="/admin/seed-doctors" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">/admin/seed-doctors</Link> to add doctors to the database.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(doctorsBySpecialty).map(([specialty, docs]: [string, any]) => (
            <div key={specialty} className="space-y-6">
              {/* Specialty Header */}
              <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-100 dark:border-blue-800/30">
                <span className="text-3xl">{specialtyIcons[specialty] || '⚕️'}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{specialty}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{docs.length} specialist{docs.length > 1 ? 's' : ''} available</p>
                </div>
              </div>

              {/* Doctors Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {docs.map((doctor: Doctor) => (
                  <div 
                    key={doctor.id} 
                    className="group bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-100 dark:hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="space-y-4">
                      {/* Doctor Avatar & Info */}
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center text-3xl flex-shrink-0">
                          👨‍⚕️
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate">
                            {doctor.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{doctor.specialty}</p>
                        </div>
                      </div>

                      {/* Quick Info */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <span>🏥</span>
                          <span>Available for appointments</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <span>⭐</span>
                          <span>Board certified specialist</span>
                        </div>
                      </div>

                      {/* Book Button */}
                      <button 
                        onClick={() => handleBookClick(doctor)}
                        className="w-full text-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold transition-all hover:scale-105 shadow-md"
                      >
                        📅 Book Appointment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call to Action */}
      {doctors.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-blue-900/10 dark:via-cyan-900/10 dark:to-indigo-900/10 rounded-3xl p-8 md:p-12 border border-blue-100 dark:border-blue-800/30 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Need Help Choosing?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">
            Not sure which specialist to see? Our general practitioners can help guide you to the right care.
          </p>
          <div className="flex gap-4 items-center justify-center flex-wrap">
            <Link 
              href="/contact" 
              className="px-6 py-3 rounded-xl bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-semibold hover:shadow-lg transition-all border border-blue-200 dark:border-blue-700"
            >
              📞 Contact Us
            </Link>
            <Link 
              href="/dashboard" 
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all"
            >
              📋 View My Appointments
            </Link>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showForm && selectedDoctor && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <form 
            onSubmit={handleSubmit} 
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl p-8 space-y-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Book New Appointment
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Schedule your visit with our doctors
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm shadow-md">
                {error}
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="doctorId" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                  Doctor <span className="text-red-500">*</span>
                </label>
                <select
                  id="doctorId"
                  required
                  value={form.doctorId}
                  onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="patientName" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="patientName"
                  type="text"
                  required
                  value={form.patientName}
                  onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Full Name"
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="date"
                  type="date"
                  required
                  min={getMinDate()}
                  max={getMaxDate()}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value, timeSlot: "" })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                  style={{ colorScheme: 'light dark' }}
                  placeholder="Select a date"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                  <span>📅</span> You can book appointments up to 3 months in advance
                </p>
              </div>

              <div>
                <label htmlFor="timeSlot" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                  Time Slot <span className="text-red-500">*</span>
                </label>
                <select
                  id="timeSlot"
                  required
                  value={form.timeSlot}
                  onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                  disabled={!form.date || !form.doctorId || loadingSlots}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!form.doctorId ? "Select a doctor first" : 
                     !form.date ? "Select a date first" : 
                     loadingSlots ? "Loading available slots..." :
                     "Select a time slot"}
                  </option>
                  {form.date && form.doctorId && !loadingSlots && getAvailableTimeSlots().map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
                {form.date && form.doctorId && !loadingSlots && getAvailableTimeSlots().length === 0 && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                    <span>⚠️</span> No available time slots. All slots are booked or outside booking hours.
                  </p>
                )}
                {form.date && form.doctorId && !loadingSlots && bookedTimeSlots.length > 0 && getAvailableTimeSlots().length > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                    <span>✓</span> {getAvailableTimeSlots().length} slot(s) available ({bookedTimeSlots.length} already booked)
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="service" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                  Service <span className="text-red-500">*</span>
                </label>
                <select
                  id="service"
                  required
                  value={form.service}
                  onChange={(e) => setForm({ ...form, service: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-bold hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {loading ? "Booking..." : "📅 Book Appointment"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
