"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { user, signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const formatAuthError = (err: any) => {
    const code = err?.code || "";
    switch (code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
        return "Invalid email or password.";
      case "auth/user-not-found":
        return "No account found for this email. Please register first.";
      case "auth/too-many-requests":
        return "Too many attempts. Please try again later or reset your password.";
      case "auth/popup-closed-by-user":
        return "Sign-in was cancelled.";
      default:
        return err?.message || "Authentication failed.";
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    const checkAndRedirect = async () => {
      // If already authenticated as admin via cookie, redirect
      try {
        const adminRes = await fetch('/api/admin/me', { cache: 'no-store' });
        const adminData = await adminRes.json();
        if (adminRes.ok && adminData.authenticated && adminData.role === 'admin') {
          router.push('/admin/dashboard');
          return;
        }
      } catch {}

      if (user?.email) {
        try {
          const res = await fetch(`/api/users/check-role?email=${user.email}`);
          const data = await res.json();

          if (res.ok) {
            if (data.role === "doctor") {
              router.push("/doctor/dashboard");
            } else if (data.role === "patient") {
              router.push("/dashboard");
            } else if (data.role === "admin") {
              router.push("/admin/dashboard");
            }
          }
        } catch (err) {
          console.error("Error checking role:", err);
          router.push("/dashboard");
        }
      } else {
        setCheckingAuth(false);
      }
    };

    checkAndRedirect();
  }, [user, router]);

  const checkUserRoleAndRedirect = async (userEmail: string) => {
    try {
      // Check user role in database
      const res = await fetch(`/api/users/check-role?email=${userEmail}`);
      const data = await res.json();

      if (res.ok) {
        if (data.role === "doctor") {
          router.push("/doctor/dashboard");
        } else if (data.role === "patient") {
          router.push("/dashboard");
        } else if (data.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          setError("User role not found. Please complete your registration.");
        }
      } else {
        setError("Could not determine user role. Please contact support.");
      }
    } catch (err) {
      console.error("Error checking role:", err);
      // Default to patient dashboard if role check fails
      router.push("/dashboard");
    }
  };

  const tryAdminLogin = async (emailAddr: string, pass: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailAddr, password: pass })
      });
      if (res.ok) {
        router.push('/admin/dashboard');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // First: attempt admin login via API
      const adminOk = await tryAdminLogin(email, password);
      if (adminOk) return;

      // Otherwise: continue with Firebase auth (doctor/patient)
      await signIn(email, password);
      // Check role and redirect accordingly
      await checkUserRoleAndRedirect(email);
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      const userEmail = result.user.email;
      if (userEmail) {
        await checkUserRoleAndRedirect(userEmail);
      }
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="text-center py-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-6xl mb-4 animate-pulse">🏥</div>
            <p className="text-gray-600 dark:text-gray-300">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8">
          <div className="text-5xl mb-4">🏥</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Smart Healthcare Login
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">For Patients and Doctors</p>
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
                placeholder="your@email.com"
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
              className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
            >
              {loading ? "Logging in..." : "Login with Email"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full px-5 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-50 flex items-center justify-center gap-3 transition-all duration-200 shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? "Connecting..." : "Login with Google"}
          </button>
        </div>

        {/* Registration Links */}
        <div className="text-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            Don't have an account?
          </p>
          <div className="flex gap-3 justify-center">
            <Link 
              href="/register" 
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 font-semibold shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
            >
              Register as Patient
            </Link>
            <Link 
              href="/doctor/register" 
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
            >
              Register as Doctor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
