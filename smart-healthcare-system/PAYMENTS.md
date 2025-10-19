# Payments Module

This document explains how payments are created, stored, and queried in the Smart Healthcare System.

## Overview

- Records financial transactions linked to appointments
- Supports payment methods: `credit-card`, `insurance`
- Tracks statuses: `pending`, `completed`, `failed`, `refunded`
- Provides REST API to create and fetch payments

## Data Model

Collection: `payments`

Fields:
- `appointmentId` (ObjectId, ref: Appointment) – required
- `patientName` (string) – required
- `patientEmail` (string) – required
- `doctorId` (ObjectId, ref: Doctor) – required
- `doctorName` (string) – required
- `service` (string) – required
- `appointmentDate` (Date) – required
- `amount` (number, Rs.) – required
- `currency` (string, default `Rs.`)
- `paymentMethod` (string: `credit-card` | `insurance`) – required
- `paymentStatus` (string: `pending` | `completed` | `failed` | `refunded`, default `completed`)
- `paidAt` (Date, default now)
- `transactionId` (string) – required

See source: `src/models/index.ts` (PaymentSchema)

## API Endpoints

### Create Payment

POST `/api/payments`

Creates a payment record for an existing appointment.

Headers:
- `Content-Type: application/json`

Request Body:
{
  "appointmentId": "<ObjectId>",
  "amount": 2500,
  "paymentMethod": "credit-card"
}

Validation Rules:
- `appointmentId`: must exist and reference a valid appointment
- `amount`: required, numeric (>0 recommended)
- `paymentMethod`: required, one of `credit-card` or `insurance`

Response (201):
{
  "id": "<paymentId>",
  "appointmentId": "<appointmentId>",
  "patientName": "John Doe",
  "patientEmail": "john@example.com",
  "doctorName": "Dr. Smith",
  "service": "Consultation",
  "appointmentDate": "2025-10-20T08:30:00.000Z",
  "amount": 2500,
  "currency": "Rs.",
  "paymentMethod": "credit-card",
  "paymentStatus": "completed",
  "paidAt": "2025-10-19T10:22:11.123Z",
  "transactionId": "TXN1739922339ABC123XYZ"
}

Error Responses:
- 400: Missing required fields
- 404: Appointment or Doctor not found
- 500: Failed to create payment record

Notes:
- Transaction ID is auto-generated: `TXN<timestamp><random>`
- Payment status is stored as `completed` by default on creation

### List Payments

GET `/api/payments?email=<patientEmail>&appointmentId=<id>`

Returns payment records, most recent first. All query params are optional.

Query Parameters:
- `email` (string): filter by patient email
- `appointmentId` (string): filter by appointment

Response (200):
[
  {
    "id": "<paymentId>",
    "appointmentId": "<appointmentId>",
    "patientName": "John Doe",
    "patientEmail": "john@example.com",
    "doctorName": "Dr. Smith",
    "service": "Consultation",
    "appointmentDate": "2025-10-20T08:30:00.000Z",
    "amount": 2500,
    "currency": "Rs.",
    "paymentMethod": "credit-card",
    "paymentStatus": "completed",
    "paidAt": "2025-10-19T10:22:11.123Z",
    "transactionId": "TXN1739922339ABC123XYZ"
  }
]

Error Responses:
- 500: Failed to fetch payments

## Business Rules

- Only appointments with valid `appointmentId` can have payments.
- `paymentStatus` values are constrained by schema.
- Currency defaults to `Rs.`; adjust in schema if needed.
- For financial reporting, only `paymentStatus: 'completed'` should count towards revenue.

## Examples

Create a payment (fetch example):
await fetch('/api/payments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ appointmentId, amount: 1500, paymentMethod: 'credit-card' })
});

List payments for a patient:
const res = await fetch(`/api/payments?email=${encodeURIComponent('john@example.com')}`);
const payments = await res.json();

## Testing

Unit tests cover validation, filtering, sorting, and calculations:
- `src/__tests__/api/payments.test.ts`

Key tested scenarios:
- Valid/invalid request validation
- Payment method and status validation
- Transforming DB docs to API shape
- Filtering by email, appointmentId
- Calculating totals and completed-only sums

## Security & Hardening

- Ensure server-side authentication/authorization if exposing payments beyond admin.
- Validate `appointmentId` and sanitize inputs.
- Consider idempotency for payment creation to prevent duplicates.
- Log and monitor suspicious activities.

---

For finance dashboards, see `ADMIN_FINANCE_MODULE.md`.
