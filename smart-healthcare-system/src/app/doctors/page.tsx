import Link from "next/link";

const doctors = [
  { id: 1, name: "Dr. A. Perera", specialty: "Cardiologist" },
  { id: 2, name: "Dr. S. Fernando", specialty: "Pediatrician" },
  { id: 3, name: "Dr. K. De Silva", specialty: "Dermatologist" },
];

export default function DoctorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Doctors</h1>
        <p className="text-foreground/70">Browse available specialists.</p>
      </div>

      <ul className="grid md:grid-cols-2 gap-4">
        {doctors.map((d) => (
          <li key={d.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{d.name}</div>
                <div className="text-sm text-foreground/70">{d.specialty}</div>
              </div>
              <Link href={`/appointments?doctorId=${d.id}`} className="text-sm px-3 py-2 rounded-md bg-foreground text-background">
                Book
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
