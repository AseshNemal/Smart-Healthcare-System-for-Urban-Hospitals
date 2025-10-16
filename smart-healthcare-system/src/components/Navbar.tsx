"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

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
  
  const isDoctor = pathname?.startsWith("/doctor");

  return (
    <header className="border-b sticky top-0 z-50 bg-background/80 backdrop-blur">
      <div className="container mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">Smart Healthcare</Link>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-4">
            {!isDoctor && links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 ${
                  pathname === l.href ? "font-semibold underline underline-offset-4" : ""
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          {user ? (
            <div className="flex items-center gap-3">
              {isDoctor ? (
                <Link href="/doctor/dashboard" className="text-sm px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                  Doctor Dashboard
                </Link>
              ) : (
                <Link href="/dashboard" className="text-sm px-3 py-2 rounded-md bg-foreground text-background hover:opacity-90">
                  Dashboard
                </Link>
              )}
              <button
                onClick={() => logout()}
                className="text-sm px-3 py-2 rounded-md border hover:bg-black/5 dark:hover:bg-white/10"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {isDoctor ? (
                <Link href="/doctor/login" className="text-sm px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                  Doctor Login
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-sm px-3 py-2 rounded-md bg-foreground text-background hover:opacity-90">
                    Patient Login
                  </Link>
                  <Link href="/doctor/login" className="text-sm px-3 py-2 rounded-md border hover:bg-black/5 dark:hover:bg-white/10">
                    Doctor
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
