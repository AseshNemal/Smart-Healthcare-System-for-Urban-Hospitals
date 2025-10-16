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
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">✅</div>
          <p className="text-foreground/70">Already logged in. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">👨‍⚕️ Doctor Login</h1>
        <p className="text-foreground/70 mt-2">Access your doctor dashboard</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailLogin} className="border rounded-lg p-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-md px-3 py-2 bg-background"
            placeholder="doctor@hospital.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-md px-3 py-2 bg-background"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-5 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "🔐 Login"}
        </button>
      </form>

      <div className="text-center space-y-2">
        <p className="text-sm text-foreground/70">
          Don't have a doctor account?{" "}
          <Link href="/doctor/register" className="text-foreground font-medium hover:underline">
            Register here
          </Link>
        </p>
        <p className="text-sm text-foreground/70">
          <Link href="/login" className="text-foreground font-medium hover:underline">
            Login as Patient
          </Link>
        </p>
      </div>
    </div>
  );
}
