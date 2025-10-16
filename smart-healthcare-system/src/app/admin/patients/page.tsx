"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  digitalHealthCardId?: string;
  medicalHistory?: string;
}

export default function AdminPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/patients/profile?all=true");
      const data = await response.json();
      if (data.patients) {
        setPatients(data.patients);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mb-2"
          >
            <span className="text-blue-500">📊</span>
            <span className="text-sm">Dashboard</span>
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
            className="flex items-center gap-3 px-4 py-3 bg-blue-500 text-white rounded-lg mb-2"
          >
            <span>👥</span>
            <span className="text-sm font-medium">Patients</span>
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
            <h1 className="text-xl font-semibold">Patient Management</h1>
            
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
                <button className="p-1">
                  <span className="text-gray-400">▼</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {/* Search Bar */}
          <div className="bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Patients: <span className="font-semibold text-gray-900 dark:text-gray-100">{patients.length}</span>
                {searchTerm && ` | Showing: ${filteredPatients.length}`}
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                + Add New Patient
              </button>
            </div>
            <input
              type="text"
              placeholder="Search patients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Patients Grid */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading patients...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No patients found</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatients.map((patient) => (
                  <div 
                    key={patient._id}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl font-semibold">
                          {patient.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        ⋮
                      </button>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {patient.name}
                    </h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                      {patient.email}
                    </p>
                    
                    {patient.digitalHealthCardId && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-mono">
                        🆔 {patient.digitalHealthCardId}
                      </p>
                    )}
                    
                    {patient.phone && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        📞 {patient.phone}
                      </p>
                    )}
                    
                    {patient.dateOfBirth && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        🎂 {new Date(patient.dateOfBirth).toLocaleDateString()}
                      </p>
                    )}
                    
                    {patient.gender && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        👤 {patient.gender}
                      </p>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex gap-2">
                        <button className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30">
                          View Details
                        </button>
                        <button className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600">
                          Medical Records
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
