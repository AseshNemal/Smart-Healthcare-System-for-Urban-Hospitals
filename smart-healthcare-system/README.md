# Smart Healthcare System 🏥

A modern web application for urban hospitals to manage doctors, patients, and appointments efficiently with Firebase authentication and MongoDB database.

## Features ✨

### Authentication
- ✅ **Email/Password Sign Up & Login** - Secure patient registration
- ✅ **Google OAuth** - One-click sign-in with Google
- ✅ **Protected Routes** - Dashboard accessible only to authenticated users
- ✅ **Session Management** - Persistent login state

### Patient Portal
- 📋 **View Your Appointments** - See all your booked appointments
- ➕ **Book Appointments** - Schedule new appointments with doctors
- 👤 **Personal Account** - Appointments linked to your account
- � **Digital Health Card** - QR code-enabled health card with print functionality
- 📱 **Print Health Card** - Professional print layout for physical cards
- �🔒 **Secure Access** - Only you can see your appointments

### Doctor Portal
- 📊 **Doctor Dashboard** - View your appointments and schedules
- 📋 **Patient Records** - Access and manage patient medical records
- 📱 **QR Code Scanner** - Camera-based health card scanning
- ✏️ **Add Medical Records** - Create and update patient records
- 🔐 **Secure Login** - Separate doctor authentication

### Healthcare Manager Portal (NEW ✨)
- 📊 **Statistical Reports** - Generate comprehensive analytics reports
- 📈 **Data Visualization** - Interactive charts (line, donut)
- 📋 **Patient Details** - Detailed appointment tables
- 🎯 **Key Metrics** - Average visits, peak hours, utilization rates
- 🔍 **Advanced Filtering** - Filter by date, department, doctor
- 👥 **User Management** - Manage system users and roles

### Core Features
- 👨‍⚕️ **Doctors Directory** - Browse available specialists
- 📅 **Appointment Booking** - Easy-to-use booking form with time slots
- 🗂️ **Medical Records** - Comprehensive health records management
- 📞 **Contact Information** - Hospital contact details

## Tech Stack 🛠️

- **Frontend:** Next.js 15.5.5 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **Authentication:** Firebase Auth (Email/Password & Google)
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Charts:** Recharts (Data Visualization)
- **QR Code:** html5-qrcode (Camera Scanning)
- **Build Tool:** Turbopack
- **Linting:** Biome

## Getting Started 🚀

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- MongoDB Atlas account
- Firebase project with Authentication enabled

### Installation

1. Clone and navigate to project:
```bash
cd smart-healthcare-system
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment (`.env.local` already set up with MongoDB connection)

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build for Production
```bash
npm run build
npm start
```

## Usage Guide 📖

### For Patients

1. **Register** - Go to `/register` and create an account (Email/Password or Google)
2. **Login** - Use `/login` to access your account
3. **Dashboard** - View and manage your appointments at `/dashboard`
4. **Book Appointments** - From dashboard, select doctor, date, and confirm

### Navigation

#### Patient Portal
- **Home** (`/`) - Landing page
- **Doctors** (`/doctors`) - Browse specialists
- **Login** (`/login`) - Multi-role login
- **Register** (`/register`) - Create patient account
- **Dashboard** (`/dashboard`) - Your appointments (protected)
- **Profile** (`/profile`) - Digital health card with QR
- **My Records** (`/my-records`) - Medical history
- **Contact** (`/contact`) - Hospital info
- **About** (`/about`) - System info

#### Doctor Portal
- **Doctor Login** (`/doctor/login`) - Doctor authentication
- **Doctor Dashboard** (`/doctor/dashboard`) - Appointments & schedule
- **Patient Records** (`/doctor/records`) - Manage medical records
- **QR Scanner** (`/doctor/scan-qr`) - Camera-based health card scanning

#### Admin Portal (Healthcare Manager)
- **Generate Reports** (`/admin/reports`) - Statistical reports with charts 📊
- **Manage Users** (`/admin/users`) - User management
- **Seed Doctors** (`/admin/seed-doctors`) - Test data

## Project Structure 📁

```
src/
├── app/
│   ├── api/              # API routes (doctors, appointments)
│   ├── dashboard/        # Patient dashboard (protected)
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   └── [other pages]/
├── components/
│   ├── AuthProvider.tsx  # Firebase auth context
│   ├── Navbar.tsx        # Navigation
│   └── Footer.tsx
├── lib/
│   ├── firebase.ts       # Firebase config
│   └── mongodb.ts        # MongoDB connection
└── models/
    └── index.ts          # Mongoose schemas (Doctor, Appointment, Patient)
