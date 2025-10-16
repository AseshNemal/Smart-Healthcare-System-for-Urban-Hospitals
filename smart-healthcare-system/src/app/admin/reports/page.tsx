"use client";

import { useState, useEffect } from "react";
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">📊</span>
            </div>
            <h1 className="text-2xl font-bold">Generate Reports</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-2xl">👤</span>
              <div className="text-sm">
                <p className="font-semibold">Healthcare Manager</p>
                <p className="text-xs text-foreground/60">Admin</p>
              </div>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm">
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div>
              <label htmlFor="reportType" className="block text-sm font-medium mb-2">
                Report Type
              </label>
              <select
                id="reportType"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-background"
              >
                {reportTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dateRange" className="block text-sm font-medium mb-2">
                Date Range
              </label>
              <input
                id="dateRange"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full border rounded-md px-3 py-2 bg-background"
                placeholder="mm/dd/yyyy"
              />
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium mb-2">
                Department
              </label>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-background"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="doctor" className="block text-sm font-medium mb-2">
                Doctor
              </label>
              <select
                id="doctor"
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-background"
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
              className="px-5 py-2.5 rounded-md bg-gray-200 dark:bg-gray-700 text-foreground text-sm font-medium hover:opacity-90"
            >
              Reset Filters
            </button>
            <button
              onClick={generateReport}
              disabled={loading}
              className="px-5 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-6 px-6">
              {(["Charts", "Tables", "Summary"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-foreground/60 hover:text-foreground hover:border-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Charts Tab */}
            {activeTab === "Charts" && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Patient Visits Over Time */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-4">Patient Visits Over Time</h3>
                    {chartData.visitsOverTime.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData.visitsOverTime}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line type="monotone" dataKey="visits" stroke="#0088FE" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-foreground/60">
                        No data available
                      </div>
                    )}
                  </div>

                  {/* Service Utilization */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-4">Service Utilization</h3>
                    {chartData.serviceUtilization.length > 0 ? (
                      <div className="flex flex-col items-center">
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={chartData.serviceUtilization}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              fill="#8884d8"
                              paddingAngle={5}
                              dataKey="value"
                              label
                            >
                              {chartData.serviceUtilization.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap gap-3 mt-4 justify-center">
                          {chartData.serviceUtilization.map((item, index) => (
                            <div key={item.name} className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-sm">{item.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-foreground/60">
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
                <h3 className="font-semibold text-lg mb-4">Patient Details</h3>
                {patientDetails.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          <th className="text-left px-4 py-3 font-medium text-sm">PATIENT NAME</th>
                          <th className="text-left px-4 py-3 font-medium text-sm">VISIT DATE</th>
                          <th className="text-left px-4 py-3 font-medium text-sm">DOCTOR</th>
                          <th className="text-left px-4 py-3 font-medium text-sm">DEPARTMENT</th>
                          <th className="text-left px-4 py-3 font-medium text-sm">SERVICE TYPE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientDetails.map((patient, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <td className="px-4 py-3">{patient.patientName}</td>
                            <td className="px-4 py-3 text-blue-600 dark:text-blue-400">
                              {patient.visitDate}
                            </td>
                            <td className="px-4 py-3 text-blue-600 dark:text-blue-400">
                              {patient.doctor}
                            </td>
                            <td className="px-4 py-3 text-blue-600 dark:text-blue-400">
                              {patient.department}
                            </td>
                            <td className="px-4 py-3 text-blue-600 dark:text-blue-400">
                              {patient.serviceType}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-foreground/60">
                    No patient details available
                  </div>
                )}
              </div>
            )}

            {/* Summary Tab */}
            {activeTab === "Summary" && (
              <div>
                <h3 className="font-semibold text-lg mb-6">Summary</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">Average Daily Visits</p>
                    <p className="text-4xl font-bold">{statistics.averageDailyVisits}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">Peak Hours</p>
                    <p className="text-2xl font-bold">{statistics.peakHours}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">Utilization Rate</p>
                    <p className="text-4xl font-bold">{statistics.utilizationRate}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-foreground/60">
          © 2025 Digital Health System
        </div>
      </div>
    </div>
  );
}
