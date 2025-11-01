"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../components/AuthProvider";

export default function DoctorRegisterPage() {
  const router = useRouter();
  const { user, signUp } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    specialty: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in as doctor
  useEffect(() => {
    if (user) {
      // Check if user is already a doctor
      fetch(`/api/doctors/profile?email=${user.email}`)
        .then(res => {
          if (res.ok) {
            router.push("/doctor/dashboard");
          }
        })
        .catch(() => {
          // User exists but not a doctor, allow registration
        });
    }
  }, [user, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!formData.name || !formData.specialty) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      console.log('Step 1: Creating Firebase account...');
      // Create Firebase account
      const userCredential = await signUp(formData.email, formData.password);
      console.log('Firebase account created:', userCredential.user?.uid);
      
      console.log('Step 2: Creating doctor profile in MongoDB...');
      // Create doctor profile in MongoDB
      const res = await fetch("/api/doctors/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          specialty: formData.specialty,
          userId: userCredential.user?.uid,
        }),
      });

      const data = await res.json();
      console.log('MongoDB response:', res.status, data);

      if (!res.ok) {
        throw new Error(data.error || data.details || "Failed to create doctor profile");
      }

      console.log('Registration successful! Redirecting...');
      router.push("/doctor/dashboard");
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8">
          <div className="text-5xl mb-4">👨‍⚕️</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Doctor Registration
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Create your medical professional account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 backdrop-blur-sm border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm shadow-md">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Dr. John Smith"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="doctor@hospital.com"
              />
            </div>

            <div>
              <label htmlFor="specialty" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                Specialty *
              </label>
              <select
                id="specialty"
                required
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                aria-label="Doctor specialty"
              >
                <option value="">Select specialty</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
                <option value="General Practitioner">General Practitioner</option>
                <option value="Ophthalmologist">Ophthalmologist</option>
                <option value="Psychiatrist">Psychiatrist</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                Password *
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 shadow-lg transition-all duration-200 transform hover:scale-[1.02] mt-2"
            >
              {loading ? "Creating account..." : "Create Doctor Account"}
            </button>
          </form>
        </div>

        {/* Login Links */}
        <div className="text-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            Already have an account?{" "}
            <Link href="/doctor/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Login here
            </Link>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            <Link href="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Register as Patient
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
