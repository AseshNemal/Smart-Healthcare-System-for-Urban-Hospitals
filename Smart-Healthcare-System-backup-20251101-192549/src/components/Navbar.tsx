"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useState, useEffect } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/doctors", label: "Doctors" },
  { href: "/dashboard", label: "Appointments" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
];

// Links for logged-in patients
const patientLinks = [
  { href: "/doctors", label: "Doctors" },
  { href: "/dashboard", label: "Appointments" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [userRole, setUserRole] = useState<"patient" | "doctor" | "admin" | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  const isAdminPage = pathname?.startsWith("/admin");
  
  // More specific path checks to avoid matching /doctors with /doctor
  const isDoctor = pathname?.startsWith("/doctor/") || pathname === "/doctor" || userRole === "doctor";
  const isAdmin = pathname?.startsWith("/admin/") || pathname === "/admin" || userRole === "admin";

  // Handle client-side mounting to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    if (user?.email) {
      // Check user role from database
      fetch(`/api/users/check-role?email=${user.email}`)
        .then(res => res.json())
        .then(data => {
          if (data.role === "doctor") {
            setUserRole("doctor");
            setUserName(data.user.name);
          } else if (data.role === "patient") {
            setUserRole("patient");
            setUserName(data.user.name || user.email);
          } else if (data.user?.role === "admin" || user.email === "admin@healthcare.com") {
            setUserRole("admin");
            setUserName(data.user.name || "Healthcare Manager");
          }
        })
        .catch(() => {
          setUserRole(null);
        });
    } else {
      // No Firebase user: check if admin cookie present
      fetch('/api/admin/me', { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          if (data?.authenticated && data.role === 'admin') {
            setUserRole('admin');
            setUserName(data.user?.name || 'Healthcare Manager');
          } else {
            setUserRole(null);
            setUserName("");
          }
        })
        .catch(() => {
          setUserRole(null);
          setUserName("");
        });
    }
  }, [user]);

  // Hide the global navbar entirely on admin pages (after hooks to preserve hook order)
  if (isAdminPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 dark:from-blue-900 dark:via-indigo-900 dark:to-blue-950 shadow-lg backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between rounded-b-2xl">
        {/* Logo / Title - Dynamic based on user role */}
        <div>
          <Link href="/" className="font-bold text-xl flex items-center gap-3 text-white">
            {isAdmin ? (
              <>
                <span className="text-2xl">📊</span>
                <div>
                  <div className="text-base">Smart Healthcare</div>
                  <div className="text-xs font-normal text-white/80">Admin Portal</div>
                </div>
              </>
            ) : isDoctor ? (
              <>
                <span className="text-2xl">👨‍⚕️</span>
                <div>
                  <div className="text-base">Smart Healthcare</div>
                  <div className="text-xs font-normal text-white/80">Doctor Portal</div>
                </div>
              </>
            ) : user && userRole === "patient" ? (
              <>
                <span className="text-2xl">👤</span>
                <div>
                  <div className="text-base">Smart Healthcare</div>
                  <div className="text-xs font-normal text-white/80">Patient Portal</div>
                </div>
              </>
            ) : (
              <>
                <span className="text-2xl">🏥</span>
                <span>Smart Healthcare</span>
              </>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-6 flex-1 justify-between">
          {/* Navigation Links - Show for non-logged users and logged-in patients */}
          {isMounted && !isDoctor && !isAdmin && (
            <nav className="hidden md:flex gap-2 ml-8">
              {(user && userRole === "patient" ? patientLinks : !user ? links : []).map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 text-white/90 hover:bg-white/10 hover:text-white ${
                    pathname === l.href ? "bg-white/20 text-white font-bold shadow-md" : ""
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Spacer for role-specific layouts without nav links */}
          {isMounted && (isDoctor || isAdmin) && <div className="flex-1"></div>}

          {/* User Info & Actions */}
          {isMounted && user ? (
            <div className="flex items-center gap-4">
              {/* Role-specific Navigation Buttons */}
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <>
                    <Link href="/admin/reports" className={`text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 ${pathname === '/admin/reports' ? 'bg-white/20 text-white font-bold shadow-md' : 'text-white/90 hover:bg-white/10'}`}>
                      📊 Reports
                    </Link>
                    <Link href="/admin/users" className={`text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 ${pathname === '/admin/users' ? 'bg-white/20 text-white font-bold shadow-md' : 'text-white/90 hover:bg-white/10'}`}>
                      👥 Users
                    </Link>
                    <Link href="/dashboard" className={`text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 ${pathname === '/dashboard' ? 'bg-white/20 text-white font-bold shadow-md' : 'text-white/90 hover:bg-white/10'}`}>
                      🏥 Hospital
                    </Link>
                  </>
                ) : isDoctor ? (
                  <>
                    <Link href="/doctor/dashboard" className={`text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 ${pathname === '/doctor/dashboard' ? 'bg-white/20 text-white font-bold shadow-md' : 'text-white/90 hover:bg-white/10'}`}>📊 Dashboard</Link>
                    <Link href="/doctor/records" className={`text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 ${pathname === '/doctor/records' ? 'bg-white/20 text-white font-bold shadow-md' : 'text-white/90 hover:bg-white/10'}`}>📋 Records</Link>
                    <Link href="/doctor/scan-qr" className={`text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 ${pathname === '/doctor/scan-qr' ? 'bg-white/20 text-white font-bold shadow-md' : 'text-white/90 hover:bg-white/10'}`}>📱 Scan QR</Link>
                  </>
                ) : (
                  <>
                    <Link href="/dashboard" className={`text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 ${pathname === '/dashboard' ? 'bg-white/20 text-white font-bold shadow-md' : 'text-white/90 hover:bg-white/10'}`}>
                      Dashboard
                    </Link>
                    <Link href="/profile" className={`text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 ${pathname === '/profile' ? 'bg-white/20 text-white font-bold shadow-md' : 'text-white/90 hover:bg-white/10'}`}>
                      Health Card
                    </Link>
                    <Link href="/my-records" className={`text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 ${pathname === '/my-records' ? 'bg-white/20 text-white font-bold shadow-md' : 'text-white/90 hover:bg-white/10'}`}>
                      My Records
                    </Link>
                  </>
                )}
              </div>

              {/* User Welcome & Logout - Grouped together on the right */}
              <div className="flex items-center gap-3 ml-2 pl-3 border-l border-white/20">
                {/* User Name Display */}
                {userName && (
                  <div className="hidden lg:block text-right">
                    <div className="text-xs text-white/70">Welcome,</div>
                    <div className="font-semibold text-white text-sm">{userName}</div>
                  </div>
                )}

                {/* Logout Button */}
                <button
                  onClick={() => logout()}
                  className="text-sm px-4 py-2 rounded-lg font-medium bg-white/10 border border-white/20 text-white hover:bg-red-500/30 hover:border-red-400/50 transition-all duration-200"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          ) : isMounted ? (
            <Link href="/login" className="text-sm px-5 py-2.5 rounded-lg font-medium bg-white/10 text-white hover:bg-white/20 transition-all duration-200 shadow-md border border-white/20">
              🔐 Login
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
