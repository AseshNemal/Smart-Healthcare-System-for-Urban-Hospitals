export default function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Smart Healthcare System</h1>
        <p className="text-foreground/70 max-w-2xl mx-auto">
          A modern platform for urban hospitals to manage doctors, patients, and appointments efficiently.
        </p>
        <div className="flex gap-3 items-center justify-center">
          <a href="/appointments" className="px-5 py-2.5 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90">
            Book an appointment
          </a>
          <a href="/doctors" className="px-5 py-2.5 rounded-md border text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10">
            Browse doctors
          </a>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        {[
          {
            title: "Doctors",
            desc: "View specialties, profiles, and availability.",
            href: "/doctors",
          },
          {
            title: "Appointments",
            desc: "Schedule and manage your hospital visits.",
            href: "/appointments",
          },
          {
            title: "Records",
            desc: "Securely access basic health records.",
            href: "/records",
          },
        ].map((c) => (
          <a key={c.title} href={c.href} className="rounded-lg border p-5 hover:bg-black/5 dark:hover:bg-white/10 transition">
            <h3 className="font-semibold mb-1">{c.title}</h3>
            <p className="text-sm text-foreground/70">{c.desc}</p>
          </a>
        ))}
      </section>
    </div>
  );
}
