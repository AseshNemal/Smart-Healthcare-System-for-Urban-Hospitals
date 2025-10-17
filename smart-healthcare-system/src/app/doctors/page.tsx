import Link from "next/link";
import dbConnect from "../../lib/mongodb";
import { Doctor } from "../../models";

async function getDoctors() {
  try {
    await dbConnect();
    
    // Check if we have doctors, if not seed them
    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0) {
      const initialDoctors = [
        // Cardiology
        { name: "Dr. A. Perera", specialty: "Cardiologist", email: "a.perera@hospital.com" },
        { name: "Dr. R. Jayawardena", specialty: "Cardiologist", email: "r.jayawardena@hospital.com" },
        
        // Pediatrics
        { name: "Dr. S. Fernando", specialty: "Pediatrician", email: "s.fernando@hospital.com" },
        { name: "Dr. M. Silva", specialty: "Pediatrician", email: "m.silva@hospital.com" },
        
        // Dermatology
        { name: "Dr. K. De Silva", specialty: "Dermatologist", email: "k.desilva@hospital.com" },
        { name: "Dr. L. Wijesinghe", specialty: "Dermatologist", email: "l.wijesinghe@hospital.com" },
        
        // Neurology
        { name: "Dr. N. Bandara", specialty: "Neurologist", email: "n.bandara@hospital.com" },
        { name: "Dr. P. Rajapaksa", specialty: "Neurologist", email: "p.rajapaksa@hospital.com" },
        
        // Orthopedic Surgery
        { name: "Dr. T. Gunasekara", specialty: "Orthopedic Surgeon", email: "t.gunasekara@hospital.com" },
        { name: "Dr. H. Wickramasinghe", specialty: "Orthopedic Surgeon", email: "h.wickramasinghe@hospital.com" },
        
        // General Practice
        { name: "Dr. D. Rathnayake", specialty: "General Practitioner", email: "d.rathnayake@hospital.com" },
        { name: "Dr. C. Amarasinghe", specialty: "General Practitioner", email: "c.amarasinghe@hospital.com" },
        { name: "Dr. V. Dissanayake", specialty: "General Practitioner", email: "v.dissanayake@hospital.com" },
        
        // Ophthalmology
        { name: "Dr. G. Mendis", specialty: "Ophthalmologist", email: "g.mendis@hospital.com" },
        { name: "Dr. I. Hewage", specialty: "Ophthalmologist", email: "i.hewage@hospital.com" },
        
        // Psychiatry
        { name: "Dr. J. Perera", specialty: "Psychiatrist", email: "j.perera@hospital.com" },
        { name: "Dr. W. Senanayake", specialty: "Psychiatrist", email: "w.senanayake@hospital.com" },
      ];
      await Doctor.insertMany(initialDoctors);
    }
    
    const doctors = await Doctor.find({}).select('_id name specialty').lean();
    
    // Convert MongoDB documents to plain objects with string IDs
    return doctors.map((doc: any) => ({
      id: doc._id.toString(),
      name: doc.name,
      specialty: doc.specialty,
    }));
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }
}

export default async function DoctorsPage() {
  const doctors = await getDoctors();

  // Group doctors by specialty
  const doctorsBySpecialty = doctors.reduce((acc: any, doctor) => {
    if (!acc[doctor.specialty]) {
      acc[doctor.specialty] = [];
    }
    acc[doctor.specialty].push(doctor);
    return acc;
  }, {});

  const specialtyIcons: { [key: string]: string } = {
    'Cardiologist': '❤️',
    'Pediatrician': '👶',
    'Dermatologist': '✨',
    'Neurologist': '🧠',
    'Orthopedic Surgeon': '🦴',
    'General Practitioner': '🩺',
    'Ophthalmologist': '👁️',
    'Psychiatrist': '🧘',
  };

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-2">
          <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">👨‍⚕️ Our Medical Team</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
          Meet Our Specialists
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
          Connect with experienced healthcare professionals dedicated to your wellbeing<br />
          {doctors.length > 0 && `  ${doctors.length} doctors available`}
        </p>
      </div>

      {doctors.length === 0 ? (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">👨‍⚕️</div>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">No doctors available at the moment.</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Visit <Link href="/admin/seed-doctors" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">/admin/seed-doctors</Link> to add doctors to the database.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(doctorsBySpecialty).map(([specialty, docs]: [string, any]) => (
            <div key={specialty} className="space-y-6">
              {/* Specialty Header */}
              <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-100 dark:border-blue-800/30">
                <span className="text-3xl">{specialtyIcons[specialty] || '⚕️'}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{specialty}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{docs.length} specialist{docs.length > 1 ? 's' : ''} available</p>
                </div>
              </div>

              {/* Doctors Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {docs.map((doctor: any) => (
                  <div 
                    key={doctor.id} 
                    className="group bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-100 dark:hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="space-y-4">
                      {/* Doctor Avatar & Info */}
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center text-3xl flex-shrink-0">
                          👨‍⚕️
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate">
                            {doctor.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{doctor.specialty}</p>
                        </div>
                      </div>

                      {/* Quick Info */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <span>🏥</span>
                          <span>Available for appointments</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <span>⭐</span>
                          <span>Board certified specialist</span>
                        </div>
                      </div>

                      {/* Book Button */}
                      <Link 
                        href={`/appointments?doctorId=${doctor.id}&doctorName=${encodeURIComponent(doctor.name)}`} 
                        className="block text-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold transition-all hover:scale-105 shadow-md"
                      >
                        📅 Book Appointment
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call to Action */}
      {doctors.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-blue-900/10 dark:via-cyan-900/10 dark:to-indigo-900/10 rounded-3xl p-8 md:p-12 border border-blue-100 dark:border-blue-800/30 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Need Help Choosing?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">
            Not sure which specialist to see? Our general practitioners can help guide you to the right care.
          </p>
          <div className="flex gap-4 items-center justify-center flex-wrap">
            <Link 
              href="/contact" 
              className="px-6 py-3 rounded-xl bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-semibold hover:shadow-lg transition-all border border-blue-200 dark:border-blue-700"
            >
              📞 Contact Us
            </Link>
            <Link 
              href="/dashboard" 
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all"
            >
              📋 View My Appointments
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

