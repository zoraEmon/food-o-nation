# 🔧 Error Fixes & Testing Guide

## Problems Identified & Fixed

### ❌ Error 1: `TypeError: Cannot read properties of undefined (reading 'map')`

**Location:** `src/controllers/donation.controller.ts:17`

**Root Cause:**
The `handleValidationError` function tried to directly access `error.errors` without checking if it exists.

**Original Code:**
```typescript
function handleValidationError(error: ZodError, res: Response): void {
  const errors = error.errors.map(err => ({  // ❌ error.errors could be undefined
    field: err.path.join('.'),
    message: err.message,
  }));
  ...
}
```

**✅ Fixed Code:**
```typescript
function handleValidationError(error: ZodError | any, res: Response): void {
  if (error instanceof ZodError) {
    const errors = (error.errors || []).map(err => ({
      field: (err.path || []).join('.'),
      message: err.message,
    }));
    
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors,
    });
  } else {
    res.status(400).json({
      success: false,
      message: error.message || 'Validation error',
    });
  }
}
```

---

### ❌ Error 2: `TypeError: Cannot destructure property 'status' of 'req.body' as it is undefined`

**Location:** `src/controllers/donation.controller.ts:231`

**Root Cause:**
Destructuring from `req.body` without checking if it exists when body-parser fails to parse the request.

**Original Code:**
```typescript
async updateDonationStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;  // ❌ req.body could be undefined
    ...
  }
}
```

**✅ Fixed Code:**
```typescript
async updateDonationStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status, notes } = req.body || {};  // ✅ Default to empty object
    ...
  }
}
```

---

## ✅ Testing the Fixes

### Test Data (From Database Seed)

```
Donor ID: a20940e2-5f3e-4466-ad96-3ce06dbf068f
Center ID: 250c4cb6-55f9-43c0-a15c-1efb65b93add
```

Get current IDs:
```bash
cd backend
node get-test-ids.mjs
```

---

## 🧪 Testing Methods

### Method 1: Git Bash / cURL

#### Test 1: Create Monetary Donation ✅

```bash
curl -X POST http://localhost:5000/api/donations/monetary \
  -H "Content-Type: application/json" \
  -d '{
    "donorId": "a20940e2-5f3e-4466-ad96-3ce06dbf068f",
    "amount": 1000,
    "paymentMethod": "GCash",
    "paymentReference": "GCASH-TEST-001"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Monetary donation created successfully",
  "data": {
    "donation": {
      "id": "UUID_HERE",
      "type": "MONETARY",
      "amount": 1000,
      "status": "COMPLETED",
      "createdAt": "2025-12-09T..."
    }
  }
}
```

---

#### Test 2: Create Produce Donation ✅

```bash
curl -X POST http://localhost:5000/api/donations/produce \
  -H "Content-Type: application/json" \
  -d '{
    "donorId": "a20940e2-5f3e-4466-ad96-3ce06dbf068f",
    "donationCenterId": "250c4cb6-55f9-43c0-a15c-1efb65b93add",
    "scheduledDate": "2025-12-15T10:00:00.000Z",
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

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Produce donation scheduled successfully",
  "data": {
    "donation": {
      "id": "UUID_HERE",
      "type": "PRODUCE",
      "status": "SCHEDULED",
      "qrCodeRef": "data:image/png;base64,iVBORw0KGgo...",
      "scheduledDate": "2025-12-15T10:00:00Z"
    }
  }
}
```

---

#### Test 3: Get All Donations ✅

```bash
curl -X GET "http://localhost:5000/api/donations?limit=10"
```

---

#### Test 4: Update Donation Status (This is where the second error occurred) ✅

```bash
curl -X PATCH "http://localhost:5000/api/donations/UUID_HERE/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED",
    "notes": "Donation received and verified"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Donation status updated successfully",
  "data": {
    "donation": {
      "id": "UUID_HERE",
      "status": "COMPLETED",
      "notes": "Donation received and verified"
    }
  }
}
```

---

### Method 2: PowerShell

```powershell
# Test 1: Create Monetary Donation
$uri = "http://localhost:5000/api/donations/monetary"
$body = @{
    donorId = "a20940e2-5f3e-4466-ad96-3ce06dbf068f"
    amount = 1000
    paymentMethod = "GCash"
    paymentReference = "GCASH-PS-001"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri $uri -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

---

### Method 3: Postman

1. **Create Collection**
   - Click **New** → **Collection**
   - Name: "Food-O-Nation API"

2. **Create Monetary Donation Request**
   - **Method:** POST
   - **URL:** `http://localhost:5000/api/donations/monetary`
   - **Headers:** `Content-Type: application/json`
   - **Body (JSON):**
   ```json
   {
     "donorId": "a20940e2-5f3e-4466-ad96-3ce06dbf068f",
     "amount": 1000,
     "paymentMethod": "GCash",
     "paymentReference": "GCASH-POSTMAN-001"
   }
   ```
   - Click **Send**

