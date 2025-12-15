# Donation API Testing Guide

This guide explains how to test the donation backend features without using a frontend.

## ✅ Completed Features

### 1. **QR Code Generation Service**
- ✅ Generates QR codes for produce donations
- ✅ Embeds donation details in QR code
- ✅ Returns data URL for easy embedding in emails

### 2. **Enhanced Email Notification Service**
- ✅ Donor notifications for monetary donations
- ✅ Donor notifications for produce donations (with QR code)
- ✅ Admin notifications for all donations
- ✅ Payment failure notifications
- ✅ Beautiful HTML email templates
- ✅ Configurable admin email list via environment variables

### 3. **Comprehensive Input Validation**
- ✅ Monetary donation validation (amount, payment method, reference)
- ✅ Produce donation validation (items, scheduled date, quantities)
- ✅ Date range validation (future dates, max 6 months ahead)
- ✅ UUID format validation
- ✅ Item quantity and unit validation
- ✅ Clear, structured error messages

### 4. **Robust Error Handling**
- ✅ Validation error handling with detailed field-level errors
- ✅ Service-level error handling (donor not found, etc.)
- ✅ Payment processing error handling
- ✅ Consistent error response format
- ✅ Development vs production error details

### 5. **Donation Management**
- ✅ Create monetary donations
- ✅ Create produce donations with scheduled drop-off
- ✅ Get donation by ID
- ✅ Get donations with filters (donor, status, date range)
- ✅ Update donation status (admin operation)
- ✅ Automatic points calculation

---

## 🚀 Setup Instructions

### 1. Install Dependencies
```powershell
cd backend
npm install
```

### 2. Configure Environment Variables
Create or update `.env` file in the backend directory:

```env
# Database
DATABASE_URL="your_database_connection_string"

# Email Configuration
EMAIL_USER="foodonation.org@gmail.com"
EMAIL_PASS="your_gmail_app_password"

# Admin Email List (comma-separated)
ADMIN_EMAILS="admin1@foodonation.org,admin2@foodonation.org"

# Server
PORT=3000
NODE_ENV=development
```

### 3. Run Database Migrations
```powershell
cd backend
npx prisma migrate dev
npx prisma generate
```

### 4. Start the Backend Server
```powershell
cd backend
npm run dev
```

---

## 🧪 Testing Methods

### Method 1: REST Client (VS Code Extension)

1. **Install REST Client Extension**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "REST Client"
   - Install it

2. **Use the Test File**
   - Open `backend/test-donations.http`
   - Update the variables at the top:
     ```http
     @donorId = your-actual-donor-id
     @donationCenterId = your-actual-donation-center-id
     ```
   - Click "Send Request" above any test case

3. **Run Tests**
   - Click "Send Request" for each test
   - View responses in the output panel

### Method 2: Node.js Test Script

1. **Get Test Data from Database**
   ```powershell
   cd backend
   npx prisma studio
   ```
   - Open Prisma Studio
   - Copy a donor ID from the Donor table
   - Copy a donation center ID from the DonationCenter table

2. **Update Test Script**
   - Open `backend/test-donations.mjs`
   - Update the TEST_DATA:
     ```javascript
     const TEST_DATA = {
       donorId: 'paste-your-donor-id-here',
       donationCenterId: 'paste-your-donation-center-id-here',
     };
     ```

3. **Run Tests**
   ```powershell
   node backend/test-donations.mjs
   ```

### Method 3: cURL Commands

#### Create Monetary Donation
```powershell
curl -X POST http://localhost:5000/api/donations/monetary `
  -H "Content-Type: application/json" `
  -d '{
    "donorId": "your-donor-id",
    "amount": 1000,
    "paymentMethod": "GCash",
    "paymentReference": "GCASH-123456"
  }'
```

#### Create Produce Donation
```powershell
curl -X POST http://localhost:5000/api/donations/produce `
  -H "Content-Type: application/json" `
  -d '{
    "donorId": "your-donor-id",
    "donationCenterId": "your-donation-center-id",
    "scheduledDate": "2025-12-20T10:00:00.000Z",
    "items": [
      {
        "name": "Rice",
        "category": "Grains",
        "quantity": 50,
        "unit": "kg"
      }
    ]
  }'
```

#### Get All Donations
```powershell
curl http://localhost:5000/api/donations?limit=10
```

#### Get Donation by ID
```powershell
curl http://localhost:5000/api/donations/your-donation-id
```

#### Update Donation Status
```powershell
curl -X PATCH http://localhost:5000/api/donations/your-donation-id/status `
  -H "Content-Type: application/json" `
  -d '{
    "status": "COMPLETED",
    "notes": "Donation verified"
  }'
```

