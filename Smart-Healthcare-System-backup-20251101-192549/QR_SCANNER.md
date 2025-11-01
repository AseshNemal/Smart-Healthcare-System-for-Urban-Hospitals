# 📱 QR Code Scanner for Doctors

## Overview

The QR Code Scanner feature allows doctors to quickly access patient information by scanning the QR code on their digital health cards using their device camera or manual entry. This provides instant access to patient details and medical records.

---

## 🚀 How to Access

1. **From Doctor Dashboard:**
   - Login as a doctor
   - Click the **"📱 Scan Health Card"** button on the dashboard

2. **From Navbar:**
   - Look for **"📱 Scan QR"** in the top navigation menu

3. **Direct URL:**
   - Navigate to: `http://localhost:3000/doctor/scan-qr`

---

## 📋 How to Use

### Method 1: Camera Scan (Recommended) ⭐

1. **Select Camera Scan Mode:**
   - Click the **"📷 Camera Scan"** button

2. **Start the Scanner:**
   - Click **"📷 Start Camera Scanner"**
   - Allow camera access when prompted by your browser

3. **Scan the QR Code:**
   - Ask the patient to show their digital health card
   - Point your camera at the QR code
   - Keep the device steady and ensure good lighting
   - The QR code will be scanned automatically

4. **View Results:**
   - Patient information displays instantly
   - Medical records summary shown
   - Click **"View Full Records →"** for complete history

### Method 2: Manual Entry

1. **Select Manual Entry Mode:**
   - Click the **"⌨️ Manual Entry"** button

2. **Get the QR code data:**
   - Patient navigates to `/profile`
   - Patient shows their digital health card with QR code
   - Example format:
   ```json
   {
     "id": "HC-5NMW1ACU4K",
     "name": "John Doe",
     "email": "john@example.com",
     "bloodGroup": "A+"
   }
   ```

3. **Enter the data:**
   - Copy the QR code data
   - Paste it into the text area
   - Click **"🔍 Process QR Data"**

4. **View patient information:**
   - Patient profile displays instantly
   - Medical records summary shown
   - Click **"View Full Records →"** to access complete medical history

---

## 📊 What You'll See

### Patient Profile Card
- ✅ Verification status
- Health Card ID (e.g., HC-XXXXXXXXXX)
- Full name and email
- Phone number
- Date of birth
- Blood group (highlighted in red)
- Gender
- Emergency contact information (if available)

### Medical Records Summary
- Allergies
- Chronic conditions
- Total number of consultations
- Recent consultations (last 3)
  - Doctor name
  - Date and time
  - Symptoms
  - Diagnoses

### Quick Actions
- **View Full Records →** - Opens the complete patient records page
- **Add First Consultation →** - If no records exist yet

---

## 📷 Camera Features

### Supported Devices
- ✅ Desktop computers with webcam
- ✅ Laptops with built-in camera
- ✅ Tablets (iPad, Android tablets)
- ✅ Smartphones (iPhone, Android)

### Browser Compatibility
- ✅ Chrome/Edge (recommended)
- ✅ Safari
- ✅ Firefox
- ✅ Opera

### Camera Permissions
- You'll be prompted to allow camera access
- Permission is required only once per browser
- You can revoke permissions in browser settings
- HTTPS is required for camera access in production

### Scanning Tips
- 📱 Hold device 4-8 inches from QR code
- 💡 Ensure good lighting (avoid glare)
- 🎯 Center the QR code in the scanning area
- ⏱️ Hold steady for 1-2 seconds
- 🔄 Auto-stops after successful scan

---

## 💡 Use Cases

### Emergency Situations
1. Patient arrives unconscious
2. Doctor scans health card QR code with camera
3. Instant access to:
   - Blood group
   - Allergies
   - Chronic conditions
   - Emergency contact

### Quick Consultations
1. Patient shows health card
2. Doctor scans QR code with camera
3. Review medical history instantly
4. Add new consultation seamlessly

### Walk-in Patients
1. New or returning patients
2. Scan health card for verification
3. Access complete medical history
4. No need to search by email

---

## 🎯 Benefits

### For Doctors:
- ⚡ **Instant Access** - Scan with camera, no typing
- 📱 **Mobile-Friendly** - Works on any device with camera
- 🔍 **Quick Verification** - Confirm patient identity in seconds
- 📊 **Complete Overview** - See all relevant information at once
- 🚀 **Faster Workflow** - Camera scanning is 10x faster than manual entry

### For Patients:
- 🚀 **Faster Service** - Reduced wait time
- ✅ **Accurate Records** - No manual entry errors
- 🔒 **Secure** - No sharing of personal credentials
- 📱 **Convenient** - Just show the QR code

---

## 🛠️ Technical Details

### QR Code Library
- **html5-qrcode** - Robust, cross-platform QR scanner
- Supports camera and file upload
- Works on all modern browsers
- No native app required

