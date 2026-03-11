# 🚀 Quick Start Guide - Doctor BDD Tests

## 📋 WHAT ARE THESE FILES?

This folder contains **automated tests** that act like a robot user testing your doctor portal.
They simulate a real doctor logging in, selecting patients, and adding medical records.

---

## 📁 FILE EXPLANATIONS

### 1. **README.md** (Documentation)
   - **What it is**: Instructions and overview
   - **You don't run this**: It's just documentation to read
   - **Purpose**: Explains what the tests do and basic commands

### 2. **TEST_SETUP_GUIDE.ts** (Setup Instructions)
   - **What it is**: Detailed guide for creating test accounts
   - **You don't run this**: It's a reference guide
   - **Purpose**: Tells you how to set up doctor and patient accounts for testing

### 3. **doctor-fixtures.ts** (Helper Code)
   - **What it is**: Shared code that logs in a doctor automatically
   - **You don't run this directly**: Other tests use this
   - **Purpose**: Avoids repeating login code in every test
   - **Contains**: Your test doctor credentials (y@gmail.com / 123456)

### 4. **doctor-login.spec.ts** (Test File ⭐)
   - **What it is**: Tests for doctor login functionality
   - **YOU CAN RUN THIS**: Yes! This is a test file
   - **What it tests**:
     - ✅ Can doctor log in with correct password?
     - ✅ Does wrong password show an error?
     - ✅ Can't access dashboard without login?
     - ✅ Are all login form elements visible?

### 5. **doctor-patient-records.spec.ts** (Test File ⭐)
   - **What it is**: Tests for managing patient records
   - **YOU CAN RUN THIS**: Yes! This is a test file
   - **What it tests**:
     - ✅ Can doctor navigate to records page?
     - ✅ Can doctor select patient from dropdown?
     - ✅ Can doctor search patient by email?
     - ✅ Can doctor open "Add New Record" form?
     - ✅ Can doctor fill and submit consultation?
     - ✅ Does validation work for empty fields?
     - ✅ Can doctor add multiple diagnoses?
     - ✅ Can doctor add multiple prescriptions?
     - ✅ Can doctor cancel adding a record?
   - **Uses**: doctor-fixtures.ts (auto-login feature)

### 6. **doctor-e2e-workflow.spec.ts** (Test File ⭐⭐⭐ BEST TO START)
   - **What it is**: Complete end-to-end test of entire doctor workflow
   - **YOU CAN RUN THIS**: Yes! This is the MAIN test
   - **What it tests**: The COMPLETE journey:
     1. 🔐 Doctor logs in
     2. 🚪 Navigates to patient records
     3. 🔍 Searches for a patient by email
     4. ➕ Opens "Add New Record" form
     5. 📝 Fills in symptoms, observations, vital signs
     6. 🏥 Adds diagnosis with severity
     7. 💊 Adds multiple prescriptions
     8. 💾 Saves the consultation
   - **This is the most realistic test**: It does everything a real doctor would do

---

## 🎯 WHICH FILE TO RUN FIRST?

### **RECOMMENDED ORDER:**

### **Step 1: Run the End-to-End Test First (EASIEST)**
This tests everything at once and is easiest to understand:

```bash
npx playwright test tests/doctor-bdd-tests/doctor-e2e-workflow.spec.ts --headed
```

**What happens:**
- Browser opens (you can see it!)
- Automatically goes to login page
- Logs in with y@gmail.com
- Goes to patient records
- Searches for test.patient@example.com
- Fills out a complete medical record
- Saves it
- Closes

**If this works**: Your system is working perfectly! ✅

---

### **Step 2: Run Login Tests (SIMPLE)**
Tests just the login functionality:

```bash
npx playwright test tests/doctor-bdd-tests/doctor-login.spec.ts --headed
```

**What happens:**
- Tests various login scenarios
- Valid login, invalid login, etc.

---

### **Step 3: Run Patient Records Tests (DETAILED)**
Tests detailed patient record operations:

```bash
npx playwright test tests/doctor-bdd-tests/doctor-patient-records.spec.ts --headed
```

**What happens:**
- Tests every button and form on the records page
- Selecting from dropdown, searching, adding records, etc.

---

### **Step 4: Run All Tests Together (COMPLETE)**
Run everything at once:

```bash
npx playwright test tests/doctor-bdd-tests --headed
```

---

## 🛠️ BEFORE RUNNING - PREREQUISITES

