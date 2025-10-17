# 🏥 Smart Healthcare System for Urban Hospitals

**Project Type:** Group Project - Web-Based Healthcare Management System  
**Date:** October 17, 2025

## 👥 Project Team

| Student ID | Name | Role |
|------------|------|------|
| **IT23236264** | **L A Nemal** | **Lead Developer** |
| IT23241114 | Sasanka W D S G S | Developer |
| IT23140998 | Hansika R A K | Developer |
| IT23236882 | Karawita K V D Y R | Developer |

---

## 📋 Project Overview

A comprehensive digital healthcare management system designed for urban hospitals to streamline patient care, appointment scheduling, medical records management, and administrative operations. The system provides three distinct portals for Patients, Doctors, and Healthcare Managers with role-based access control.

### 🎯 Project Goals

- **Improve Patient Experience** - Easy appointment booking and digital health cards
- **Enhance Doctor Efficiency** - Quick access to patient records via QR scanning
- **Enable Data-Driven Decisions** - Comprehensive statistical reports and analytics
- **Ensure Security** - JWT-based authentication with role-based access
- **Modernize Operations** - Digital transformation of hospital workflows

---

## 🌟 Key Features

### 👥 Patient Portal
- ✅ Email/Password & Google OAuth Registration
- ✅ Appointment Booking with Available Doctors
- ✅ Digital Health Card with QR Code
- ✅ Print-Ready Health Card Design
- ✅ Personal Medical Records Access
- ✅ Appointment History Dashboard

### 👨‍⚕️ Doctor Portal
- ✅ Secure Doctor Authentication
- ✅ Camera-Based QR Code Scanner
- ✅ Patient Record Management
- ✅ Appointment Schedule View
- ✅ Add/Edit Medical Records
- ✅ Quick Patient Lookup

### 📊 Healthcare Manager Portal (Admin)
- ✅ **Statistical Reports** - Comprehensive analytics
- ✅ **Interactive Charts** - Line charts, donut charts, bar charts
- ✅ **Advanced Filtering** - Date range, department, doctor filters
- ✅ **Financial Reports** - Revenue tracking and analysis
- ✅ **User Management** - Manage system access
- ✅ **Data Export** - Print and export capabilities

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js 15.5.5 (App Router with React 19)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS v4
- **Build Tool:** Turbopack (faster builds)
- **Charts:** Recharts 3.2.1 (data visualization)
- **QR Scanner:** html5-qrcode 2.3.8

### Backend
- **Runtime:** Node.js 20+
- **Database:** MongoDB Atlas (Cloud)
- **ODM:** Mongoose 8.19.1
- **Authentication:** Firebase Auth + JWT
- **Security:** bcryptjs 3.0.2 (password hashing)

### Testing
- **Framework:** Jest 30.2.0
- **React Testing:** @testing-library/react 16.3.0
- **Coverage:** Istanbul (built-in)
- **Test Count:** 52 passing tests (100% pass rate)

### Development Tools
- **Linter:** Biome 2.2.0
- **Package Manager:** npm
- **Version Control:** Git/GitHub

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| **Total Components** | 20+ React Components |
| **API Endpoints** | 15+ REST APIs |
| **Database Models** | 6 Mongoose Schemas |
| **Test Coverage** | 85% Code Coverage |
| **Total Tests** | 52 Passing Tests |
| **Pages** | 25+ Routes |
| **Dependencies** | 15 Production, 14 Dev |

---

## 🏗️ Project Structure

```
Smart-Healthcare-System-for-Urban-Hospitals/
├── README.md (This file)
├── USE_CASE_03_JUSTIFICATION.md
├── smart-healthcare-system/
│   ├── README.md (Technical Documentation)
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── biome.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx (Home)
│   │   │   ├── layout.tsx (Root Layout)
│   │   │   ├── globals.css
│   │   │   │
│   │   │   ├── login/ (Multi-role Login)
│   │   │   ├── register/ (Patient Registration)
│   │   │   ├── dashboard/ (Patient Dashboard)
│   │   │   ├── profile/ (Digital Health Card)
│   │   │   ├── my-records/ (Medical Records)
│   │   │   │
│   │   │   ├── doctor/
│   │   │   │   ├── login/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── records/
│   │   │   │   └── scan-qr/ (QR Scanner)
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── reports/ (Statistical Reports)
│   │   │   │   ├── users/ (User Management)
│   │   │   │   └── finance/ (Finance Module)
│   │   │   │
│   │   │   └── api/
│   │   │       ├── doctors/
│   │   │       ├── appointments/
│   │   │       ├── patients/
│   │   │       ├── records/
│   │   │       └── admin/
│   │   │
│   │   ├── components/
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── AdminLogoutButton.tsx
│   │   │
│   │   ├── lib/
│   │   │   ├── firebase.ts (Firebase Config)
│   │   │   └── mongodb.ts (DB Connection)
│   │   │
│   │   ├── models/
│   │   │   └── index.ts (Mongoose Schemas)
│   │   │
│   │   └── __tests__/
│   │       ├── business-logic.test.ts (27 tests)
│   │       ├── utils/helpers.test.ts (13 tests)
│   │       └── integration/reports.test.ts (12 tests)
│   │
│   ├── public/ (Static Assets)
│   │
│   └── Documentation/
│       ├── TESTING.md (Testing Guide)
│       ├── TEST_SUMMARY.md (Test Results)
│       ├── TEST_REPORT_PASSED.md (Detailed Report)
│       ├── STATISTICAL_REPORTS.md
│       ├── REPORTS_QUICK_START.md
│       ├── CAMERA_SCAN_FEATURE.md
│       ├── QR_SCANNER.md
│       ├── ADMIN_PORTAL_GUIDE.md
│       ├── DOCTOR_PORTAL.md
│       └── MULTI_USER_LOGIN.md
```

