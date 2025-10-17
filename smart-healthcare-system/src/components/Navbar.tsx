"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useState, useEffect } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/doctors", label: "Doctors" },
  { href: "/appointments", label: "Appointments" },
  { href: "/patients", label: "Patients" },
  { href: "/records", label: "Records" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [userRole, setUserRole] = useState<"patient" | "doctor" | "admin" | null>(null);
  const [userName, setUserName] = useState<string>("");
  
  const isDoctor = pathname?.startsWith("/doctor") || userRole === "doctor";
  const isAdmin = pathname?.startsWith("/admin") || userRole === "admin";

  useEffect(() => {
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
      setUserRole(null);
      setUserName("");
    }
  }, [user]);

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

        <div className="flex items-center gap-6">
          {/* Navigation Links - Only show for non-logged in or patient on public pages */}
          <nav className="hidden md:flex gap-2">
            {!isDoctor && !isAdmin && !user && links.map((l) => (
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

          {/* User Info & Actions */}
          {user ? (
            <div className="flex items-center gap-4">
              {/* User Name Display */}
              {userName && (
                <div className="hidden md:block text-base text-white/80">
                  <div className="">Welcome,</div>
                  <div className="font-semibold text-white">{userName}</div>
                </div>
              )}

              {/* Role-specific Navigation */}
              {isAdmin ? (
                <>
                  <Link href="/admin/reports" className="text-sm px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-all duration-200 shadow-md">
                    📊 Generate Reports
                  </Link>
                  <Link href="/admin/users" className="text-sm px-4 py-2 rounded-lg font-medium text-white/90 hover:bg-white/10">
                    👥 Manage Users
                  </Link>
                  <Link href="/dashboard" className="text-sm px-4 py-2 rounded-lg font-medium text-white/90 hover:bg-white/10">
                    🏥 Hospital View
                  </Link>
                </>
              ) : isDoctor ? (
                <>
                  <Link href="/doctor/dashboard" className={`text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 ${pathname === '/doctor/dashboard' ? 'bg-white/20 text-white font-bold shadow-md border-2 border-white/40' : 'text-white/90 hover:bg-white/10'}`}>📊 Dashboard</Link>
                  <Link href="/doctor/records" className={`text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 ${pathname === '/doctor/records' ? 'bg-white/20 text-white font-bold shadow-md border-2 border-white/40' : 'text-white/90 hover:bg-white/10'}`}>📋 Patient Records</Link>
                  <Link href="/doctor/scan-qr" className={`text-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 ${pathname === '/doctor/scan-qr' ? 'bg-white/20 text-white font-bold shadow-md border-2 border-white/40' : 'text-white/90 hover:bg-white/10'}`}>📱 Scan QR</Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="text-sm px-4 py-2 rounded-lg font-medium text-white/90 hover:bg-green-600/20">
                    📊 Dashboard
                  </Link>
                  <Link href="/profile" className="text-sm px-4 py-2 rounded-lg font-medium text-white/90 hover:bg-purple-600/20">
                    💳 Health Card
                  </Link>
                  <Link href="/my-records" className="text-sm px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-all duration-200 shadow-md">
                    📋 My Records
                  </Link>
                </>
              )}

              {/* Logout Button */}
              <button
                onClick={() => logout()}
                className="text-sm px-4 py-2 rounded-lg font-medium border border-white/30 text-white/90 hover:bg-red-600/20 hover:text-white transition-all duration-200"
              >
                🚪 Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-sm px-4 py-2 rounded-lg font-medium bg-white/10 text-white hover:bg-white/20 transition-all duration-200 shadow-md">
              🔐 Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
