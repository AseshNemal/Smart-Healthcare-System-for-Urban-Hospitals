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
  const [showBillModal, setShowBillModal] = useState<Appointment | null>(null);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"credit-card" | "insurance">("credit-card");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [sortBy, setSortBy] = useState<string>("nearest");
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Card payment form state
  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "",
  });

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

  // Service pricing
  const servicePricing: { [key: string]: number } = {
    'General Checkup': 1500.00,
    'Consultation': 2000.00,
    'Follow-up Visit': 1750.00,
    'Vaccination': 3000.00,
    'Laboratory Tests': 4000.00,
    'X-Ray/Imaging': 2500.00,
    'Physical Therapy': 5000.00,
    'Emergency Care': 1500.00,
    'Dental Care': 3000.00,
    'Pediatric Care': 3500.00,
    'Other': 1000.00,
  };

  const getServicePrice = (service: string): number => {
    return servicePricing[service] || 50.00;
  };

  // Load payment history from database
  const loadPayments = async () => {
    if (!user?.email) return;
    
    setLoadingPayments(true);
    try {
      const res = await fetch(`/api/payments?email=${user.email}`);
      const data = await res.json();
      setPayments(data);
    } catch (err) {
      console.error("Error loading payments:", err);
      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Calculate total amount paid from payment records
  const getTotalPaid = () => {
    return payments.reduce((total, payment) => {
      return total + (payment.amount || 0);
    }, 0);
  };

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

  // Format timeSlot string (e.g., "09:00") to readable format (e.g., "9:00 AM")
  const formatTimeSlot = (timeSlot: string) => {
    const [hourStr, minuteStr] = timeSlot.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    return formatTime(hour, minute);
  };

  // Card validation functions
  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(' ') : numbers;
  };

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return numbers.slice(0, 2) + '/' + numbers.slice(2, 4);
    }
    return numbers;
  };

  const validateCardNumber = (cardNumber: string) => {
    const numbers = cardNumber.replace(/\s/g, '');
    return numbers.length === 16 && /^\d+$/.test(numbers);
  };

  const validateExpiry = (expiry: string) => {
    const [month, year] = expiry.split('/');
    if (!month || !year || month.length !== 2 || year.length !== 2) return false;
    
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt('20' + year, 10);
    
    if (monthNum < 1 || monthNum > 12) return false;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (yearNum < currentYear) return false;
    if (yearNum === currentYear && monthNum < currentMonth) return false;
    
    return true;
  };

  const validateCVV = (cvv: string) => {
    return (cvv.length === 3 || cvv.length === 4) && /^\d+$/.test(cvv);
  };

  const isCardFormValid = () => {
    if (paymentMethod !== "credit-card") return true;
    
    return (
      validateCardNumber(cardForm.cardNumber) &&
      validateExpiry(cardForm.expiry) &&
      validateCVV(cardForm.cvv) &&
      cardForm.cardName.trim().length >= 3
    );
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

  // Load payments when payment history modal opens
  useEffect(() => {
    if (showPaymentHistory && user?.email) {
      loadPayments();
    }
  }, [showPaymentHistory, user]);

  const loadData = async () => {
    try {
      const [doctorsRes, appointmentsRes] = await Promise.all([
        fetch("/api/doctors"),
        fetch(`/api/appointments?email=${user?.email}`),
      ]);
      
      const doctorsData = await doctorsRes.json();
      const appointmentsData = await appointmentsRes.json();
      
      setDoctors(doctorsData);
      const appointments = appointmentsData.appointments || [];
      setAppointments(appointments.filter((a: Appointment) => a.patientEmail === user?.email));
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

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const amount = getServicePrice(showBillModal!.service);

      // Create payment record in database
      const paymentRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: showBillModal?.id,
          amount: amount,
          paymentMethod: paymentMethod,
        }),
      });

      if (!paymentRes.ok) {
        throw new Error("Failed to create payment record");
      }

      const paymentData = await paymentRes.json();
      console.log('Payment record created:', paymentData);

      // Update appointment payment status
      const res = await fetch(`/api/appointments/${showBillModal?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: showBillModal?.doctorId,
          patientName: showBillModal?.patientName,
          date: showBillModal?.date,
          timeSlot: showBillModal?.timeSlot,
          service: showBillModal?.service,
          patientEmail: user?.email,
          paymentStatus: true,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update payment status");
      }

      const updated = await res.json();
      setAppointments((prev) =>
        prev.map((appt) => (appt.id === updated.id ? updated : appt))
      );

      // Close modals and reset
      setShowPaymentGateway(false);
      setShowBillModal(null);
      setPaymentMethod("credit-card");
      alert(`Payment successful! Transaction ID: ${paymentData.transactionId}`);
      
      // Reload payments to update history
      await loadPayments();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Sort appointments based on selected criteria
  const getSortedAppointments = () => {
    const sorted = [...appointments];
    
    switch (sortBy) {
      case "nearest":
        return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      case "farthest":
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      case "paid":
        return sorted.sort((a, b) => {
          if (a.paymentStatus === b.paymentStatus) return 0;
          return a.paymentStatus ? -1 : 1;
        });
      
      case "unpaid":
        return sorted.sort((a, b) => {
          if (a.paymentStatus === b.paymentStatus) return 0;
          return a.paymentStatus ? 1 : -1;
        });
      
      case "doctor-az":
        return sorted.sort((a, b) => {
          const doctorA = doctors.find(d => d.id === a.doctorId)?.name || "";
          const doctorB = doctors.find(d => d.id === b.doctorId)?.name || "";
          return doctorA.localeCompare(doctorB);
        });
      
      case "doctor-za":
        return sorted.sort((a, b) => {
          const doctorA = doctors.find(d => d.id === a.doctorId)?.name || "";
          const doctorB = doctors.find(d => d.id === b.doctorId)?.name || "";
          return doctorB.localeCompare(doctorA);
        });
      
      default:
        return sorted;
    }
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-2">
          <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">👤 Patient Portal</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
          Welcome Back!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          {user.email}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          aria-label="Toggle appointment form"
          onClick={() => setShowForm(!showForm)}
          className="group relative rounded-xl border border-blue-200 dark:border-blue-800 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-1"
        >
          <div className="text-3xl mb-2">➕</div>
          <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">Book Appointment</div>
        </button>
        <button
          aria-label="Open profile"
          onClick={() => router.push('/profile')}
          className="group relative rounded-xl border border-purple-200 dark:border-purple-800 p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:shadow-lg hover:shadow-purple-100 dark:hover:shadow-purple-900/20 transition-all duration-300 hover:-translate-y-1"
        >
          <div className="text-3xl mb-2">📜</div>
          <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">Health Card</div>
        </button>
        <button
          aria-label="View medical records"
          onClick={() => router.push('/my-records')}
          className="group relative rounded-xl border border-indigo-200 dark:border-indigo-800 p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 hover:shadow-lg hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20 transition-all duration-300 hover:-translate-y-1"
        >
          <div className="text-3xl mb-2">📋</div>
          <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">Medical Records</div>
        </button>
        <button
          aria-label="Open payment history"
          onClick={() => setShowPaymentHistory(true)}
          className="group relative rounded-xl border border-green-200 dark:border-green-800 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:shadow-lg hover:shadow-green-100 dark:hover:shadow-green-900/20 transition-all duration-300 hover:-translate-y-1"
        >
          <div className="text-3xl mb-2">💵</div>
          <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">Payment History</div>
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <form 
            onSubmit={editingAppointment ? handleUpdate : handleSubmit} 
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl p-8 space-y-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {editingAppointment ? "Edit Appointment" : "Book New Appointment"}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {editingAppointment ? "Update your appointment details" : "Schedule your visit with our doctors"}
                </p>
              </div>
              <button
                aria-label="Close appointment form"
                type="button"
                onClick={handleCancelEdit}
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
              {loading ? (editingAppointment ? "Updating..." : "Booking...") : (editingAppointment ? "📅 Update Appointment" : "📅 Book Appointment")}
            </button>
          </form>
        </div>
      )}

      {/* Appointments Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Your Appointments</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track all your upcoming visits</p>
          </div>
          
          {appointments.length > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="sortBy" className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Sort by:
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="nearest">Nearest Date</option>
                <option value="farthest">Farthest Date</option>
                <option value="unpaid">Unpaid First</option>
                <option value="paid">Paid First</option>
                <option value="doctor-az">Doctor Name (A-Z)</option>
                <option value="doctor-za">Doctor Name (Z-A)</option>
              </select>
            </div>
          )}
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-blue-900/10 dark:via-cyan-900/10 dark:to-indigo-900/10 rounded-3xl border border-blue-100 dark:border-blue-800/30">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium mb-4">No appointments scheduled yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl"
            >
              Book your first appointment →
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {getSortedAppointments().map((appt) => {
              const doctor = doctors.find((d) => d.id === appt.doctorId);
              return (
                <div 
                  key={appt.id} 
                  className="group relative rounded-2xl border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800/50 hover:shadow-xl hover:shadow-blue-100 dark:hover:shadow-blue-900/20 transition-all duration-300"
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                      appt.paymentStatus 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
                    }`}>
                      {appt.paymentStatus ? '✓ Paid' : '⏳ Pending'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Doctor Info */}
                    <div>
                      <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {doctor?.name || "Doctor"}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {doctor?.specialty}
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="space-y-2 py-4 border-t border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-blue-600 dark:text-blue-400">📅</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {new Date(appt.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-blue-600 dark:text-blue-400">🕐</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {formatTimeSlot(appt.timeSlot)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-blue-600 dark:text-blue-400">💊</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {appt.service}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {!appt.paymentStatus && (
                        <button
                          onClick={() => setShowBillModal(appt)}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-md hover:shadow-lg"
                        >
                          💳 Pay Now
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(appt)}
                        disabled={appt.paymentStatus}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          appt.paymentStatus
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-300 dark:border-gray-700'
                            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                        }`}
                        title={appt.paymentStatus ? "Paid appointments cannot be edited" : "Edit appointment"}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(appt.id)}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <span className="text-3xl">🗑️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Appointment?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                This action cannot be undone. The appointment will be permanently removed.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                aria-label="Close delete confirmation"
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bill Modal */}
      {showBillModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Appointment Bill</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Review your payment details</p>
              </div>
              <button
                aria-label="Close bill modal"
                onClick={() => setShowBillModal(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Patient Name</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{showBillModal.patientName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Doctor</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {doctors.find(d => d.id === showBillModal.doctorId)?.name || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Service</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{showBillModal.service}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Date</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {new Date(showBillModal.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Time</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatTimeSlot(showBillModal.timeSlot)}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl mb-6 border border-green-200 dark:border-green-800">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Amount</div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    Rs.{getServicePrice(showBillModal.service).toFixed(2)}
                  </div>
                </div>
                <div className="text-5xl">💰</div>
              </div>
            </div>

            <button
              onClick={() => {
                setCardForm({ cardNumber: "", expiry: "", cvv: "", cardName: "" });
                setShowPaymentGateway(true);
              }}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl"
            >
              💳 Proceed to Payment
            </button>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      {showPaymentGateway && showBillModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Payment Gateway</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Secure payment processing</p>
              </div>
              <button
                aria-label="Close payment gateway"
                onClick={() => {
                  setShowPaymentGateway(false);
                  setPaymentMethod("credit-card");
                  setCardForm({ cardNumber: "", expiry: "", cvv: "", cardName: "" });
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl mb-6 border border-green-200 dark:border-green-800">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Amount to Pay</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  Rs.{getServicePrice(showBillModal.service).toFixed(2)}
                </span>
              </div>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("credit-card")}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === "credit-card"
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">💳</div>
                      <div className="text-sm font-medium">Credit Card</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("insurance")}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === "insurance"
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🏥</div>
                      <div className="text-sm font-medium">Insurance</div>
                    </div>
                  </button>
                </div>
              </div>

              {paymentMethod === "credit-card" && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium mb-2">
                      Card Number *
                    </label>
                    <input
                      id="cardNumber"
                      type="text"
                      required
                      value={cardForm.cardNumber}
                      onChange={(e) => {
                        const formatted = formatCardNumber(e.target.value);
                        if (formatted.replace(/\s/g, '').length <= 16) {
                          setCardForm({ ...cardForm, cardNumber: formatted });
                        }
                      }}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className={`w-full border rounded-md px-3 py-2 bg-background ${
                        cardForm.cardNumber && !validateCardNumber(cardForm.cardNumber)
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {cardForm.cardNumber && !validateCardNumber(cardForm.cardNumber) && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Card number must be 16 digits
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiry" className="block text-sm font-medium mb-2">
                        Expiry Date *
                      </label>
                      <input
                        id="expiry"
                        type="text"
                        required
                        value={cardForm.expiry}
                        onChange={(e) => {
                          const formatted = formatExpiry(e.target.value);
                          setCardForm({ ...cardForm, expiry: formatted });
                        }}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={`w-full border rounded-md px-3 py-2 bg-background ${
                          cardForm.expiry && !validateExpiry(cardForm.expiry)
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {cardForm.expiry && !validateExpiry(cardForm.expiry) && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Enter valid future date
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium mb-2">
                        CVV *
                      </label>
                      <input
                        id="cvv"
                        type="text"
                        required
                        value={cardForm.cvv}
                        onChange={(e) => {
                          const numbers = e.target.value.replace(/\D/g, '');
                          if (numbers.length <= 4) {
                            setCardForm({ ...cardForm, cvv: numbers });
                          }
                        }}
                        placeholder="123"
                        maxLength={4}
                        className={`w-full border rounded-md px-3 py-2 bg-background ${
                          cardForm.cvv && !validateCVV(cardForm.cvv)
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {cardForm.cvv && !validateCVV(cardForm.cvv) && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          CVV must be 3 or 4 digits
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="cardName" className="block text-sm font-medium mb-2">
                      Cardholder Name *
                    </label>
                    <input
                      id="cardName"
                      type="text"
                      required
                      value={cardForm.cardName}
                      onChange={(e) => setCardForm({ ...cardForm, cardName: e.target.value })}
                      placeholder="John Doe"
                      className={`w-full border rounded-md px-3 py-2 bg-background ${
                        cardForm.cardName && cardForm.cardName.trim().length < 3
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {cardForm.cardName && cardForm.cardName.trim().length < 3 && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Name must be at least 3 characters
                      </p>
                    )}
                  </div>
                </div>
              )}

              {paymentMethod === "insurance" && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="insuranceProvider" className="block text-sm font-medium mb-2">
                      Insurance Provider *
                    </label>
                    <select
                      id="insuranceProvider"
                      required
                      className="w-full border rounded-md px-3 py-2 bg-background"
                    >
                      <option value="">Select provider</option>
                      <option value="SLIC">SLIC</option>
                      <option value="ceylinco">Ceylinco Life</option>
                      <option value="allianz">Allianz Sri Lanka</option>
                      <option value="AIA">AIA Sri Lanka</option>
                      <option value="union">Union Assurance</option>
                      <option value="softlogic">Softlogic Life</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="policyNumber" className="block text-sm font-medium mb-2">
                      Policy Number *
                    </label>
                    <input
                      id="policyNumber"
                      type="text"
                      required
                      placeholder="POL123456789"
                      className="w-full border rounded-md px-3 py-2 bg-background"
                    />
                  </div>
                  <div>
                    <label htmlFor="groupNumber" className="block text-sm font-medium mb-2">
                      Group Number *
                    </label>
                    <input
                      id="groupNumber"
                      type="text"
                      required
                      placeholder="GRP987654"
                      className="w-full border rounded-md px-3 py-2 bg-background"
                    />
                  </div>
                  <div>
                    <label htmlFor="subscriberId" className="block text-sm font-medium mb-2">
                      Subscriber ID *
                    </label>
                    <input
                      id="subscriberId"
                      type="text"
                      required
                      placeholder="SUB123456"
                      className="w-full border rounded-md px-3 py-2 bg-background"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentGateway(false);
                    setPaymentMethod("credit-card");
                    setCardForm({ cardNumber: "", expiry: "", cvv: "", cardName: "" });
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentLoading || !isCardFormValid()}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {paymentLoading ? "Processing..." : "💳 Pay Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment History Modal */}
      {showPaymentHistory && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">💰 Payment History</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View all your past transactions</p>
              </div>
              <button
                aria-label="Close payment history modal"
                onClick={() => setShowPaymentHistory(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loadingPayments ? (
              <div className="text-center py-12">
                <p className="text-foreground/70">Loading payment history...</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💳</div>
                <p className="text-lg text-foreground/70">No payment history yet</p>
                <p className="text-sm text-foreground/50 mt-2">Your paid appointments will appear here</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {payments.map((payment) => {
                      return (
                        <div key={payment.id} className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50/50 dark:bg-green-900/10">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs px-2 py-1 rounded-full bg-green-600 text-white font-medium">
                                  ✓ PAID
                                </span>
                                <span className="text-sm text-foreground/60">
                                  Transaction ID: {payment.transactionId}
                                </span>
                              </div>
                              
                              <div className="grid md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-foreground/60">Doctor:</span>
                                  <span className="ml-2 font-medium">{payment.doctorName || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="text-foreground/60">Patient:</span>
                                  <span className="ml-2 font-medium">{payment.patientName}</span>
                                </div>
                                <div>
                                  <span className="text-foreground/60">Service:</span>
                                  <span className="ml-2 font-medium">{payment.service}</span>
                                </div>
                                <div>
                                  <span className="text-foreground/60">Appointment Date:</span>
                                  <span className="ml-2 font-medium">
                                    {new Date(payment.appointmentDate).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-foreground/60">Paid Date:</span>
                                  <span className="ml-2 font-medium">
                                    {new Date(payment.paidAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: 'numeric',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-foreground/60">Payment Method:</span>
                                  <span className="ml-2 font-medium capitalize">
                                    {payment.paymentMethod === 'credit-card' ? 'Credit Card' : 'Insurance'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right ml-4">
                              <div className="text-xs text-foreground/60 mb-1">Amount Paid</div>
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {payment.currency} {payment.amount.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-3 border-t border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between text-xs text-foreground/60">
                              <span>Transaction completed</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Total Section */}
                <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-4">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-foreground/70 mb-1">Total Payments Made</div>
                        <div className="text-lg font-medium text-foreground/80">
                          {payments.length} appointment{payments.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-foreground/70 mb-1">Total Amount Paid</div>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                          Rs. {getTotalPaid().toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center text-xs text-foreground/50">
                    All transactions are secure and encrypted
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
