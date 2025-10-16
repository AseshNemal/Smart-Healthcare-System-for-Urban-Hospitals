"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function ScanQRPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [qrInput, setQrInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [patientData, setPatientData] = useState<any>(null);
  const [medicalRecord, setMedicalRecord] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanMethod, setScanMethod] = useState<"camera" | "manual">("camera");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/doctor/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (showScanner && scanMethod === "camera") {
      // Initialize QR scanner
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scanner.render(onScanSuccess, onScanError);
      scannerRef.current = scanner;

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
        }
      };
    }
  }, [showScanner, scanMethod]);

  const onScanSuccess = (decodedText: string) => {
    console.log("QR Code scanned:", decodedText);
    setQrInput(decodedText);
    setShowScanner(false);
    
    // Clear scanner
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
    }

    // Auto-process the scanned data
    processQRData(decodedText);
  };

  const onScanError = (errorMessage: string) => {
    // Ignore routine scanning errors
    if (!errorMessage.includes("NotFoundException")) {
      console.warn("QR Scan error:", errorMessage);
    }
  };

  const processQRData = async (qrData: string) => {
    setError("");
    setLoading(true);
    setPatientData(null);
    setMedicalRecord(null);

    try {
      // Parse QR code data
      const data = JSON.parse(qrData);
      
      if (!data.id || !data.email) {
        setError("Invalid QR code format");
        setLoading(false);
        return;
      }

      // Fetch patient profile by email
      const profileRes = await fetch(`/api/patients/profile?email=${data.email}`);
      const profileData = await profileRes.json();

      if (!profileRes.ok) {
        setError(profileData.error || "Patient not found");
        setLoading(false);
        return;
      }

      setPatientData(profileData);

      // Fetch medical records
      const recordsRes = await fetch(`/api/medical-records?email=${data.email}`);
      const recordsData = await recordsRes.json();

      if (recordsRes.ok) {
        setMedicalRecord(recordsData.medicalRecord);
      }

    } catch (err: any) {
      console.error("Scan error:", err);
      setError("Failed to parse QR code. Please ensure it's valid JSON format.");
    } finally {
      setLoading(false);
    }
  };

  const handleScanQR = async () => {
    if (!qrInput.trim()) {
      setError("Please enter QR code data");
      return;
    }
    processQRData(qrInput);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-foreground/70">Please login to access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📱 Scan Patient Health Card</h1>
          <p className="text-foreground/70 mt-2">Quickly access patient information via QR code</p>
        </div>
        <Link 
          href="/doctor/records"
          className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
        >
          ← Back to Records
        </Link>
      </div>

      {/* Scan Method Selection */}
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Choose Scan Method</h2>
        
        <div className="flex gap-3">
          <button
            onClick={() => {
              setScanMethod("camera");
              setShowScanner(false);
              setError("");
            }}
            className={`flex-1 px-5 py-3 rounded-md text-sm font-medium transition-all ${
              scanMethod === "camera"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            📷 Camera Scan
          </button>
          <button
            onClick={() => {
              setScanMethod("manual");
              setShowScanner(false);
              setError("");
            }}
            className={`flex-1 px-5 py-3 rounded-md text-sm font-medium transition-all ${
              scanMethod === "manual"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            ⌨️ Manual Entry
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Camera Scanner */}
        {scanMethod === "camera" && (
          <div className="space-y-4">
            {!showScanner ? (
              <div className="text-center py-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-6xl mb-4">📱</div>
                <p className="text-foreground/70 mb-4">Ready to scan patient health card</p>
                <button
                  onClick={() => setShowScanner(true)}
                  disabled={loading}
                  className="px-6 py-3 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  📷 Start Camera Scanner
                </button>
                <p className="text-xs text-foreground/60 mt-4">
                  Click the button above to activate your camera and scan the QR code
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                  <div id="qr-reader" className="w-full"></div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowScanner(false);
                      if (scannerRef.current) {
                        scannerRef.current.clear().catch(console.error);
                      }
                    }}
                    className="px-5 py-2.5 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                  >
                    ⏹️ Stop Scanner
                  </button>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    <strong>📱 Instructions:</strong>
                  </p>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1 list-disc list-inside">
                    <li>Point your camera at the patient's health card QR code</li>
                    <li>Make sure the QR code is clearly visible and well-lit</li>
                    <li>Hold steady until the scan completes</li>
                    <li>Patient information will appear automatically below</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Entry */}
        {scanMethod === "manual" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                QR Code Data (JSON format)
              </label>
              <textarea
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-background h-32 font-mono text-sm"
                placeholder='{"id":"HC-XXXXXXXXXX","name":"John Doe","email":"john@example.com","bloodGroup":"A+"}'
              />
              <p className="text-xs text-foreground/60 mt-1">
                💡 Example format: {`{"id":"HC-5NMW1ACU4K","name":"John Doe","email":"john@example.com","bloodGroup":"A+"}`}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleScanQR}
                disabled={loading}
                className="px-5 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "⏳ Loading..." : "🔍 Process QR Data"}
              </button>

              <button
                onClick={() => {
                  setQrInput("");
                  setPatientData(null);
                  setMedicalRecord(null);
                  setError("");
                }}
                className="px-5 py-2.5 rounded-md bg-gray-200 dark:bg-gray-700 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                🔄 Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Patient Information Display */}
      {patientData && (
        <div className="space-y-6">
          {/* Patient Profile Card */}
          <div className="border-2 border-green-500 rounded-lg p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">✅ Patient Found</h2>
                <p className="text-sm text-foreground/70">Health card verified successfully</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-foreground/60">Health Card ID</div>
                <div className="font-mono font-bold text-green-700 dark:text-green-400">{patientData.digitalHealthCardId}</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-foreground/60">Full Name</div>
                <div className="font-semibold text-lg">{patientData.name}</div>
              </div>
              <div>
                <div className="text-sm text-foreground/60">Email</div>
                <div className="font-medium">{patientData.email}</div>
              </div>
              <div>
                <div className="text-sm text-foreground/60">Phone</div>
                <div className="font-medium">{patientData.phone || "Not provided"}</div>
              </div>
              <div>
                <div className="text-sm text-foreground/60">Date of Birth</div>
                <div className="font-medium">
                  {patientData.dateOfBirth 
                    ? new Date(patientData.dateOfBirth).toLocaleDateString()
                    : "Not provided"}
                </div>
              </div>
              <div>
                <div className="text-sm text-foreground/60">Blood Group</div>
                <div className="font-semibold text-lg text-red-600 dark:text-red-400">
                  {patientData.bloodGroup || "Not specified"}
                </div>
              </div>
              <div>
                <div className="text-sm text-foreground/60">Gender</div>
                <div className="font-medium">{patientData.gender || "Not specified"}</div>
              </div>
            </div>

            {patientData.emergencyContact?.name && (
              <div className="mt-4 pt-4 border-t border-green-300 dark:border-green-700">
                <div className="text-sm font-semibold text-foreground/70 mb-2">🚨 Emergency Contact</div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-foreground/60">Name</div>
                    <div className="font-medium">{patientData.emergencyContact.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-foreground/60">Phone</div>
                    <div className="font-medium">{patientData.emergencyContact.phone}</div>
                  </div>
                  <div>
                    <div className="text-xs text-foreground/60">Relation</div>
                    <div className="font-medium">{patientData.emergencyContact.relation}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Medical Records Summary */}
          {medicalRecord ? (
            <div className="border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">📋 Medical Records Summary</h2>
                <Link 
                  href={`/doctor/records?email=${patientData.email}`}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                >
                  View Full Records →
                </Link>
              </div>

              {/* Patient Summary */}
              <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div>
                  <div className="text-sm text-foreground/60">Allergies</div>
                  <div className="font-medium">
                    {medicalRecord.allergies?.length > 0 
                      ? medicalRecord.allergies.join(", ") 
                      : <span className="text-foreground/50">None recorded</span>}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-foreground/60">Chronic Conditions</div>
                  <div className="font-medium">
                    {medicalRecord.chronicConditions?.length > 0 
                      ? medicalRecord.chronicConditions.join(", ") 
                      : <span className="text-foreground/50">None recorded</span>}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-foreground/60">Total Consultations</div>
                  <div className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                    {medicalRecord.consultations?.length || 0}
                  </div>
                </div>
              </div>

              {/* Recent Consultations */}
              {medicalRecord.consultations && medicalRecord.consultations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Recent Consultations</h3>
                  <div className="space-y-3">
                    {medicalRecord.consultations
                      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 3)
                      .map((consult: any, idx: number) => (
                        <div key={idx} className="border rounded-md p-4 bg-blue-50 dark:bg-blue-900/10">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-semibold">{consult.doctorName}</div>
                              <div className="text-sm text-foreground/70">
                                📅 {new Date(consult.date).toLocaleDateString()} at {new Date(consult.date).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                              </div>
                            </div>
                          </div>
                          {consult.symptoms && (
                            <div className="text-sm mb-2">
                              <span className="font-medium text-foreground/70">Symptoms:</span> {consult.symptoms}
                            </div>
                          )}
                          {consult.diagnoses && consult.diagnoses.length > 0 && (
                            <div className="text-sm">
                              <span className="font-medium text-foreground/70">Diagnosis:</span>{" "}
                              {consult.diagnoses.map((d: any) => d.condition).join(", ")}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                  {medicalRecord.consultations.length > 3 && (
                    <p className="text-sm text-foreground/70 mt-2 text-center">
                      + {medicalRecord.consultations.length - 3} more consultation(s)
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="border rounded-lg p-6 text-center">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-foreground/70">No medical records found for this patient</p>
              <Link 
                href={`/doctor/records?email=${patientData.email}`}
                className="inline-block mt-4 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                Add First Consultation →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!patientData && (
        <div className="border rounded-lg p-6 bg-blue-50 dark:bg-blue-900/20">
          <h3 className="font-semibold mb-3">📚 How to Use</h3>
          
          {scanMethod === "camera" ? (
            <>
              <ol className="space-y-2 text-sm text-foreground/70">
                <li className="flex gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Click the "📷 Start Camera Scanner" button above</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Allow camera access when prompted by your browser</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">3.</span>
                  <span>Ask the patient to show their digital health card QR code</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">4.</span>
                  <span>Point your camera at the QR code (keep it steady and well-lit)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">5.</span>
                  <span>Patient information will appear automatically once scanned!</span>
                </li>
              </ol>
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-400">
                  <strong>✅ Camera Scanning Active:</strong> You can now scan QR codes directly using your device camera!
                </p>
              </div>
            </>
          ) : (
            <>
              <ol className="space-y-2 text-sm text-foreground/70">
                <li className="flex gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Ask the patient to open their Health Card profile page</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Ask them to show the QR code on their health card</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">3.</span>
                  <span>Copy the QR code data (it's a JSON string with patient info)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">4.</span>
                  <span>Paste the data in the text area above and click "Process QR Data"</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">5.</span>
                  <span>View patient details and access their medical records instantly!</span>
                </li>
              </ol>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  <strong>💡 Tip:</strong> For faster scanning, switch to "📷 Camera Scan" mode above!
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