### ✅ 1. Make sure your app is running:
```bash
npm run dev
```
Your app should be running on http://localhost:3000

### ✅ 2. Make sure MongoDB is connected:
Your database should be running and connected

### ✅ 3. Make sure test accounts exist:

**Doctor Account** (already in doctor-fixtures.ts):
- Email: `y@gmail.com`
- Password: `123456`
- This doctor must be registered in your system!

**Patient Account** (tests will search for this):
- Email: `test.patient@example.com`
- You can register this via http://localhost:3000/register

---

## 📖 UNDERSTANDING THE OUTPUT

When you run a test, you'll see:

```
✓ tests/doctor-bdd-tests/doctor-e2e-workflow.spec.ts:20:3 › End-to-End Scenario
✓ Step 1: Doctor successfully logged in
✓ Step 2: Navigated to patient records page
✓ Step 3: Searched for patient
✓ Step 4: Opened add new consultation form
✓ Step 5a: Filled symptoms and observations
✓ Step 5b: Recorded vital signs
✓ Step 5c: Added diagnosis
✓ Step 5d: Added prescription
✓ Step 5e: Added second prescription
✓ Step 6: Clicked save consultation button
✓ Step 7: Consultation form closed successfully
✓ End-to-End Test Completed Successfully!
```

**✓ = Test Passed (Green)**
**✗ = Test Failed (Red)**

---

## 🐛 TROUBLESHOOTING

### Problem: "Test doctor account does not exist"
**Solution**: Register the doctor account:
1. Go to http://localhost:3000/doctor/register
2. Register with:
   - Email: y@gmail.com
   - Password: 123456
   - Name: Dr. Test Doctor
   - Specialty: General Practitioner

### Problem: "Patient not found"
**Solution**: Register a test patient:
1. Go to http://localhost:3000/register
2. Register with:
   - Email: test.patient@example.com
   - Password: TestPatient123!
   - Fill in other details

### Problem: "Cannot connect to localhost:3000"
**Solution**: Start your dev server:
```bash
npm run dev
```

### Problem: "Tests run too fast, can't see what's happening"
**Solution**: Add `--headed --slowMo=500` to slow it down:
```bash
npx playwright test tests/doctor-bdd-tests/doctor-e2e-workflow.spec.ts --headed --slowMo=500
```

---

## 📊 COMPARISON: Files You Run vs Files You Don't

| File | Can You Run It? | What It Does |
|------|----------------|--------------|
| README.md | ❌ No (just read) | Documentation |
| TEST_SETUP_GUIDE.ts | ❌ No (just read) | Setup instructions |
| doctor-fixtures.ts | ❌ No (helper code) | Auto-login code for other tests |
| doctor-login.spec.ts | ✅ YES - RUN THIS | Tests login functionality |
| doctor-patient-records.spec.ts | ✅ YES - RUN THIS | Tests patient record management |
| doctor-e2e-workflow.spec.ts | ⭐ YES - START HERE | Tests complete workflow |

---

## 🎬 QUICK COMMANDS CHEAT SHEET

```bash
# 1️⃣ START HERE - Run the main end-to-end test (with browser visible)
npx playwright test tests/doctor-bdd-tests/doctor-e2e-workflow.spec.ts --headed

# 2️⃣ Run all doctor tests
npx playwright test tests/doctor-bdd-tests

# 3️⃣ Run with slower speed to see what's happening
npx playwright test tests/doctor-bdd-tests/doctor-e2e-workflow.spec.ts --headed --slowMo=1000

# 4️⃣ Run in UI mode (interactive, best for debugging)
npx playwright test tests/doctor-bdd-tests/doctor-e2e-workflow.spec.ts --ui

# 5️⃣ Run specific test by name
npx playwright test tests/doctor-bdd-tests -g "Doctor logs in with valid credentials"

# 6️⃣ View HTML report after tests
npx playwright show-report
```

---

## 🎯 SUMMARY

**START WITH THIS COMMAND:**
```bash
npx playwright test tests/doctor-bdd-tests/doctor-e2e-workflow.spec.ts --headed
```

This will:
1. Open a browser window
2. Log in as a doctor
3. Select a patient
4. Add a complete medical record
5. Save it
6. Show you ✓ if everything works

**If it works**: Congratulations! Your doctor portal is working perfectly! 🎉

**If it fails**: Read the error message - it will tell you exactly what's wrong (usually missing doctor/patient account).

---

Need help? Check the error messages - they're designed to be helpful! 😊
