# Soft Delete Implementation for Appointments

## Overview
Implemented a soft delete system for appointments to prevent errors when viewing payment history for deleted appointments. Deleted appointments are no longer physically removed from the database but are marked as deleted and hidden from the UI.

## Problem Statement
When a paid appointment was deleted, the payment record still referenced the deleted appointment ID, causing errors in the payment history window. The appointment was completely removed from the database, breaking the relationship integrity.

## Solution
Implemented a **soft delete** pattern where appointments are marked as deleted but remain in the database.

## Changes Made

### 1. Database Schema (`src/models/index.ts`)
Added `deleted` field to AppointmentSchema:
```typescript
deleted: {
  type: Boolean,
  default: false,
}
```

### 2. Appointments API - GET Endpoint (`src/app/api/appointments/route.ts`)
- **Main query filter**: Excludes deleted appointments by default
  ```typescript
  const filter: any = { deleted: { $ne: true } };
  ```

- **Time slot availability check**: Excludes deleted appointments when checking booked slots
  ```typescript
  const bookedAppointments = await Appointment.find({
    doctorId: doctorId,
    date: { $gte: startOfDay, $lte: endOfDay },
    deleted: { $ne: true },
  });
  ```

- **Conflict prevention**: Excludes deleted appointments when checking for double-booking
  ```typescript
  const existingAppointment = await Appointment.findOne({
    doctorId: body.doctorId,
    timeSlot: body.timeSlot,
    date: { $gte: startOfDay, $lte: endOfDay },
    deleted: { $ne: true },
  });
  ```

### 3. Appointments API - PUT Endpoint (`src/app/api/appointments/[id]/route.ts`)
Updated conflict check to exclude deleted appointments:
```typescript
const existingAppointment = await Appointment.findOne({
  _id: { $ne: id },
  doctorId: body.doctorId,
  timeSlot: body.timeSlot,
  date: { $gte: startOfDay, $lte: endOfDay },
  deleted: { $ne: true },
});
```

### 4. Appointments API - DELETE Endpoint (`src/app/api/appointments/[id]/route.ts`)
Changed from hard delete to soft delete:
```typescript
// Before (Hard Delete)
const deletedAppointment = await Appointment.findByIdAndDelete(id);

// After (Soft Delete)
const updatedAppointment = await Appointment.findByIdAndUpdate(
  id,
  { deleted: true },
  { new: true }
);
```

## Benefits

### ✅ Data Integrity
- Payment records maintain valid references to appointments
- No broken relationships in the database
- Complete audit trail preserved

### ✅ Payment History Reliability
- Payment history window can always access appointment details
- No errors when displaying deleted appointments
- Transaction history remains complete and accurate

### ✅ User Experience
- Deleted appointments disappear from "Your Appointments" section
- Payment history continues to show all transactions
- No confusing error messages

### ✅ Business Intelligence
- Historical data preserved for analytics
- Can track appointment cancellations
- Better understanding of patient behavior

### ✅ Time Slot Management
- Deleted appointment time slots become available again
- No conflicts with soft-deleted appointments
- Accurate availability checking

## Behavior

### What Patients See
- **Your Appointments Section**: Only active (non-deleted) appointments
- **Payment History**: All payments including those for deleted appointments
- **Booking System**: Can book time slots from deleted appointments

### What's Stored in Database
- All appointments (both active and deleted)
- `deleted: false` for active appointments
- `deleted: true` for removed appointments
- Payment records always reference valid appointment IDs

## Future Considerations

### Permanent Deletion (Optional)
If needed, could implement a cleanup job to permanently delete old soft-deleted records:
```typescript
// Example: Delete appointments soft-deleted more than 1 year ago
await Appointment.deleteMany({
  deleted: true,
  updatedAt: { $lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
});
```

### Recovery Feature (Optional)
Could add ability to "undelete" appointments if needed:
```typescript
await Appointment.findByIdAndUpdate(id, { deleted: false });
```

### Admin View (Optional)
Admins could view all appointments including deleted ones by removing the filter:
```typescript
const allAppointments = await Appointment.find({}); // Includes deleted
```

## Testing Recommendations

1. **Test Deletion Flow**
   - Create an appointment
   - Make payment
   - Delete the appointment
   - Verify it disappears from appointments list
   - Verify it still appears in payment history

2. **Test Time Slot Availability**
   - Book an appointment for a specific time
   - Delete the appointment
   - Verify the time slot becomes available again
   - Verify you can book a new appointment for that time

3. **Test Payment History**
   - Create multiple appointments
   - Pay for all of them
   - Delete some appointments
   - Open payment history
   - Verify no errors and all payments display correctly

## Conclusion
The soft delete implementation successfully resolves the payment history error while maintaining data integrity and improving the overall system reliability. Deleted appointments are hidden from users but preserved in the database for reference and audit purposes.
