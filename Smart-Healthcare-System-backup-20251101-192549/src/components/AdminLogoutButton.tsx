"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    try {
      setLoading(true);
      await fetch('/api/admin/logout', { method: 'POST' });
      // Also clear any Firebase session if present by navigating to /login
      router.push('/login');
    } catch (e) {
      // Best-effort: even on error, navigate away
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      title="Logout"
      aria-label="Logout"
      className="fixed bottom-6 right-6 z-[60] inline-flex items-center gap-2 rounded-full bg-red-600 text-white px-5 py-3 shadow-lg hover:bg-red-700 active:scale-95 transition disabled:opacity-70"
      disabled={loading}
    >
      <span className="text-lg">🚪</span>
      <span className="font-medium">{loading ? 'Logging out…' : 'Logout'}</span>
    </button>
  );
}
