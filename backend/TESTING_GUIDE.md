# 🧪 Donation API Testing Guide

## Quick Start

### Prerequisites
- Backend server running on `http://localhost:5000`
- cURL, Git Bash, Postman, or Thunder Client installed
- Valid donor ID and donation center ID (get from `node get-test-ids.mjs`)

---

## 📌 Test Data Setup

First, get your test IDs:
```powershell
cd backend
node get-test-ids.mjs
```

You'll get output like:
```
Donor IDs:
  Maria Philanthropist: a20940e2-5f3e-4466-ad96-3ce06dbf068f
  ...
Donation Center IDs:
  Taguig Donation Hub: 250c4cb6-55f9-43c0-a15c-1efb65b93add
  ...
```

**Keep these IDs handy for testing!**

---

## 🔧 Method 1: cURL (Git Bash / PowerShell)

### 1. Create Monetary Donation

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
      "id": "uuid-here",
      "type": "MONETARY",
      "amount": 1000,
      "status": "COMPLETED",
      "createdAt": "2025-12-09T10:00:00Z"
    }
  }
}
```

---

### 2. Create Produce Donation

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
      },
      {
        "name": "Canned Sardines",
        "category": "Canned Goods",
        "quantity": 100,
        "unit": "pcs"
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
      "id": "uuid-here",
      "type": "PRODUCE",
      "status": "SCHEDULED",
      "qrCodeRef": "data:image/png;base64,iVBORw0KGgo...",
      "scheduledDate": "2025-12-15T10:00:00Z",
      "items": [...]
    }
  }
}
```

---

### 3. Get All Donations

```bash
curl -X GET "http://localhost:5000/api/donations?limit=10&offset=0"
```

---

### 4. Get Donation by ID

```bash
# Replace UUID_HERE with actual donation ID from previous response
curl -X GET "http://localhost:5000/api/donations/UUID_HERE"
```

---

### 5. Update Donation Status (Admin)

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
      "id": "uuid-here",
      "status": "COMPLETED",
      "notes": "Donation received and verified"
    }
  }
}
```

---

### 6. Filter Donations by Status

```bash
curl -X GET "http://localhost:5000/api/donations?status=SCHEDULED"
```

---

### 7. Filter Donations by Donor

```bash
curl -X GET "http://localhost:5000/api/donations?donorId=a20940e2-5f3e-4466-ad96-3ce06dbf068f"
```

---

### 8. Filter by Date Range

```bash
curl -X GET "http://localhost:5000/api/donations?fromDate=2025-12-01T00:00:00.000Z&toDate=2025-12-31T23:59:59.999Z"
```

---

## 🎯 Method 2: PowerShell

### Create Monetary Donation (PowerShell)

```powershell
$uri = "http://localhost:5000/api/donations/monetary"
$body = @{
    donorId = "a20940e2-5f3e-4466-ad96-3ce06dbf068f"
    amount = 1000
    paymentMethod = "GCash"
    paymentReference = "GCASH-TEST-001"
} | ConvertTo-Json

Invoke-WebRequest -Uri $uri -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $body | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

### Create Produce Donation (PowerShell)