---

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 20+
npm or yarn
MongoDB Atlas Account
Firebase Project (with Authentication enabled)
```

### Installation Steps

1. **Clone the Repository**
```bash
git clone https://github.com/AseshNemal/Smart-Healthcare-System-for-Urban-Hospitals.git
cd Smart-Healthcare-System-for-Urban-Hospitals/smart-healthcare-system
```

2. **Install Dependencies**
```bash
npm install
# Installs 395+ packages (29 direct dependencies)
```

3. **Configure Environment Variables**
```bash
# .env.local already configured with:
# - MONGODB_URI (MongoDB Atlas)
# - Firebase Configuration
# - JWT Secrets
# - Admin Credentials
```

4. **Run Development Server**
```bash
npm run dev
# Starts on http://localhost:3000
```

5. **Run Tests**
```bash
npm test
# Runs 52 unit tests
```

6. **Build for Production**
```bash
npm run build
npm start
```

---

## 🎯 Use Cases Implemented

### Use Case 01: Patient Registration & Login ✅
- Email/Password registration
- Google OAuth integration
- Session management
- Protected routes

### Use Case 02: Book Appointment ✅
- Browse available doctors
- Select date and time
- Appointment confirmation
- Appointment history

### Use Case 03: Generate Statistical Reports ✅
**Status:** FULLY IMPLEMENTED  
**Justification Document:** [USE_CASE_03_JUSTIFICATION.md](./USE_CASE_03_JUSTIFICATION.md)

**Key Features:**
- Patient visit analytics
- Service utilization charts
- Financial reports integration
- Advanced filtering (date, department, doctor)
- Interactive data visualization
- Peak hours analysis
- Utilization rate calculations

**Enhancements Beyond Original Spec:**
- Real-time chart updates
- Financial integration module
- Print/export capabilities
- Mobile-responsive design
- Three-view layout (Charts, Tables, Summary)

### Additional Features ✅
- Digital Health Cards with QR codes
- QR Code Scanner for doctors
- Medical Records Management
- User Role Management
- Soft Delete Implementation
- Multi-role Authentication

---

## 🧪 Testing

### Test Results
✅ **52/52 Tests Passing (100% Pass Rate)**

**Test Suites:**
1. **Business Logic Tests** - 27 tests ✅
   - Authentication validation
   - Patient data validation
   - Appointment validation
   - Payment calculations
   - Statistics calculations
   - Chart transformations
   - Report generation

2. **Utility Functions** - 13 tests ✅
   - Password hashing (bcrypt)
   - JWT token generation/verification
   - Date utilities
   - Data validation

3. **Integration Tests** - 12 tests ✅
   - Patient visit reports
   - Financial reports
   - Error handling

### Run Tests
```bash
npm test                # All tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

**Coverage:** ~85% (Lines, Statements, Branches, Functions)

**Detailed Report:** [TEST_REPORT_PASSED.md](./smart-healthcare-system/TEST_REPORT_PASSED.md)

---

## 📚 Documentation

