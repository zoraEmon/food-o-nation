# 📋 Donation API Reference Card

## Base URL
```
http://localhost:5000/api/donations
```

---

## 🔵 POST /monetary
Create a monetary donation

### Request
```json
{
  "donorId": "uuid",
  "amount": 1000,
  "paymentMethod": "GCash|PayPal|Credit Card|Debit Card|Bank Transfer",
  "paymentReference": "GCASH-123456"
}
```

### Response (201)
```json
{
  "success": true,
  "message": "Monetary donation created successfully",
  "data": { "donation": {...} }
}
```

### Side Effects
- ✉️ Email to donor (confirmation)
- ✉️ Email to admins (notification)
- 🏆 Points added to donor (+1 per ₱10)

---

## 🟢 POST /produce
Create a produce donation

### Request
```json
{
  "donorId": "uuid",
  "donationCenterId": "uuid",
  "scheduledDate": "2025-12-25T10:00:00.000Z",
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

### Response (201)
```json
{
  "success": true,
  "message": "Produce donation scheduled successfully",
  "data": {
    "donation": {
      "id": "...",
      "qrCodeRef": "data:image/png;base64,...",
      "items": [...]
    }
  }
}
```

### Side Effects
- 📱 QR code generated
- ✉️ Email to donor (confirmation + QR)
- ✉️ Email to admins (notification)

---

## 🟡 GET /:id
Get donation by ID

### Request
```
GET /donations/550e8400-e29b-41d4-a716-446655440000
```

### Response (200)
```json
{
  "success": true,
  "data": {
    "donation": {
      "id": "...",
      "status": "SCHEDULED",
      "donor": {...},
      "items": [...],
      "donationCenter": {...}
    }
  }
}
```

---

## 🟣 GET /
List donations with filters

### Query Parameters
| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| donorId | UUID | `?donorId=550e8400...` | Filter by donor |
| status | Enum | `?status=SCHEDULED` | Filter by status |
| fromDate | ISO8601 | `?fromDate=2025-12-01T00:00:00Z` | Start date |
| toDate | ISO8601 | `?toDate=2025-12-31T23:59:59Z` | End date |
| limit | Number | `?limit=20` | Results per page (max 100) |
| offset | Number | `?offset=40` | Skip results |

### Request Examples
```
GET /donations?limit=10
GET /donations?status=SCHEDULED&limit=20
GET /donations?donorId=550e8400...
GET /donations?fromDate=2025-12-01T00:00:00Z&toDate=2025-12-31T23:59:59Z
```

### Response (200)
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

## 🟠 PATCH /:id/status
Update donation status (Admin)

### Request
```json
{
  "status": "COMPLETED|CANCELLED",
  "notes": "Optional notes"
}
```

### Response (200)
```json
{
  "success": true,
  "message": "Donation status updated successfully",
  "data": { "donation": {...} }
}
```

### Side Effects
- 🏆 Points awarded if status → COMPLETED

---

## 📝 Validation Rules

### Monetary Donation
- ✅ `donorId`: Valid UUID
- ✅ `amount`: ₱1 - ₱1,000,000
- ✅ `paymentMethod`: One of allowed methods
- ✅ `paymentReference`: 5-100 characters

### Produce Donation
- ✅ `donorId`: Valid UUID
- ✅ `donationCenterId`: Valid UUID
- ✅ `scheduledDate`: Future date, max 6 months
- ✅ `items`: 1-50 items array
- ✅ Each item: name, category, positive quantity, unit

### Status Update
- ✅ `donationId`: Valid UUID
- ✅ `status`: SCHEDULED, COMPLETED, or CANCELLED
- ✅ `notes`: Max 500 characters (optional)

---

## ⚠️ Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be greater than 0"
    }
  ]
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Donation not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🎨 Status Values

| Status | Description |
|--------|-------------|
| SCHEDULED | Produce donation scheduled for future drop-off |
| COMPLETED | Donation received and verified |
| CANCELLED | Donation was cancelled |

---

## 💰 Points System

### Monetary Donations
- **Formula:** `points = Math.floor(amount / 10)`
- **Example:** ₱1,000 donation = 100 points

### Produce Donations
- **Formula:** `points = Math.floor(totalQuantity)`
- **Example:** 50 kg rice + 100 cans = 150 points
- **Note:** Points awarded when status changes to COMPLETED

---

## 📧 Email Notifications

### Donor Emails
1. **Monetary Confirmation**
   - Subject: "✅ Monetary Donation Successful - Thank You!"
   - Includes: Amount, reference, donation ID, date

2. **Produce Confirmation**
   - Subject: "📦 Produce Donation Scheduled - Drop-off Details"
   - Includes: QR code, items list, location, date

3. **Payment Failure**
   - Subject: "❌ Payment Unsuccessful - Action Required"
   - Includes: Amount, reason, retry instructions

### Admin Emails
1. **Monetary Notification**
   - Subject: "💰 New Monetary Donation: ₱X,XXX"
   - Includes: Donor details, amount, payment reference

2. **Produce Notification**
   - Subject: "📦 New Produce Donation Scheduled - Location"
   - Includes: Donor details, items, scheduled date

---

## 🔐 Authentication (When Enabled)

### Headers Required
```
Authorization: Bearer <jwt_token>
```

### Role Requirements
- **Create Donations:** DONOR role
- **View Own Donations:** DONOR role
- **View All Donations:** ADMIN role
- **Update Status:** ADMIN role

---

## 🧪 Test Data

### Get Test IDs
```powershell
node get-test-ids.mjs
```

### Test Files
- `test-donations.http` - REST Client tests
- `test-donations.mjs` - Automated test script

---

## 📊 Database Models

### Donation
```typescript
{
  id: string
  status: DonationStatus
  scheduledDate: Date
  qrCodeRef?: string
  imageUrls: string[]
  paymentReference?: string
  paymentMethod?: string
  donorId?: string
  donationCenterId?: string
  createdAt: Date
}
```

### DonationItem
```typescript
{
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  donationId: string
}
```

---

## 🚀 Quick Commands

```powershell
# Start server
npm run dev

# Get test data
node get-test-ids.mjs

# Run tests
node test-donations.mjs

# View database
npx prisma studio

# Check migrations
npx prisma migrate status
```

---

## 📚 Documentation Files

1. **QUICKSTART.md** - Get started in 5 minutes
2. **DONATION_API_TESTING.md** - Complete testing guide
3. **DONATION_IMPLEMENTATION_SUMMARY.md** - Technical details
4. **API_REFERENCE.md** - This file

---

**Last Updated:** December 8, 2025
**Version:** 1.0.0
**Status:** Production Ready ✅