```powershell
$scheduledDate = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")

$uri = "http://localhost:5000/api/donations/produce"
$body = @{
    donorId = "a20940e2-5f3e-4466-ad96-3ce06dbf068f"
    donationCenterId = "250c4cb6-55f9-43c0-a15c-1efb65b93add"
    scheduledDate = $scheduledDate
    items = @(
        @{
            name = "Rice"
            category = "Grains"
            quantity = 50
            unit = "kg"
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-WebRequest -Uri $uri -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $body | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

---

## 📱 Method 3: Postman / Thunder Client

### Import Collection

1. **Open Postman** or **Thunder Client**
2. Click **Import** → **Paste Raw Text**
3. Paste the following JSON:

```json
{
  "info": {
    "name": "Food-O-Nation Donation API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Create Monetary Donation",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"donorId\": \"a20940e2-5f3e-4466-ad96-3ce06dbf068f\",\n  \"amount\": 1000,\n  \"paymentMethod\": \"GCash\",\n  \"paymentReference\": \"GCASH-TEST-001\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/donations/monetary",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "donations", "monetary"]
        }
      }
    },
    {
      "name": "Create Produce Donation",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"donorId\": \"a20940e2-5f3e-4466-ad96-3ce06dbf068f\",\n  \"donationCenterId\": \"250c4cb6-55f9-43c0-a15c-1efb65b93add\",\n  \"scheduledDate\": \"2025-12-15T10:00:00.000Z\",\n  \"items\": [\n    {\n      \"name\": \"Rice\",\n      \"category\": \"Grains\",\n      \"quantity\": 50,\n      \"unit\": \"kg\"\n    }\n  ]\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/donations/produce",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "donations", "produce"]
        }
      }
    },
    {
      "name": "Get All Donations",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:5000/api/donations?limit=10&offset=0",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "donations"],
          "query": [
            {"key": "limit", "value": "10"},
            {"key": "offset", "value": "0"}
          ]
        }
      }
    },
    {
      "name": "Update Donation Status",
      "request": {
        "method": "PATCH",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"status\": \"COMPLETED\",\n  \"notes\": \"Donation received\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/donations/{{donation_id}}/status",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "donations", "{{donation_id}}", "status"]
        }
      }
    }
  ]
}
```

4. **Set Variables** in Postman:
   - Click **Environments** → **Create**
   - Add:
     - `donorId`: `a20940e2-5f3e-4466-ad96-3ce06dbf068f`
     - `donation_id`: (Update after creating a donation)
     - `donationCenterId`: `250c4cb6-55f9-43c0-a15c-1efb65b93add`

---

## 🧹 Method 4: Use VS Code REST Client Extension

1. Install **REST Client** extension in VS Code
2. Open `test-donations.http`
3. Update the `@donorId` and `@donationCenterId` variables at the top
4. Click **Send Request** on any endpoint

---

## ✅ Testing Checklist

### Basic Tests
- [x] **Create Monetary Donation** → Should return 201 with donation ID
- [x] **Create Produce Donation** → Should return 201 with QR code
- [x] **Get Donation by ID** → Should return 200 with donation details
- [x] **List All Donations** → Should return 200 with paginated results
- [x] **Update Status** → Should return 200 with updated status

### Validation Tests
- [ ] **Invalid Donor ID** (should return 400)
  ```bash
  curl -X POST http://localhost:5000/api/donations/monetary \
    -H "Content-Type: application/json" \
    -d '{"donorId":"invalid","amount":1000,"paymentMethod":"GCash","paymentReference":"TEST"}'
  ```

- [ ] **Negative Amount** (should return 400)
  ```bash
  curl -X POST http://localhost:5000/api/donations/monetary \
    -H "Content-Type: application/json" \
    -d '{"donorId":"a20940e2-5f3e-4466-ad96-3ce06dbf068f","amount":-100,"paymentMethod":"GCash","paymentReference":"TEST"}'
  ```

- [ ] **Past Scheduled Date** (should return 400)
  ```bash
  curl -X POST http://localhost:5000/api/donations/produce \
    -H "Content-Type: application/json" \
    -d '{"donorId":"a20940e2-5f3e-4466-ad96-3ce06dbf068f","donationCenterId":"250c4cb6-55f9-43c0-a15c-1efb65b93add","scheduledDate":"2020-01-01T00:00:00Z","items":[{"name":"Rice","category":"Grains","quantity":10,"unit":"kg"}]}'
  ```

- [ ] **Missing Required Fields** (should return 400)
  ```bash
  curl -X POST http://localhost:5000/api/donations/monetary \
    -H "Content-Type: application/json" \
    -d '{"donorId":"a20940e2-5f3e-4466-ad96-3ce06dbf068f"}'
  ```

---

## 🔍 Debugging Tips

### Check Backend Logs
Watch the terminal where `npm run dev` is running. You should see:
- ✅ "Email sent to..." messages
- ✅ "Processing payment..." logs
- ❌ Any error messages

### Check Database
```powershell
npx prisma studio
```
Then navigate to the `Donation` table to verify records were created.

### Check Emails (if configured)
If your `.env` has email settings, donations trigger emails:
- **To Donor**: Confirmation email
- **To Admins**: Notification email

---

## 🚀 Complete Workflow Example

```bash
# Step 1: Create a monetary donation
DONATION_ID=$(curl -s -X POST http://localhost:5000/api/donations/monetary \
  -H "Content-Type: application/json" \
  -d '{
    "donorId": "a20940e2-5f3e-4466-ad96-3ce06dbf068f",
    "amount": 1000,
    "paymentMethod": "GCash",
    "paymentReference": "GCASH-WORKFLOW-001"
  }' | jq -r '.data.donation.id')

echo "Created donation: $DONATION_ID"

# Step 2: Get the donation details
curl -s -X GET "http://localhost:5000/api/donations/$DONATION_ID" | jq .

# Step 3: Update the status
curl -s -X PATCH "http://localhost:5000/api/donations/$DONATION_ID/status" \
  -H "Content-Type: application/json" \
  -d '{"status":"COMPLETED","notes":"Verified"}' | jq .
```

---

## 📊 Common Error Scenarios & Fixes

| Error | Cause | Solution |
|-------|-------|----------|
| 400 Bad Request | Invalid JSON | Check syntax in body |
| 400 Validation error | Invalid UUID | Use correct UUID format |
| 400 Validation error | Amount ≤ 0 | Use positive amount |
| 404 Not Found | Wrong endpoint | Check URL path |
| 500 Internal Server | Server error | Check backend logs |

---

## 💡 Pro Tips

1. **Store IDs in Variables**: Save donation IDs for follow-up requests
2. **Use `jq` for Parsing**: `curl ... | jq '.data.donation.id'` to extract values
3. **Test Async Flow**: Create donation → Wait → Update status
4. **Check Emails**: Verify emails were sent (if configured)
5. **Monitor Points**: Check donor points update after donation

---

**🎉 You're ready to test! Start with "Create Monetary Donation" above.**