### User Guides
- [📖 Patient User Guide](./smart-healthcare-system/README.md#for-patients)
- [👨‍⚕️ Doctor Portal Guide](./smart-healthcare-system/DOCTOR_PORTAL.md)
- [📊 Admin Portal Guide](./smart-healthcare-system/ADMIN_PORTAL_GUIDE.md)

### Feature Documentation
- [📊 Statistical Reports](./smart-healthcare-system/STATISTICAL_REPORTS.md)
- [📱 QR Code Scanner](./smart-healthcare-system/CAMERA_SCAN_FEATURE.md)
- [🆔 Digital Health Cards](./smart-healthcare-system/README.md#digital-health-card)
- [🔐 Multi-User Login](./smart-healthcare-system/MULTI_USER_LOGIN.md)

### Technical Documentation
- [🧪 Testing Guide](./smart-healthcare-system/TESTING.md)
- [📊 Test Summary](./smart-healthcare-system/TEST_SUMMARY.md)
- [✅ Test Report](./smart-healthcare-system/TEST_REPORT_PASSED.md)
- [📝 Use Case 03 Justification](./USE_CASE_03_JUSTIFICATION.md)

---

## 🔐 Security Features

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Password Hashing** - bcrypt with salt rounds
- ✅ **Role-Based Access** - Patient, Doctor, Admin roles
- ✅ **Protected Routes** - Middleware validation
- ✅ **Input Sanitization** - XSS prevention
- ✅ **Email Validation** - Regex-based validation
- ✅ **Secure Sessions** - Firebase session management

---

## 📊 Database Schema

### Models (Mongoose)

**1. Patient Model**
```typescript
{
  name: string
  email: string (unique)
  phone: string
  dateOfBirth: Date
  bloodGroup: string (A+, A-, B+, B-, AB+, AB-, O+, O-)
  address: string
  emergencyContact: string
  createdAt: Date
}
```

**2. Doctor Model**
```typescript
{
  name: string
  email: string (unique)
  specialty: string
  phone: string
  schedule: Array<{day, startTime, endTime}>
  createdAt: Date
}
```

**3. Appointment Model**
```typescript
{
  patientId: ObjectId
  doctorId: ObjectId
  patientName: string
  patientEmail: string
  date: Date
  time: string
  reason: string
  service: string
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: Date
}
```

**4. Record Model**
```typescript
{
  patientId: ObjectId
  doctorId: ObjectId
  diagnosis: string
  prescription: string
  notes: string
  visitDate: Date
  createdAt: Date
}
```

**5. Admin Model**
```typescript
{
  name: string
  email: string (unique)
  password: string (hashed)
  role: 'admin' | 'manager'
  createdAt: Date
}
```

**6. Payment Model**
```typescript
{
  appointmentId: ObjectId
  amount: number
  service: string
  status: 'pending' | 'completed'
  paymentDate: Date
}
```

---

## 📈 Features Comparison

| Feature | Original Plan | Current Implementation | Status |
|---------|--------------|----------------------|--------|
| Patient Registration | Basic | Firebase Auth + Google OAuth | ✅ Enhanced |
| Appointment Booking | Basic | With Time Slots & Validation | ✅ Enhanced |
| Statistical Reports | Basic | Advanced with Charts & Filters | ✅ Enhanced |
| Doctor Portal | Not Planned | Fully Implemented | ✅ Added |
| QR Scanner | Not Planned | Camera-Based Scanning | ✅ Added |
| Digital Health Cards | Not Planned | QR + Print Support | ✅ Added |
| Financial Reports | Not Planned | Integrated Module | ✅ Added |
| Unit Testing | Not Planned | 52 Tests, 85% Coverage | ✅ Added |

---

## 🎓 Academic Context

**Course:** Software Engineering / Healthcare IT  
**Project Type:** Group Project Implementation  
**Institution:** SLIIT (Sri Lanka Institute of Information Technology)

**Team Members:**
- **IT23236264** - L A Nemal (Lead Developer)
- **IT23241114** - Sasanka W D S G S
- **IT23140998** - Hansika R A K
- **IT23236882** - Karawita K V D Y R

**Focus Areas:**
- Use Case 03 - Generate Statistical Reports
- Patient Management System
- Doctor Portal with QR Scanner
- Admin Dashboard & Analytics

**Key Deliverables:**
1. ✅ Fully Functional Web Application
2. ✅ Use Case 03 Implementation with Justification
3. ✅ Comprehensive Unit Testing (52 tests)
4. ✅ Technical Documentation
5. ✅ Test Reports and Coverage Analysis
6. ✅ Source Code with Git History

---

## 🚀 Deployment

### Recommended Platform: Vercel

**Deployment Steps:**
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy from main branch

**Environment Variables Required:**
```
MONGODB_URI=<your_mongodb_atlas_uri>
NEXT_PUBLIC_FIREBASE_API_KEY=<firebase_api_key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<firebase_auth_domain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<firebase_project_id>
ADMIN_JWT_SECRET=<your_jwt_secret>
```

**Production URL:** TBD

---

## 📊 Project Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Planning & Design | Week 1-2 | ✅ Complete |
| Patient Portal | Week 3-4 | ✅ Complete |
| Doctor Portal | Week 5-6 | ✅ Complete |
| Admin Portal | Week 7-8 | ✅ Complete |
| Statistical Reports | Week 9-10 | ✅ Complete |
| Testing & QA | Week 11 | ✅ Complete |
| Documentation | Week 12 | ✅ Complete |

---

## 🤝 Contributing

This is an academic project. For collaboration or questions:
- **Repository:** [GitHub](https://github.com/AseshNemal/Smart-Healthcare-System-for-Urban-Hospitals)
- **Student ID:** IT23201200
- **Email:** Available in project documentation

---

## 📝 License

This project is for academic purposes only.

---

## 🙏 Acknowledgments

- Next.js Team for the amazing framework
- Firebase for authentication services
- MongoDB Atlas for cloud database
- Recharts for data visualization
- SLIIT Faculty for guidance

---

## 📞 Support & Contact

For technical issues or questions:
1. Check documentation in `/smart-healthcare-system/` folder
2. Review test reports for system validation
3. Refer to Use Case 03 justification document

---

**Built with ❤️ for Urban Hospital Management**  
**Team:** IT23236264, IT23241114, IT23140998, IT23236882  
**Version:** 2.0.0  
**Last Updated:** October 17, 2025  
**Status:** ✅ Production Ready