---

## 📋 API Endpoints

### POST `/api/donations/monetary`
Create a monetary donation

**Request Body:**
```json
{
  "donorId": "uuid",
  "amount": 1000,
  "paymentMethod": "GCash|PayPal|Credit Card|Debit Card|Bank Transfer",
  "paymentReference": "payment-ref-123"
}
```

**Validations:**
- `donorId`: Must be valid UUID
- `amount`: Must be positive, min ₱1, max ₱1,000,000
- `paymentMethod`: Must be one of the allowed methods
- `paymentReference`: Min 5 characters, max 100

**Response:**
```json
{
  "success": true,
  "message": "Monetary donation created successfully",
  "data": {
    "donation": { ... }
  }
}
```

**Side Effects:**
- Updates donor's total donation amount
- Adds points to donor (1 point per ₱10)
- Sends confirmation email to donor
- Notifies all admins via email

### POST `/api/donations/maya/checkout`
Initialize a Maya Checkout and get `checkoutId` + `redirectUrl`.

Request Body:
```json
{
  "donorId": "uuid",
  "amount": 500,
  "description": "Food Donation"
}
```

Response:
```json
{
  "success": true,
  "message": "Maya checkout initialized",
  "data": {
    "donorId": "uuid",
    "amount": 500,
    "checkoutId": "04f5f163-a662-46d8-a124-3c19d4dfc1ad",
    "redirectUrl": "https://payments-sandbox.maya.ph/checkout?id=..."
  }
}
```

Flow Tips:
- Call this endpoint from your frontend to get `redirectUrl` and send the donor to Maya.
- Keep the returned `checkoutId` in your app state; after payment, call `POST /api/donations/monetary` with `paymentMethod: "Maya"` and `paymentReference: checkoutId`.
- In production, prefer Maya webhooks to auto-confirm payments without manual follow-up.

---

### POST `/api/donations/produce`
Create a produce donation with scheduled drop-off

**Request Body:**
```json
{
  "donorId": "uuid",
  "donationCenterId": "uuid",
  "scheduledDate": "2025-12-20T10:00:00.000Z",
  "items": [
    {
      "name": "Rice",
      "category": "Grains",
      "quantity": 50,
      "unit": "kg"
    }
  ]
}
```

**Validations:**
- `donorId`: Must be valid UUID
- `donationCenterId`: Must be valid UUID
- `scheduledDate`: Must be future date, max 6 months ahead
- `items`: Array with 1-50 items, each with positive quantity

**Response:**
```json
{
  "success": true,
  "message": "Produce donation scheduled successfully",
  "data": {
    "donation": {
      "id": "uuid",
      "qrCodeRef": "data:image/png;base64,...",
      "items": [...],
      ...
    }
  }
}
```

**Side Effects:**
- Generates QR code with donation details
- Sends confirmation email with QR code to donor
- Notifies all admins via email

---

### GET `/api/donations/:id`
Get donation by ID

**Response:**
```json
{
  "success": true,
  "data": {
    "donation": { ... }
  }
}
```

---

### GET `/api/donations`
Get donations with filters

**Query Parameters:**
- `donorId` (optional): Filter by donor UUID
- `status` (optional): Filter by status (SCHEDULED, COMPLETED, CANCELLED)
- `fromDate` (optional): Filter from date (ISO 8601)
- `toDate` (optional): Filter to date (ISO 8601)
- `limit` (optional): Results per page (default: 20, max: 100)
- `offset` (optional): Skip results (default: 0)

**Example:**
```
GET /api/donations?status=SCHEDULED&limit=10&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "donations": [...],
    "pagination": {
      "total": 42,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

### PATCH `/api/donations/:id/status`
Update donation status (Admin only)

**Request Body:**
```json
{
  "status": "COMPLETED|CANCELLED",
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Donation status updated successfully",
  "data": {
    "donation": { ... }
  }
}
```

**Side Effects:**
- If status changes to COMPLETED, calculates and adds points to donor

---

## 🧩 Getting Test Data

### Create Test Donor
```powershell
# Using Prisma Studio
npx prisma studio

