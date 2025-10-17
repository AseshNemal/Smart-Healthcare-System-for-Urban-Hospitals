import AdminLogoutButton from "@/components/AdminLogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Break out of the root layout's centered container and remove root padding (px-4)
  // so admin pages can use full-bleed width without changing the global layout.tsx
  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen -mx-4">
      {children}
      <AdminLogoutButton />
    </div>
  );
}