### QR Code Format
```json
{
  "id": "HC-XXXXXXXXXX",      // Unique 10-character health card ID
  "name": "Patient Name",      // Full name
  "email": "email@example.com", // Email address
  "bloodGroup": "A+"           // Blood group
}
```

### API Endpoints Used
- `GET /api/patients/profile?email={email}` - Fetch patient profile
- `GET /api/medical-records?email={email}` - Fetch medical records

### Data Security
- QR codes contain minimal identifying information
- Full medical records require authentication
- Only accessible by logged-in doctors
- All actions are audit-logged
- Camera access is local (no video uploaded)

---

## 📝 Example Workflow

### Camera Scan Workflow (New!)
```
1. Doctor: Clicks "Start Camera Scanner"
   └─> Camera activates, scanner interface appears

2. Patient: Shows health card QR code
   └─> Digital health card displayed on phone/printed card

3. Doctor: Points camera at QR code
   ├─> QR code detected automatically
   ├─> Data decoded instantly
   └─> Scanner stops automatically

4. System: Validates and retrieves data
   ├─> Patient profile loaded
   ├─> Medical records fetched
   └─> Emergency contact displayed

5. Doctor: Views complete information
   ├─> Reviews allergies: None
   ├─> Checks chronic conditions: Diabetes
   ├─> Reads recent consultations: 5 visits
   └─> Clicks "View Full Records" for details

6. Doctor: Adds new consultation
   └─> Seamless transition to records page
```

---

## ⚙️ Configuration

### Scanner Settings
- **FPS**: 10 frames per second
- **QR Box Size**: 250x250 pixels
- **Aspect Ratio**: 1:1 (square)
- **Auto-stop**: After successful scan

### Customization
Modify scanner settings in `/src/app/doctor/scan-qr/page.tsx`:
```typescript
new Html5QrcodeScanner(
  "qr-reader",
  { 
    fps: 10,              // Scan frequency
    qrbox: { width: 250, height: 250 },  // Scanner box size
    aspectRatio: 1.0,     // Square ratio
  },
  false
);
```

---

## 🔧 Troubleshooting

### Camera Not Working?
1. **Check browser permissions:**
   - Look for camera icon in address bar
   - Click and select "Allow"

2. **HTTPS Required:**
   - Camera only works on HTTPS or localhost
   - Use `https://` in production

3. **Try another browser:**
   - Chrome/Edge recommended
   - Safari works on iOS devices

4. **Check device:**
   - Ensure camera is not in use by another app
   - Restart browser if needed

### QR Code Not Scanning?
1. **Improve lighting** - Avoid shadows and glare
2. **Adjust distance** - 4-8 inches from camera
3. **Clean camera lens** - Wipe if dusty
4. **Center QR code** - Keep it in the scanning box
5. **Try manual entry** - Switch to "⌨️ Manual Entry" mode

### Scan But No Results?
1. Check QR code contains valid JSON
2. Ensure patient exists in database
3. Verify patient email is correct
4. Check network connection

---

## ⚠️ Important Notes

1. **Camera Access:**
   - Required for camera scanning mode
   - Permission requested on first use
   - Can be revoked in browser settings

2. **Patient Requirements:**
   - Patient must have created their health card
   - Health Card ID must be generated (happens automatically)
   - QR code visible on their profile page

3. **Doctor Access:**
   - Only logged-in doctors can access this feature
   - Redirects to login if not authenticated
   - All scans are logged for audit purposes

4. **Privacy:**
   - Camera feed is processed locally
   - No video/images uploaded to server
   - Only decoded QR data is transmitted

---

## 🔗 Related Features

- [Digital Health Card](../PATIENT_HEALTH_CARD.md) - Patient's QR code health card
- [Patient Records](./PATIENT_RECORDS.md) - Complete medical records management
- [Doctor Dashboard](./DOCTOR_DASHBOARD.md) - Doctor portal overview

---

## 📞 Support

If you encounter issues:
1. Ensure the patient has created their health card
2. Check camera permissions in browser
3. Try switching between camera and manual modes
4. Verify the QR data is in correct JSON format
5. Check that you're logged in as a doctor
6. Contact system administrator if problems persist

---

**Last Updated:** October 16, 2025
**Version:** 2.0.0
**Feature Status:** ✅ Active (Camera + Manual Entry)

---

## 🚀 How to Access

1. **From Doctor Dashboard:**
   - Login as a doctor
   - Click the **"📱 Scan Health Card"** button on the dashboard

2. **From Navbar:**
   - Look for **"📱 Scan QR"** in the top navigation menu

3. **Direct URL:**
   - Navigate to: `http://localhost:3000/doctor/scan-qr`

---

## 📋 How to Use

### Method 1: Manual QR Data Entry (Current)

1. **Ask the patient** to open their Health Card profile page:
   - Patient navigates to `/profile`
   - Patient shows their digital health card with QR code

