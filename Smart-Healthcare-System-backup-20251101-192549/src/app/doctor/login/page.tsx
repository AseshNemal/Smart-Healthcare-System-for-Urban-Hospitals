"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../components/AuthProvider";

export default function DoctorLoginPage() {
  const router = useRouter();
  const { user, signIn, signInWithGoogle } = useAuth(); // ✅ Add signInWithGoogle
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/doctor/dashboard");
    }
  }, [user, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1: Verify doctor exists in MongoDB
      console.log('Checking doctor account in MongoDB...');
      const verifyRes = await fetch('/api/doctors/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        setError(data.error || "No doctor account found. Please register first.");
        setLoading(false);
        return;
      }

      const doctorData = await verifyRes.json();
      console.log('Doctor verified in MongoDB:', doctorData.doctor.name);

      // Step 2: Authenticate with Firebase
      console.log('Authenticating with Firebase...');
      await signIn(email, password);
      
      console.log('Login successful, redirecting to dashboard...');
      router.push("/doctor/dashboard");
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      // Step 1: Authenticate with Google/Firebase
      console.log('Signing in with Google...');
      const result = await signInWithGoogle();  // ✅ Now it's defined
      const userEmail = result.user?.email;
      
      if (!userEmail) {
        setError("Failed to get email from Google account.");
        setLoading(false);
        return;
      }

      console.log('Google sign-in successful, email:', userEmail);
      
      // Step 2: Verify doctor exists in MongoDB
      console.log('Checking doctor account in MongoDB...');
      const verifyRes = await fetch('/api/doctors/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      
      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        setError(data.error || "No doctor account found. Please register first.");
        setLoading(false);
        return;
      }

      const doctorData = await verifyRes.json();
      console.log('Doctor verified in MongoDB:', doctorData.doctor.name);
      
      console.log('Login successful, redirecting to dashboard...');
      router.push("/doctor/dashboard");
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || "Failed to login with Google.");  // ✅ Also set error
      setLoading(false);  // ✅ Reset loading state
    }
  };

  // Don't show form if already logged in
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="text-center py-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-600 dark:text-gray-300">Already logged in. Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8">
          <div className="text-5xl mb-4">👨‍⚕️</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Doctor Login
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Access your doctor dashboard</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 backdrop-blur-sm border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm shadow-md">
            {error}
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8">
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="doctor@hospital.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
            >
              {loading ? "Logging in..." : "🔐 Login"}
            </button>
          </form>
        </div>

        {/* Registration Links */}
        <div className="text-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            Don't have a doctor account?{" "}
            <Link href="/doctor/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Register here
            </Link>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Login as Patient
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
