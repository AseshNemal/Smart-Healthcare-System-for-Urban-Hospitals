"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthProvider";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    address: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    fetchPatientProfile();
  }, [user, router]);

  const fetchPatientProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/patients/profile?email=${user?.email}`);
      const data = await res.json();

      if (res.ok) {
        setPatient(data);
        // Generate QR code URL using the health card ID
        if (data.digitalHealthCardId) {
          const qrData = encodeURIComponent(JSON.stringify({
            id: data.digitalHealthCardId,
            name: data.name,
            email: data.email,
            bloodGroup: data.bloodGroup,
          }));
          setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`);
        }

        // Prefill form values
        const dob = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
        const dobStr = dob ? new Date(dob.getTime() - dob.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : "";
        setForm({
          name: data.name || "",
          phone: data.phone && data.phone !== "Not provided" ? data.phone : "",
          dateOfBirth: dobStr,
          gender: data.gender || "",
          bloodGroup: data.bloodGroup || "",
          address: data.address && data.address !== "Not provided" ? data.address : "",
        });
      } else {
        setError(data.error || "Failed to load profile");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const onCancel = () => {
    // Reset form from current patient data and exit edit mode
    if (patient) {
      const dob = patient.dateOfBirth ? new Date(patient.dateOfBirth) : null;
      const dobStr = dob ? new Date(dob.getTime() - dob.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : "";
      setForm({
        name: patient.name || "",
        phone: patient.phone && patient.phone !== "Not provided" ? patient.phone : "",
        dateOfBirth: dobStr,
        gender: patient.gender || "",
        bloodGroup: patient.bloodGroup || "",
        address: patient.address && patient.address !== "Not provided" ? patient.address : "",
      });
    }
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const onSave = async () => {
    setError("");
    setSuccess("");

    // Basic validation
    if (!form.name.trim()) {
      setError("Full Name is required");
      return;
    }

    try {
      setSaving(true);
      const updates: any = {
        name: form.name.trim(),
        phone: form.phone.trim() || "Not provided",
        gender: form.gender || "Other",
        bloodGroup: form.bloodGroup || undefined,
        address: form.address.trim() || "Not provided",
      };
      if (form.dateOfBirth) {
        updates.dateOfBirth = new Date(form.dateOfBirth);
      }

      const res = await fetch("/api/patients/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email,
          updates,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update profile");
        return;
      }

      // Refresh local state
      if (data.patient) {
        setPatient(data.patient);
      } else {
        await fetchPatientProfile();
      }
      setSuccess("Profile updated successfully");
      setIsEditing(false);
    } catch (e: any) {
      setError(e.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="text-4xl mb-4">🏥</div>
        <p className="text-foreground/70">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="text-4xl mb-4">👤</div>
        <p className="text-foreground/70">No profile found. Please complete your registration.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          /* Hide everything except the health card */
          body * {
            visibility: hidden;
          }
          
          #health-card,
          #health-card * {
            visibility: visible;
          }
          
          #health-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
          }
          
          /* Hide print button when printing */
          .no-print {
            display: none !important;
          }
          
          /* Ensure health card looks good when printed */
          #health-card {
            border: 2px solid #3b82f6;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="no-print">
        <h1 className="text-3xl font-bold">👤 My Profile</h1>
        <p className="text-foreground/70 mt-1">View your personal information and digital health card</p>
      </div>

      {/* Digital Health Card */}
      <div id="health-card" className="border-2 border-blue-500 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 shadow-lg">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
              🏥 DIGITAL HEALTH CARD
            </div>
            <h2 className="text-2xl font-bold">{patient.name}</h2>
            <p className="text-sm text-foreground/70 mt-1">{patient.email}</p>
          </div>
          {qrCodeUrl && (
            <div className="bg-white p-2 rounded-lg shadow-md">
              <img 
                src={qrCodeUrl} 
                alt="Health Card QR Code" 
                className="w-32 h-32"
              />
              <p className="text-xs text-center mt-1 text-foreground/60">Scan to verify</p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
            <div className="text-xs text-foreground/60 mb-1">Card ID</div>
            <div className="font-mono font-bold text-blue-600 dark:text-blue-400">
              {patient.digitalHealthCardId || "Not assigned"}
            </div>
          </div>
          <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
            <div className="text-xs text-foreground/60 mb-1">Blood Group</div>
            <div className="font-bold text-red-600 dark:text-red-400">
              {patient.bloodGroup || "Not specified"}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-foreground/60">
          <span>🔒 Secure</span>
          <span>•</span>
          <span>Issued: {new Date(patient.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Personal Information (view/edit) */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">\ud83d\udccb Personal Information</h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm rounded-md border hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="px-4 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {success && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-2 rounded">
            {success}
          </div>
        )}
        {error && isEditing && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {!isEditing ? (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-foreground/70">Full Name</label>
                <p className="text-lg font-medium mt-1">{patient.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70">Email</label>
                <p className="text-lg font-medium mt-1">{patient.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70">Phone Number</label>
                <p className="text-lg font-medium mt-1">{patient.phone || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70">Date of Birth</label>
                <p className="text-lg font-medium mt-1">
                  {patient.dateOfBirth 
                    ? new Date(patient.dateOfBirth).toLocaleDateString() 
                    : "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70">Gender</label>
                <p className="text-lg font-medium mt-1">{patient.gender || "Not specified"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70">Blood Group</label>
                <p className="text-lg font-medium mt-1">{patient.bloodGroup || "Not specified"}</p>
              </div>
            </div>

            <div className="mt-6">
              <label className="text-sm font-medium text-foreground/70">Address</label>
              <p className="text-lg font-medium mt-1">{patient.address || "Not provided"}</p>
            </div>
          </>
        ) : (
          <form className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-foreground/70">Full Name</label>
              <input
                id="name"
                type="text"
                className="mt-1 w-full border rounded-md px-3 py-2 bg-background"
                placeholder="Your full name"
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-foreground/70">Email</label>
              <input
                id="email"
                type="email"
                className="mt-1 w-full border rounded-md px-3 py-2 bg-gray-100 dark:bg-gray-800/50"
                value={patient.email}
                disabled
                aria-disabled
              />
            </div>
            <div>
              <label htmlFor="phone" className="text-sm font-medium text-foreground/70">Phone Number</label>
              <input
                id="phone"
                type="tel"
                className="mt-1 w-full border rounded-md px-3 py-2 bg-background"
                placeholder="e.g. +1 555 123 4567"
                value={form.phone}
                onChange={(e) => onChange("phone", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="dob" className="text-sm font-medium text-foreground/70">Date of Birth</label>
              <input
                id="dob"
                type="date"
                className="mt-1 w-full border rounded-md px-3 py-2 bg-background"
                value={form.dateOfBirth}
                onChange={(e) => onChange("dateOfBirth", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="gender" className="text-sm font-medium text-foreground/70">Gender</label>
              <select
                id="gender"
                className="mt-1 w-full border rounded-md px-3 py-2 bg-background"
                value={form.gender}
                onChange={(e) => onChange("gender", e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="bloodGroup" className="text-sm font-medium text-foreground/70">Blood Group</label>
              <select
                id="bloodGroup"
                className="mt-1 w-full border rounded-md px-3 py-2 bg-background"
                value={form.bloodGroup}
                onChange={(e) => onChange("bloodGroup", e.target.value)}
              >
                <option value="">Not specified</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="address" className="text-sm font-medium text-foreground/70">Address</label>
              <textarea
                id="address"
                className="mt-1 w-full border rounded-md px-3 py-2 bg-background"
                placeholder="Street, City, State, ZIP"
                rows={3}
                value={form.address}
                onChange={(e) => onChange("address", e.target.value)}
              />
            </div>
          </form>
        )}
      </div>

      {/* Emergency Contact */}
      {patient.emergencyContact && (
        <div className="border rounded-lg p-6 bg-red-50 dark:bg-red-900/10">
          <h3 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">
            🚨 Emergency Contact
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground/70">Name</label>
              <p className="text-lg font-medium mt-1">
                {patient.emergencyContact.name || "Not provided"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/70">Phone</label>
              <p className="text-lg font-medium mt-1">
                {patient.emergencyContact.phone || "Not provided"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/70">Relation</label>
              <p className="text-lg font-medium mt-1">
                {patient.emergencyContact.relation || "Not provided"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Health Card Features */}
      <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-800">
        <h3 className="text-lg font-bold mb-3">✨ Digital Health Card Features</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span><strong>Unique ID:</strong> Each patient has a unique digital health card ID</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span><strong>QR Code:</strong> Quick verification at hospitals and clinics</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span><strong>Secure:</strong> Encrypted data with access control</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✓</span>
            <span><strong>Portable:</strong> Access your health card anywhere, anytime</span>
          </li>
        </ul>
      </div>

      {/* Download Card Button */}
      <div className="text-center">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg"
        >
          🖨️ Print Health Card
        </button>
      </div>
    </div>
  );
}
