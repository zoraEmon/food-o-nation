# Testing Admin QR Scan Feature

Complete guide to test the QR code scanning endpoint for program applications.

## Prerequisites

Before testing, ensure you have:
1. **Backend running** on `http://localhost:5000`
2. **Database seeded** with at least:
   - One Admin user
   - One Beneficiary user  
   - One published Program
3. **Application created** via the register endpoint

---

## Testing Flow Overview

```
1. Get Beneficiary ID  →  2. Get Program ID  →  3. Register for Program  →  4. Scan QR Code
```

---

## Method 1: Using Postman Collection (Recommended)

### Step 1: Import Collection
```powershell
# The collection is at:
backend\postman-program-applications.json
```

Import into Postman: **File → Import → Select JSON file**

### Step 2: Set Base URL
Collection variable `baseUrl` is already set to `http://localhost:5000/api`

### Step 3: Execute Requests in Order

#### 3.1 Get All Beneficiaries
- **Request:** `📋 BENEFICIARY MANAGEMENT → Get All Beneficiaries`
- **Result:** Auto-saves first `beneficiaryId` to collection variable
- **Check:** Console shows `Saved beneficiaryId: <uuid>`

#### 3.2 Get All Programs  
- **Request:** `🎯 PROGRAM MANAGEMENT → Get All Programs`
- **Result:** Auto-saves first `programId` to collection variable
- **Check:** Console shows `Saved programId: <uuid>`

#### 3.3 Register for Program
- **Request:** `📝 PROGRAM APPLICATIONS → Register for Program`
- **Body:** Uses saved `{{programId}}` and `{{beneficiaryId}}`
- **Result:** Auto-saves `applicationId` and `qrCodeValue`
- **Check:** Response includes QR code details

#### 3.4 Scan QR Code (Admin)
- **Request:** `📝 PROGRAM APPLICATIONS → Scan QR Code (Admin)`
- **Body:**
```json
{
  "qrCodeValue": "{{qrCodeValue}}",
  "adminId": "{{adminId}}",
  "notes": "Verified and distributed at distribution center"
}
```
- **Note:** You need to manually set `{{adminId}}` or update the request body with a valid admin ID
- **Result:** Application marked as `COMPLETED`

#### Expected Response:
```json
{
  "success": true,
  "message": "QR code scanned and application marked as COMPLETED",
  "data": {
    "application": {
      "id": "...",
      "applicationStatus": "COMPLETED",
      "qrCodeScannedAt": "2025-12-14T...",
      "qrCodeScannedByAdminId": "...",
      "actualDeliveryDate": "2025-12-14T...",
      ...
    },
    "scan": {
      "id": "...",
      "scannedAt": "2025-12-14T...",
      "scannedByAdminId": "...",
      "notes": "Verified and distributed at distribution center"
    }
  }
}
```

### Postman Test Assertions
The collection automatically verifies:
- ✅ Status code is 200
- ✅ Application status changed to `COMPLETED`
- ✅ `qrCodeScannedAt` is set
- ✅ `actualDeliveryDate` is recorded
- ✅ Scan audit record created with `scannedByAdminId`

---

## Method 2: Manual PowerShell/cURL Testing

### Step 1: Get Data IDs
```powershell
# Get beneficiary ID
curl http://localhost:5000/api/beneficiaries | jq '.data[0].id'

# Get program ID
curl http://localhost:5000/api/programs | jq '.data[0].id'

# Store them
$beneficiaryId = "PASTE_BENEFICIARY_ID_HERE"
$programId = "PASTE_PROGRAM_ID_HERE"
$adminId = "PASTE_ADMIN_ID_HERE"
```

### Step 2: Register for Program
```powershell
$registerBody = @{
  programId = $programId
  beneficiaryId = $beneficiaryId
} | ConvertTo-Json

$registerResponse = curl -X POST http://localhost:5000/api/programs/register `
  -H "Content-Type: application/json" `
  -d $registerBody | ConvertFrom-Json

$qrCodeValue = $registerResponse.data.application.qrCodeValue
Write-Host "QR Code: $qrCodeValue"
```

### Step 3: Scan QR Code
```powershell
$scanBody = @{
  qrCodeValue = $qrCodeValue
  adminId = $adminId
  notes = "Test scan from PowerShell"
} | ConvertTo-Json

curl -X POST http://localhost:5000/api/programs/scan-qr `
  -H "Content-Type: application/json" `
  -d $scanBody
```

---

## Method 3: Automated Test Script

### Run the End-to-End Test
```powershell
cd C:\Users\Zora\Desktop\food-o-nation\backend

# Set required environment variables
set PROGRAM_ID=8561a524-e92e-4fc6-ba7c-9494cc96edcc
set BENEFICIARY_ID=6e194ddf-a5d0-421e-adfd-9fd1acdba4a5  
set ADMIN_ID=admin-uuid-here

# Run the test
node tests\program-applications\scan-endpoint.test.mjs
```

### Expected Output:
```
[Scan Test] starting
[PASS] scan endpoint end-to-end
```

---

## Method 4: Testing Expiry/Cancellation

### Trigger Manual Expiry Check
```powershell
curl -X POST http://localhost:5000/api/programs/admin/update-expired
```

### Expected Response:
```json
{
  "success": true,
  "data": {
    "updatedCount": 0,
    "expiredApplications": []
  }
}
```

### Test Expiry Script
```powershell
node tests\program-applications\expire-cancel.test.mjs
```

---

## Troubleshooting

### Error: "Invalid QR code - Application not found"
- The `qrCodeValue` doesn't match any application
- Re-run the registration step to get a fresh QR code

### Error: "Missing required fields: qrCodeValue, adminId"
- Check that both fields are present in request body
- Verify `adminId` is a valid UUID

### Error: "Program or Beneficiary not found"
- Check IDs exist in database:
```powershell
curl http://localhost:5000/api/beneficiaries
curl http://localhost:5000/api/programs
```

### No Admin ID Available
Query database or create one:
```sql
SELECT id FROM "Admin" LIMIT 1;
```

---

## Verifying Results

### Check Application Status
```powershell
$applicationId = "paste-application-id"
curl http://localhost:5000/api/programs/application/$applicationId
```

### Check Scan Audit Logs
Query in database:
```sql
SELECT * FROM "ProgramApplicationScan" 
WHERE "applicationId" = 'your-application-id' 
ORDER BY "scannedAt" DESC;
```

### Check Statistics
```powershell
$programId = "your-program-id"
curl http://localhost:5000/api/programs/$programId/applications/stats
```

Expected to see:
```json
{
  "success": true,
  "data": {
    "total": 1,
    "completed": 1,
    "pending": 0,
    "cancelled": 0,
    "scanRate": 100
  }
}
```

---

## Quick Reference

| Step | Endpoint | Method | Purpose |
|------|----------|--------|---------|
| 1 | `/beneficiaries` | GET | Get beneficiary ID |
| 2 | `/programs` | GET | Get program ID |
| 3 | `/programs/register` | POST | Create application + QR |
| 4 | `/programs/scan-qr` | POST | Scan QR & mark complete |
| 5 | `/programs/admin/update-expired` | POST | Cancel expired apps |

---

## Next Steps

After successful scan testing:
1. Test the nightly cron job (waits until 02:00 or manually trigger)
2. Verify email notifications are sent to beneficiaries
3. Check program registration status updates to `CLAIMED`
4. Review audit trail in `ProgramApplicationScan` table