```

## API Endpoints 🔌

- **GET /api/doctors** - List all doctors
- **GET /api/appointments?email={email}** - Get patient's appointments
- **POST /api/appointments** - Create new appointment

## Database Schema 🗄️

**Doctor:** name, specialty  
**Appointment:** doctorId, patientName, patientEmail, date, reason  
**Patient:** name, email, phone, dateOfBirth (ready for future use)

## Firebase Configuration 🔥

Firebase is configured with:
- Email/Password authentication
- Google Sign-In
- Analytics (browser only)

Configuration in `src/lib/firebase.ts`

## Scripts 📜

- `npm run dev` - Start development server (Turbopack)
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome

## Key Features Documentation 📚

### 📊 Statistical Reports (Healthcare Manager)
**Full Guide:** See [`STATISTICAL_REPORTS.md`](./STATISTICAL_REPORTS.md)  
**Quick Start:** See [`REPORTS_QUICK_START.md`](./REPORTS_QUICK_START.md)

**What it does:**
- Generate comprehensive analytics reports
- Interactive charts (line, donut)
- Filter by date, department, doctor
- Key metrics: avg visits, peak hours, utilization
- Three views: Charts, Tables, Summary

**Access:**
```
URL: /admin/reports
Login: admin@healthcare.com
```

### 📱 QR Code Health Card Scanner
**Full Guide:** See [`CAMERA_SCAN_FEATURE.md`](./CAMERA_SCAN_FEATURE.md)

**What it does:**
- Camera-based QR code scanning
- Instant patient data retrieval
- Manual entry fallback
- Auto-detection of health cards

**Access:**
```
URL: /doctor/scan-qr
Login: doctor credentials
```

### 💳 Digital Health Card
**Features:**
- QR code generation for patients
- Print-optimized layout
- Professional card design
- Accessible from patient profile

**Access:**
```
URL: /profile
Login: patient credentials
```

## Future Enhancements 🚧

### Planned Features
- ✅ ~~Admin dashboard~~ (COMPLETED)
- ✅ ~~Statistical reports~~ (COMPLETED)
- ✅ ~~QR code scanner~~ (COMPLETED)
- ✅ ~~Digital health cards~~ (COMPLETED)
- ⏳ Appointment cancellation with refunds
- ⏳ Email notifications for appointments
- ⏳ SMS reminders
- ⏳ Export reports (PDF/Excel)
- ⏳ Real-time chat with doctors
- ⏳ Telemedicine integration
- ⏳ Payment processing
- ⏳ Insurance integration

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [MongoDB Documentation](https://www.mongodb.com/docs)
- [Recharts Documentation](https://recharts.org/)

## Deployment

Deploy on [Vercel](https://vercel.com/new) - just connect your GitHub repo and deploy!

### Deployment Checklist
1. Set environment variables in Vercel:
   - `MONGODB_URI`
   - `NEXT_PUBLIC_FIREBASE_*` (all Firebase config)
2. Deploy from main branch
3. Create admin user in MongoDB
4. Test all portals (Patient, Doctor, Admin)

---

Built with ❤️ for urban hospital management  
**Version:** 2.0.0 (Statistical Reports Update)  
**Last Updated:** October 16, 2025
