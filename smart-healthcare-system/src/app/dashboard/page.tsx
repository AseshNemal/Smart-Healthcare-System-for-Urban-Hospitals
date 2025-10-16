"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthProvider";

type Doctor = { id: string; name: string; specialty: string };

type Appointment = {
  id: string;
  doctorId: string;
  patientName: string;
  patientEmail: string;
  date: string;
  timeSlot: string;
  service: string;
  paymentStatus: boolean;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [form, setForm] = useState({
    doctorId: "",
    patientName: "",
    date: "",
    timeSlot: "",
    service: "",
  });
  const [bookedTimeSlots, setBookedTimeSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

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

  // Generate time slots (9 AM to 9 PM, 30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startHour = hour;
        const startMinute = minute;
        const endMinute = minute + 30;
        const endHour = endMinute >= 60 ? hour + 1 : hour;
        const finalEndMinute = endMinute >= 60 ? 0 : endMinute;
        
        const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
        const endTime = `${endHour.toString().padStart(2, '0')}:${finalEndMinute.toString().padStart(2, '0')}`;
        
        slots.push({
          value: startTime,
          label: `${formatTime(startHour, startMinute)} - ${formatTime(endHour, finalEndMinute)}`,
        });
      }
    }
    return slots;
  };

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  // Fetch booked time slots for a specific doctor and date
  const fetchBookedTimeSlots = async (doctorId: string, date: string) => {
    if (!doctorId || !date) return;
    
    setLoadingSlots(true);
    try {
      const res = await fetch(
        `/api/appointments?checkAvailability=true&doctorId=${doctorId}&date=${date}`
      );
      const data = await res.json();
      setBookedTimeSlots(data.bookedTimeSlots || []);
    } catch (error) {
      console.error("Error fetching booked slots:", error);
      setBookedTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Get available time slots based on selected date
  const getAvailableTimeSlots = () => {
    if (!form.date) return [];
    
    const allSlots = generateTimeSlots();
    const selectedDate = new Date(form.date);
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    // Filter out booked time slots and apply time restrictions
    const availableSlots = allSlots.filter(slot => {
      // If editing, allow the current appointment's time slot
      if (editingAppointment && slot.value === editingAppointment.timeSlot) {
        return true;
      }
      
      // Check if slot is already booked
      if (bookedTimeSlots.includes(slot.value)) {
        return false;
      }
      
      // If selected date is not today, slot is available (if not booked)
      if (selectedDate.toDateString() !== now.toDateString()) {
        return true;
      }
      
      // If selected date is today, check if slot is at least 2 hours from now
      const [slotHour, slotMinute] = slot.value.split(':').map(Number);
      const slotDateTime = new Date(selectedDate);
      slotDateTime.setHours(slotHour, slotMinute, 0, 0);
      
      return slotDateTime >= twoHoursLater;
    });
    
    return availableSlots;
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (3 months from today)
  const getMaxDate = () => {
    const today = new Date();
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setMonth(today.getMonth() + 3);
    return threeMonthsLater.toISOString().split('T')[0];
  };
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Fetch booked time slots when doctor or date changes
  useEffect(() => {
    if (form.doctorId && form.date) {
      fetchBookedTimeSlots(form.doctorId, form.date);
    } else {
      setBookedTimeSlots([]);
    }
  }, [form.doctorId, form.date]);

  const loadData = async () => {
    try {
      const [doctorsRes, appointmentsRes] = await Promise.all([
        fetch("/api/doctors"),
        fetch(`/api/appointments?email=${user?.email}`),
      ]);
      
      const doctorsData = await doctorsRes.json();
      const appointmentsData = await appointmentsRes.json();
      
      setDoctors(doctorsData);
      setAppointments(appointmentsData.filter((a: Appointment) => a.patientEmail === user?.email));
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!form.doctorId || !form.patientName || !form.date || !form.timeSlot || !form.service) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      // Combine date and time slot into a single datetime for the date field
      const [hour, minute] = form.timeSlot.split(':').map(Number);
      const appointmentDate = new Date(form.date);
      appointmentDate.setHours(hour, minute, 0, 0);

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: form.doctorId,
          patientName: form.patientName,
          date: appointmentDate.toISOString(),
          timeSlot: form.timeSlot,
          service: form.service,
          patientEmail: user?.email,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create appointment");
      }

      const created = await res.json();
      setAppointments((prev) => [created, ...prev]);
      setForm({ doctorId: "", patientName: "", date: "", timeSlot: "", service: "" });
      setShowForm(false);
      setEditingAppointment(null);
    } catch (err: any) {
      setError(err.message || "Failed to create appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (appointment: Appointment) => {
    setEditingAppointment(appointment);
    const appointmentDate = new Date(appointment.date);
    const dateStr = appointmentDate.toISOString().split('T')[0];
    
    setForm({
      doctorId: appointment.doctorId,
      patientName: appointment.patientName,
      date: dateStr,
      timeSlot: appointment.timeSlot,
      service: appointment.service,
    });
    
    // Fetch booked time slots for the appointment's date and doctor
    await fetchBookedTimeSlots(appointment.doctorId, dateStr);
    
    setShowForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!form.doctorId || !form.patientName || !form.date || !form.timeSlot || !form.service) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const [hour, minute] = form.timeSlot.split(':').map(Number);
      const appointmentDate = new Date(form.date);
      appointmentDate.setHours(hour, minute, 0, 0);

      const res = await fetch(`/api/appointments/${editingAppointment?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: form.doctorId,
          patientName: form.patientName,
          date: appointmentDate.toISOString(),
          timeSlot: form.timeSlot,
          service: form.service,
          patientEmail: user?.email,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update appointment");
      }

      const updated = await res.json();
      setAppointments((prev) =>
        prev.map((appt) => (appt.id === updated.id ? updated : appt))
      );
      setForm({ doctorId: "", patientName: "", date: "", timeSlot: "", service: "" });
      setShowForm(false);
      setEditingAppointment(null);
    } catch (err: any) {
      setError(err.message || "Failed to update appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (appointmentId: string) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete appointment");
      }

      setAppointments((prev) => prev.filter((appt) => appt.id !== appointmentId));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting appointment:", err);
      alert("Failed to delete appointment. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setForm({ doctorId: "", patientName: "", date: "", timeSlot: "", service: "" });
    setShowForm(false);
    setEditingAppointment(null);
    setError(null);
  };

  if (authLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground/70">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Patient Dashboard</h1>
          <p className="text-foreground/70">Welcome, {user.email}</p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              handleCancelEdit();
            } else {
              setShowForm(true);
            }
          }}
          className="px-5 py-2.5 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90"
        >
          {showForm ? "Cancel" : "Book New Appointment"}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={editingAppointment ? handleUpdate : handleSubmit} 
            className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">
                {editingAppointment ? "Edit Appointment" : "New Appointment"}
              </h2>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="doctorId" className="block text-sm font-medium mb-2">
                Doctor *
              </label>
              <select
                id="doctorId"
                required
                value={form.doctorId}
                onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                className="w-full border rounded-md px-3 py-2 bg-background"
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
              <label htmlFor="patientName" className="block text-sm font-medium mb-2">
                Your Name *
              </label>
              <input
                id="patientName"
                type="text"
                required
                value={form.patientName}
                onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                className="w-full border rounded-md px-3 py-2 bg-background"
                placeholder="Full Name"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2">
                Date *
              </label>
              <input
                id="date"
                type="date"
                required
                min={getMinDate()}
                max={getMaxDate()}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value, timeSlot: "" })}
                className="w-full border rounded-md px-3 py-2 bg-background cursor-pointer"
                style={{ colorScheme: 'light dark' }}
                placeholder="Select a date"
              />
              <p className="text-xs text-foreground/60 mt-1">
                📅 You can book appointments up to 3 months in advance
              </p>
            </div>

            <div>
              <label htmlFor="timeSlot" className="block text-sm font-medium mb-2">
                Time Slot *
              </label>
              <select
                id="timeSlot"
                required
                value={form.timeSlot}
                onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                disabled={!form.date || !form.doctorId || loadingSlots}
                className="w-full border rounded-md px-3 py-2 bg-background disabled:opacity-50 disabled:cursor-not-allowed"
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
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  ⚠️ No available time slots. All slots are booked or outside booking hours.
                </p>
              )}
              {form.date && form.doctorId && !loadingSlots && bookedTimeSlots.length > 0 && getAvailableTimeSlots().length > 0 && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  ✓ {getAvailableTimeSlots().length} slot(s) available ({bookedTimeSlots.length} already booked)
                </p>
              )}
            </div>

            <div>
              <label htmlFor="service" className="block text-sm font-medium mb-2">
                Service *
              </label>
              <select
                id="service"
                required
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
                className="w-full border rounded-md px-3 py-2 bg-background"
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
            className="w-full px-5 py-2.5 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (editingAppointment ? "Updating..." : "Booking...") : (editingAppointment ? "Update Appointment" : "Book Appointment")}
          </button>
        </form>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Appointments</h2>

        {appointments.length === 0 ? (
          <div className="border rounded-lg p-8 text-center">
            <p className="text-foreground/70">You have no appointments yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-sm text-foreground hover:underline"
            >
              Book your first appointment
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => {
              const doctor = doctors.find((d) => d.id === appt.doctorId);
              return (
                <div key={appt.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-semibold">{doctor?.name || "Doctor"}</div>
                      <div className="text-sm text-foreground/70">{doctor?.specialty}</div>
                      <div className="text-sm">
                        📅 {new Date(appt.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-sm">
                        🕐 {new Date(appt.date).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </div>
                      <div className="text-sm text-foreground/70">
                        Service: {appt.service}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        appt.paymentStatus 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}>
                        {appt.paymentStatus ? 'Paid' : 'Payment Pending'}
                      </span>
                      {!appt.paymentStatus && (
                        <button
                          onClick={() => {
                            // TODO: Implement payment logic
                            console.log('Payment for appointment:', appt.id);
                          }}
                          className="px-4 py-1.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                        >
                          Pay
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <button
                      onClick={() => handleEdit(appt)}
                      className="flex-1 px-4 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm font-medium transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(appt.id)}
                      className="flex-1 px-4 py-2 rounded-md border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-foreground/70 mb-6">
              Are you sure you want to delete this appointment? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-foreground hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
