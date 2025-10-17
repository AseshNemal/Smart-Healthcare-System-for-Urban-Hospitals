"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<"General" | "Users" | "System" | "Security">("General");
  const [systemSettings, setSystemSettings] = useState({
    hospitalName: "Digital Health System",
    address: "123 Healthcare Ave, Medical City",
    phone: "+1 (555) 123-4567",
    email: "admin@digitalhealthsystem.com",
    timezone: "UTC-5",
    language: "English",
  });

  const handleSaveSettings = () => {
    // Save settings logic here
    alert("Settings saved successfully!");
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
            className="flex items-center gap-3 px-4 py-3 bg-blue-500 text-white rounded-lg"
          >
            <span>⚙️</span>
            <span className="text-sm font-medium">Settings</span>
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
            <h1 className="text-xl font-semibold">System Settings</h1>
            
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
          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-8 px-6">
                {(["General", "Users", "System", "Security"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {/* General Settings Tab */}
              {activeTab === "General" && (
                <div className="max-w-3xl">
                  <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">
                    General Settings
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Hospital Name
                      </label>
                      <input
                        type="text"
                        value={systemSettings.hospitalName}
                        onChange={(e) => setSystemSettings({...systemSettings, hospitalName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Address
                      </label>
                      <input
                        type="text"
                        value={systemSettings.address}
                        onChange={(e) => setSystemSettings({...systemSettings, address: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={systemSettings.phone}
                          onChange={(e) => setSystemSettings({...systemSettings, phone: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Email
                        </label>
                        <input
                          type="email"
                          value={systemSettings.email}
                          onChange={(e) => setSystemSettings({...systemSettings, email: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Timezone
                        </label>
                        <select
                          value={systemSettings.timezone}
                          onChange={(e) => setSystemSettings({...systemSettings, timezone: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="UTC-5">Eastern Time (UTC-5)</option>
                          <option value="UTC-6">Central Time (UTC-6)</option>
                          <option value="UTC-7">Mountain Time (UTC-7)</option>
                          <option value="UTC-8">Pacific Time (UTC-8)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Language
                        </label>
                        <select
                          value={systemSettings.language}
                          onChange={(e) => setSystemSettings({...systemSettings, language: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="English">English</option>
                          <option value="Spanish">Spanish</option>
                          <option value="French">French</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleSaveSettings}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === "Users" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      User Management
                    </h2>
                    <Link 
                      href="/admin/users"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                      View All Users
                    </Link>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400">
                    Manage user accounts, roles, and permissions for the healthcare system.
                  </p>
                </div>
              )}

              {/* System Tab */}
              {activeTab === "System" && (
                <div>
                  <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">
                    System Configuration
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Database Status</h3>
                      <p className="text-sm text-green-600 dark:text-green-400">✓ Connected</p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">API Status</h3>
                      <p className="text-sm text-green-600 dark:text-green-400">✓ Operational</p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Storage</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Used: 2.5 GB / 100 GB</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "Security" && (
                <div>
                  <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">
                    Security Settings
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Login Notifications</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Get notified of new login attempts</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <h3 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Session Timeout</h3>
                      <select className="w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