3. **Create Produce Donation Request**
   - **Method:** POST
   - **URL:** `http://localhost:5000/api/donations/produce`
   - **Body (JSON):**
   ```json
   {
     "donorId": "a20940e2-5f3e-4466-ad96-3ce06dbf068f",
     "donationCenterId": "250c4cb6-55f9-43c0-a15c-1efb65b93add",
     "scheduledDate": "2025-12-15T10:00:00.000Z",
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

4. **Update Status Request** (This was the problematic endpoint)
   - **Method:** PATCH
   - **URL:** `http://localhost:5000/api/donations/{{donation_id}}/status`
   - **Body (JSON):**
   ```json
   {
     "status": "COMPLETED",
     "notes": "Donation received"
   }
   ```
   - Click **Send**

---

### Method 4: Thunder Client (VS Code Extension)

1. Install **Thunder Client** extension
2. Click **New Request**
3. Choose **POST**
4. Set URL: `http://localhost:5000/api/donations/monetary`
5. Go to **Body** → **JSON**
6. Paste:
```json
{
  "donorId": "a20940e2-5f3e-4466-ad96-3ce06dbf068f",
  "amount": 1000,
  "paymentMethod": "GCash",
  "paymentReference": "THUNDER-TEST-001"
}
```
7. Click **Send**

---

### Method 5: REST Client VS Code Extension

The `test-donations.http` file already has all tests configured. Just:

1. Install **REST Client** extension
2. Open `backend/test-donations.http`
3. Update `@donorId` and `@donationCenterId` at top
4. Click **Send Request** on any endpoint

---

## 🔍 Validation Error Tests

### Test: Invalid Donor ID

```bash
curl -X POST http://localhost:5000/api/donations/monetary \
  -H "Content-Type: application/json" \
  -d '{
    "donorId": "not-a-uuid",
    "amount": 1000,
    "paymentMethod": "GCash",
    "paymentReference": "TEST"
  }'
```

**Expected:** 400 with validation error message

---

### Test: Negative Amount

```bash
curl -X POST http://localhost:5000/api/donations/monetary \
  -H "Content-Type: application/json" \
  -d '{
    "donorId": "a20940e2-5f3e-4466-ad96-3ce06dbf068f",
    "amount": -100,
    "paymentMethod": "GCash",
    "paymentReference": "TEST"
  }'
```

**Expected:** 400 with validation error

---

### Test: Missing Required Fields

```bash
curl -X POST http://localhost:5000/api/donations/monetary \
  -H "Content-Type: application/json" \
  -d '{"donorId": "a20940e2-5f3e-4466-ad96-3ce06dbf068f"}'
```

**Expected:** 400 with validation error

---

## 📊 Complete Workflow Example

```bash
#!/bin/bash

# Step 1: Create monetary donation
RESPONSE=$(curl -s -X POST http://localhost:5000/api/donations/monetary \
  -H "Content-Type: application/json" \
  -d '{
    "donorId": "a20940e2-5f3e-4466-ad96-3ce06dbf068f",
    "amount": 500,
    "paymentMethod": "GCash",
    "paymentReference": "WORKFLOW-001"
  }')

DONATION_ID=$(echo $RESPONSE | jq -r '.data.donation.id')
echo "✅ Created donation: $DONATION_ID"

# Step 2: Get donation details
curl -s -X GET "http://localhost:5000/api/donations/$DONATION_ID" | jq .

# Step 3: Update status
curl -s -X PATCH "http://localhost:5000/api/donations/$DONATION_ID/status" \
  -H "Content-Type: application/json" \
  -d '{"status":"COMPLETED","notes":"Verified"}' | jq .

echo "✅ Workflow complete!"
```

---

## 🐛 Debugging Tips

### Check Backend Logs
Watch the terminal running `npm run dev`:
```
Server running on port 5000
```

Look for errors like:
- `Email sent to...` (success)
- `Error: ...` (failure)

### Check Database
```bash
cd backend
npx prisma studio
```

Navigate to `Donation` table and verify records exist.

### Test with Wrong Content-Type
Some errors occur when `Content-Type` isn't `application/json`:

**❌ This fails:**
```bash
curl -X POST http://localhost:5000/api/donations/monetary \
  -d '{"donorId":"...","amount":1000}'
```

**✅ This works:**
```bash
curl -X POST http://localhost:5000/api/donations/monetary \
  -H "Content-Type: application/json" \
  -d '{"donorId":"...","amount":1000}'
```

---

## 📋 Checklist

- [x] Fix `handleValidationError` to handle undefined `error.errors`
- [x] Fix `updateDonationStatus` to handle undefined `req.body`
- [x] Test monetary donation creation
- [x] Test produce donation creation
- [x] Test update status endpoint (was broken)
- [x] Create comprehensive testing guide
- [x] Document all testing methods

---

## 🎉 You're All Set!

The errors are fixed! Try one of the testing methods above to verify everything works.

**Start with:** Create Monetary Donation (easiest test)

**Questions?** Check backend logs or run `node get-test-ids.mjs` to verify database is seeded.
