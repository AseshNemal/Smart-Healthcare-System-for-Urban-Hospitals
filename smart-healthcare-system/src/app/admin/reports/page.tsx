"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Statistics {
  totalVisits: number;
  averageDailyVisits: number;
  peakHours: string;
  utilizationRate: number;
}

interface ChartData {
  visitsOverTime: Array<{ date: string; visits: number }>;
  serviceUtilization: Array<{ name: string; value: number; percentage: number }>;
}

interface PatientDetail {
  patientName: string;
  visitDate: string;
  doctor: string;
  department: string;
  serviceType: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#E5E7EB"];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"Charts" | "Tables" | "Summary">("Charts");
  const [reportType, setReportType] = useState("Patient Visits");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [department, setDepartment] = useState("All Departments");
  const [doctor, setDoctor] = useState("All Doctors");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState<any[]>([]);
  
  const [statistics, setStatistics] = useState<Statistics>({
    totalVisits: 0,
    averageDailyVisits: 0,
    peakHours: "N/A",
    utilizationRate: 0,
  });
  
  const [chartData, setChartData] = useState<ChartData>({
    visitsOverTime: [],
    serviceUtilization: [],
  });
  
  const [patientDetails, setPatientDetails] = useState<PatientDetail[]>([]);

  const reportTypes = ["Patient Visits", "Service Utilization", "Doctor Performance", "Financial Summary"];
  const departments = ["All Departments", "Cardiology", "Neurology", "Orthopedics", "Rehabilitation"];

  // Fetch doctors list
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("/api/doctors");
        const data = await response.json();
        if (data.doctors) {
          setDoctors(data.doctors);
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    };
    fetchDoctors();
  }, []);

  // Auto-generate initial report on mount
  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        reportType,
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end }),
        ...(department && { department }),
        ...(doctor && { doctorId: doctor }),
      });

      const response = await fetch(`/api/reports?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate report");
      }

      if (data.success) {
        setStatistics(data.data.statistics);
        setChartData(data.data.chartData);
        setPatientDetails(data.data.appointments);
        
        if (data.message) {
          setError(data.message);
        }
      }
    } catch (err: any) {
      setError(err.message || "Unable to retrieve data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setReportType("Patient Visits");
    setDateRange({ start: "", end: "" });
    setDepartment("All Departments");
    setDoctor("All Doctors");
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{payload[0].payload.name || payload[0].payload.date}</p>
          <p className="text-sm text-blue-600">
            {payload[0].name}: {payload[0].value}
            {payload[0].payload.percentage && ` (${payload[0].payload.percentage}%)`}
          </p>
        </div>
      );
    }
    return null;
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
            href="/admin/reports" 
            className="flex items-center gap-3 px-4 py-3 bg-blue-500 text-white rounded-lg mb-2"
          >
            <span>📊</span>
            <span className="text-sm font-medium">Reports</span>
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
            <h1 className="text-xl font-semibold">Generate Reports</h1>
            
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
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 p-6 mb-6">
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <label htmlFor="reportType" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Report Type
                </label>
                <select
                  id="reportType"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {reportTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="dateRange" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Date Range
                </label>
                <input
                  id="dateRange"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="mm/dd/yyyy"
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Department
                </label>
                <select
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="doctor" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Doctor
                </label>
                <select
                  id="doctor"
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="All Doctors">All Doctors</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Reset Filters
              </button>
              <button
                onClick={generateReport}
                disabled={loading}
                className="px-5 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-400 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-8 px-6">
                {(["Charts", "Tables", "Summary"] as const).map((tab) => (
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

          <div className="p-8">
            {/* Charts Tab */}
            {activeTab === "Charts" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Patient Visits Over Time */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-base mb-6 text-gray-900 dark:text-gray-100">Patient Visits Over Time</h3>
                    {chartData.visitsOverTime.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={chartData.visitsOverTime}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            stroke="#9CA3AF"
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            stroke="#9CA3AF"
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Line 
                            type="monotone" 
                            dataKey="visits" 
                            stroke="#0EA5E9" 
                            strokeWidth={3}
                            dot={{ fill: "#0EA5E9", r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[280px] flex items-center justify-center text-gray-400">
                        No data available
                      </div>
                    )}
                  </div>

                  {/* Service Utilization */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-base mb-4 text-gray-900 dark:text-gray-100">Service Utilization</h3>
                    {chartData.serviceUtilization.length > 0 ? (
                      <div className="flex flex-col items-center">
                        <ResponsiveContainer width="100%" height={240}>
                          <PieChart>
                            <Pie
                              data={chartData.serviceUtilization}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={100}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {chartData.serviceUtilization.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                        
                        {/* Utilization Rate in Center */}
                        <div className="absolute transform -translate-y-32">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                              {statistics.utilizationRate}%
                            </div>
                          </div>
                        </div>
                        
                        {/* Legend */}
                        <div className="flex flex-wrap gap-4 mt-4 justify-center">
                          {chartData.serviceUtilization.map((item, index) => (
                            <div key={item.name} className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-[280px] flex items-center justify-center text-gray-400">
                        No data available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tables Tab */}
            {activeTab === "Tables" && (
              <div>
                <h3 className="font-semibold text-base mb-6 text-gray-900 dark:text-gray-100">Patient Details</h3>
                {patientDetails.length > 0 ? (
                  <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left px-6 py-4 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            PATIENT NAME
                          </th>
                          <th className="text-left px-6 py-4 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            VISIT DATE
                          </th>
                          <th className="text-left px-6 py-4 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            DOCTOR
                          </th>
                          <th className="text-left px-6 py-4 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            DEPARTMENT
                          </th>
                          <th className="text-left px-6 py-4 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            SERVICE TYPE
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientDetails.map((patient, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-750"
                          >
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                              {patient.patientName}
                            </td>
                            <td className="px-6 py-4 text-sm text-blue-600 dark:text-blue-400">
                              {patient.visitDate}
                            </td>
                            <td className="px-6 py-4 text-sm text-blue-600 dark:text-blue-400">
                              {patient.doctor}
                            </td>
                            <td className="px-6 py-4 text-sm text-blue-600 dark:text-blue-400">
                              {patient.department}
                            </td>
                            <td className="px-6 py-4 text-sm text-blue-600 dark:text-blue-400">
                              {patient.serviceType}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    No patient details available
                  </div>
                )}
              </div>
            )}

            {/* Summary Tab */}
            {activeTab === "Summary" && (
              <div>
                <h3 className="font-semibold text-base mb-8 text-gray-900 dark:text-gray-100">Summary</h3>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                      Average Daily Visits
                    </p>
                    <p className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                      {statistics.averageDailyVisits}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                      Peak Hours
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {statistics.peakHours}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                      Utilization Rate
                    </p>
                    <p className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                      {statistics.utilizationRate}%
                    </p>
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
