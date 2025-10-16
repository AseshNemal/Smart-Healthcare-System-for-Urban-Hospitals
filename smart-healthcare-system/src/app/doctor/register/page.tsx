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
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">👨‍⚕️ Doctor Registration</h1>
        <p className="text-foreground/70 mt-2">Create your medical professional account</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="border rounded-lg p-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Full Name *
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border rounded-md px-3 py-2 bg-background"
            placeholder="Dr. John Smith"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email *
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border rounded-md px-3 py-2 bg-background"
            placeholder="doctor@hospital.com"
          />
        </div>

        <div>
          <label htmlFor="specialty" className="block text-sm font-medium mb-2">
            Specialty *
          </label>
          <select
            id="specialty"
            required
            value={formData.specialty}
            onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
            className="w-full border rounded-md px-3 py-2 bg-background"
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
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password *
          </label>
          <input
            id="password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full border rounded-md px-3 py-2 bg-background"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
            Confirm Password *
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full border rounded-md px-3 py-2 bg-background"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-5 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Doctor Account"}
        </button>
      </form>

      <div className="text-center space-y-2">
        <p className="text-sm text-foreground/70">
          Already have an account?{" "}
          <Link href="/doctor/login" className="text-foreground font-medium hover:underline">
            Login here
          </Link>
        </p>
        <p className="text-sm text-foreground/70">
          <Link href="/register" className="text-foreground font-medium hover:underline">
            Register as Patient
          </Link>
        </p>
      </div>
    </div>
  );
}
