"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  totalDoctors: number;
  todayAppointments: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalAppointments: 0,
    totalDoctors: 0,
    todayAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // Fetch patients
      const patientsRes = await fetch("/api/patients/profile?all=true");
      const patientsData = await patientsRes.json();
      
      // Fetch appointments
      const appointmentsRes = await fetch("/api/appointments");
      const appointmentsData = await appointmentsRes.json();
      
      // Fetch doctors
      const doctorsRes = await fetch("/api/doctors");
      const doctorsData = await doctorsRes.json();

      // Count today's appointments
      const today = new Date().toISOString().split('T')[0];
      const todayCount = appointmentsData.appointments?.filter((apt: any) => 
        apt.date?.startsWith(today)
      ).length || 0;

      setStats({
        totalPatients: patientsData.patients?.length || 0,
        totalAppointments: appointmentsData.appointments?.length || 0,
        totalDoctors: doctorsData.doctors?.length || 0,
        todayAppointments: todayCount,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const adminLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
              <span className="text-white text-lg">⚡</span>
            </div>
            <span className="font-bold text-lg">Digital Health</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <Link 
            href="/admin/dashboard" 
            className="flex items-center gap-3 px-4 py-3 bg-blue-500 text-white rounded-lg mb-2"
          >
            <span>📊</span>
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          
          <Link 
            href="/admin/appointments" 
            className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mb-2"
          >
            <span className="text-blue-500">📅</span>
            <span className="text-sm">Appointments</span>
          </Link>
          
          <Link 
            href="/admin/patients" 
            className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mb-2"
          >
            <span className="text-blue-500">👥</span>
            <span className="text-sm">Patients</span>
          </Link>

          <Link 
            href="/admin/finance" 
            className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mb-2"
          >
            <span className="text-blue-500">💰</span>
            <span className="text-sm">Finance</span>
          </Link>
          
          <Link 
            href="/admin/reports" 
            className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mb-2"
          >
            <span className="text-blue-500">📊</span>
            <span className="text-sm">Reports</span>
          </Link>
          
          <Link 
            href="/admin/settings" 
            className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <span className="text-blue-500">⚙️</span>
            <span className="text-sm">Settings</span>
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
          © 2025 Digital Health System
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <span className="text-xl">🔔</span>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">A</span>
                </div>
                <div className="text-sm">
                  <p className="font-semibold">Healthcare Manager</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
                <button
                  onClick={adminLogout}
                  className="ml-2 px-3 py-1.5 rounded-md border text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Logout admin"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {/* Stats Cards */}
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Overview</h2>
            
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading dashboard data...</p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">👥</span>
                      <span className="text-sm text-gray-500">Total</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalPatients}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Patients</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">📅</span>
                      <span className="text-sm text-gray-500">All Time</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalAppointments}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Appointments</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">👨‍⚕️</span>
                      <span className="text-sm text-gray-500">Active</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalDoctors}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Doctors</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">📋</span>
                      <span className="text-sm text-green-500">Today</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.todayAppointments}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Today's Appointments</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Quick Actions</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link 
                      href="/admin/appointments"
                      className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-center"
                    >
                      <span className="text-2xl mb-2 block">📅</span>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-400">View Appointments</p>
                    </Link>

                    <Link 
                      href="/admin/patients"
                      className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-center"
                    >
                      <span className="text-2xl mb-2 block">👥</span>
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">Manage Patients</p>
                    </Link>

                    <Link 
                      href="/admin/reports"
                      className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-center"
                    >
                      <span className="text-2xl mb-2 block">📊</span>
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-400">Generate Reports</p>
                    </Link>

                    <Link 
                      href="/admin/users"
                      className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-center"
                    >
                      <span className="text-2xl mb-2 block">👨‍⚕️</span>
                      <p className="text-sm font-medium text-orange-700 dark:text-orange-400">Manage Users</p>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
