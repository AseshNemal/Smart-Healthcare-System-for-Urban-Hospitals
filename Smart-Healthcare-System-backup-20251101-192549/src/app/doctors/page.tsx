import dbConnect from "../../lib/mongodb";
import { Doctor } from "../../models";
import DoctorsClient from "./DoctorsClient";

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

  return <DoctorsClient doctors={doctors} />;
}