# Or using SQL
# Connect to your database and run:
SELECT id, email FROM "User" 
JOIN "Donor" ON "User".id = "Donor"."userId" 
LIMIT 5;
```

### Create Test Donation Center
```powershell
# Using Prisma Studio - browse to DonationCenter table
# Or create one programmatically if you have seed data
```

---

## 📧 Email Notifications

### Donor Notifications

1. **Monetary Donation Confirmation**
   - Sent to donor after successful payment
   - Includes donation ID, amount, reference, date
   - Professional HTML template

2. **Produce Donation Confirmation**
   - Sent to donor after scheduling
   - Includes QR code for drop-off
   - Lists all donation items
   - Includes drop-off location and time

3. **Payment Failure**
   - Sent if payment processing fails
   - Suggests actions to resolve

### Admin Notifications

1. **Monetary Donation Alert**
   - Notifies all admins about new monetary donations
   - Includes donor details and amount

2. **Produce Donation Alert**
   - Notifies all admins about scheduled donations
   - Includes items list and drop-off details

---

## 🔍 Validation Examples

### Valid Requests ✅

```json
// Valid Monetary Donation
{
  "donorId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 500,
  "paymentMethod": "GCash",
  "paymentReference": "GCASH-REF-2025-001"
}

// Valid Produce Donation
{
  "donorId": "550e8400-e29b-41d4-a716-446655440000",
  "donationCenterId": "660e8400-e29b-41d4-a716-446655440000",
  "scheduledDate": "2025-12-25T09:00:00.000Z",
  "items": [
    { "name": "Rice", "category": "Grains", "quantity": 25, "unit": "kg" },
    { "name": "Canned Goods", "category": "Preserved", "quantity": 100, "unit": "cans" }
  ]
}
```

### Invalid Requests ❌

```json
// Invalid: Negative amount
{
  "donorId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": -100,  // ❌ Must be positive
  "paymentMethod": "GCash",
  "paymentReference": "REF"
}

// Invalid: Past date
{
  "donorId": "550e8400-e29b-41d4-a716-446655440000",
  "donationCenterId": "660e8400-e29b-41d4-a716-446655440000",
  "scheduledDate": "2020-01-01T00:00:00.000Z",  // ❌ Must be future
  "items": [...]
}

// Invalid: Invalid UUID
{
  "donorId": "not-a-valid-uuid",  // ❌ Must be UUID format
  "amount": 100,
  "paymentMethod": "GCash",
  "paymentReference": "REF-123"
}
```

---

## 🐛 Troubleshooting

### Issue: "Donor not found"
- Verify donor ID exists in database
- Check if donor is linked to a user account

### Issue: "Donation center not found"
- Verify donation center ID exists
- Check if place relationship is properly set up

### Issue: Email not sending
- Check EMAIL_USER and EMAIL_PASS in .env
- For Gmail, use App Password (not regular password)
- Enable "Less secure app access" or use OAuth2

### Issue: QR code not generating
- Check if qrcode package is installed: `npm install qrcode`
- Verify QRCodeService is properly imported

### Issue: Validation errors
- Check request body matches schema exactly
- Ensure date is in ISO 8601 format
- Verify all required fields are present

---

## 📊 Database Schema

### Donation Table
```prisma
model Donation {
  id               String          @id @default(uuid())
  status           DonationStatus  @default(SCHEDULED)
  scheduledDate    DateTime
  qrCodeRef        String?
  imageUrls        String[]
  paymentReference String?
  paymentMethod    String?
  donorId          String?
  donationCenterId String?
  
  donor            Donor?
  donationCenter   DonationCenter?
  items            DonationItem[]
}
```

### DonationItem Table
```prisma
model DonationItem {
  id         String   @id @default(uuid())
  name       String
  category   String
  quantity   Float
  unit       String
  donationId String
  
  donation   Donation @relation(fields: [donationId], references: [id])
}
```

---

## 🎯 Next Steps

1. **Frontend Integration**
   - Use these endpoints in your React/Next.js frontend
   - Handle file uploads for produce donation images
   - Display QR codes to donors

2. **Authentication**
   - Uncomment auth middleware in routes
   - Add JWT token to requests

3. **Admin Dashboard**
   - Build UI to manage donations
   - View statistics and reports
   - Update donation statuses

4. **Payment Gateway Integration**
   - Replace mock payment processing with real APIs
   - Integrate GCash, PayPal, etc.

---

## 📝 Notes

- All monetary amounts are in PHP (Philippine Peso)
- QR codes are returned as base64 data URLs
- Admin emails are configurable via ADMIN_EMAILS env variable
- Points system: ₱10 = 1 point for monetary, 1 unit = 1 point for produce
- Maximum 50 items per produce donation
- Scheduled dates must be within 6 months

---

## ✨ Success Response Format

All successful responses follow this format:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

## ❌ Error Response Format

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific error message"
    }
  ]
}
```

---

**Happy Testing! 🎉**