2. **Get the QR code data:**
   - The QR code contains JSON data with patient information
   - Example format:
   ```json
   {
     "id": "HC-5NMW1ACU4K",
     "name": "John Doe",
     "email": "john@example.com",
     "bloodGroup": "A+"
   }
   ```

3. **Enter the data:**
   - Copy the QR code data
   - Paste it into the text area on the scan page
   - Click **"🔍 Scan QR Code"**

4. **View patient information:**
   - Patient profile displays instantly
   - Medical records summary shown
   - Click **"View Full Records →"** to access complete medical history

---

## 📊 What You'll See

### Patient Profile Card
- ✅ Verification status
- Health Card ID (e.g., HC-XXXXXXXXXX)
- Full name and email
- Phone number
- Date of birth
- Blood group (highlighted in red)
- Gender
- Emergency contact information (if available)

### Medical Records Summary
- Allergies
- Chronic conditions
- Total number of consultations
- Recent consultations (last 3)
  - Doctor name
  - Date and time
  - Symptoms
  - Diagnoses

### Quick Actions
- **View Full Records →** - Opens the complete patient records page
- **Add First Consultation →** - If no records exist yet

---

## 🔮 Future Features

### Camera-Based Scanning (Coming Soon)
- Direct QR code scanning using device camera
- Photo upload capability
- Automatic data extraction from QR images

---

## 💡 Use Cases

### Emergency Situations
1. Patient arrives unconscious
2. Doctor scans health card QR code
3. Instant access to:
   - Blood group
   - Allergies
   - Chronic conditions
   - Emergency contact

### Quick Consultations
1. Patient shows health card
2. Doctor scans QR code
3. Review medical history instantly
4. Add new consultation seamlessly

### Walk-in Patients
1. New or returning patients
2. Scan health card for verification
3. Access complete medical history
4. No need to search by email

---

## 🎯 Benefits

### For Doctors:
- ⚡ **Instant Access** - No typing required
- 📱 **Mobile-Friendly** - Works on any device
- 🔍 **Quick Verification** - Confirm patient identity
- 📊 **Complete Overview** - See all relevant information at once

### For Patients:
- 🚀 **Faster Service** - Reduced wait time
- ✅ **Accurate Records** - No manual entry errors
- 🔒 **Secure** - No sharing of personal credentials
- 📱 **Convenient** - Just show the QR code

---

## 🛠️ Technical Details

### QR Code Format
```json
{
  "id": "HC-XXXXXXXXXX",      // Unique 10-character health card ID
  "name": "Patient Name",      // Full name
  "email": "email@example.com", // Email address
  "bloodGroup": "A+"           // Blood group
}
```

### API Endpoints Used
- `GET /api/patients/profile?email={email}` - Fetch patient profile
- `GET /api/medical-records?email={email}` - Fetch medical records

### Data Security
- QR codes contain minimal identifying information
- Full medical records require authentication
- Only accessible by logged-in doctors
- All actions are audit-logged

---

## 📝 Example Workflow

```
1. Patient: "Here's my health card"
   └─> Shows digital health card with QR code

2. Doctor: Scans/enters QR code data
   └─> {"id":"HC-ABC123XYZ","name":"John Doe","email":"john@example.com","bloodGroup":"A+"}

3. System: Validates and retrieves data
   ├─> Patient profile loaded
   ├─> Medical records fetched
   └─> Emergency contact displayed

4. Doctor: Views complete information
   ├─> Reviews allergies: None
   ├─> Checks chronic conditions: Diabetes
   ├─> Reads recent consultations: 5 visits
   └─> Clicks "View Full Records" for details

5. Doctor: Adds new consultation
   └─> Seamless transition to records page
```

---

## ⚠️ Important Notes

1. **Current Limitation:**
   - Camera-based scanning not yet available
   - Manual data entry required
   - Future updates will add automatic scanning

2. **Patient Requirements:**
   - Patient must have created their health card
   - Health card ID must be generated (happens automatically)
   - QR code visible on their profile page

3. **Doctor Access:**
   - Only logged-in doctors can access this feature
   - Redirects to login if not authenticated
   - All scans are logged for audit purposes

---

## 🔗 Related Features

- [Digital Health Card](../PATIENT_HEALTH_CARD.md) - Patient's QR code health card
- [Patient Records](./PATIENT_RECORDS.md) - Complete medical records management
- [Doctor Dashboard](./DOCTOR_DASHBOARD.md) - Doctor portal overview

---

## 📞 Support

If you encounter issues:
1. Ensure the patient has created their health card
2. Verify the QR data is in correct JSON format
3. Check that you're logged in as a doctor
4. Contact system administrator if problems persist

---

**Last Updated:** October 16, 2025
**Version:** 1.0.0
**Feature Status:** ✅ Active (Manual Entry Mode)
