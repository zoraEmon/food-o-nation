# Program Management Testing Guide

## Overview
This guide provides comprehensive testing instructions for the Program Management API using multiple tools: Postman, VS Code REST Client, cURL, and PowerShell.

## Prerequisites

1. **Backend Running**: Ensure the backend server is running on `http://localhost:5000`
2. **Admin Token**: Obtain a valid JWT admin token for authenticated endpoints
3. **Place ID**: Get a valid place ID from the database or create one via the Place API
4. **Database**: Ensure PostgreSQL is running and migrations are applied

## Testing Tools Setup

### Option 1: Postman (Recommended)

**Installation:**
```bash
# Download from https://www.postman.com/downloads/
# Or use Postman web: https://web.postman.co/
```

**Import Collection:**
1. Open Postman
2. Click "Import" button
3. Select `postman-programs-collection.json` from `backend/` folder
4. Collection "Food-O-Nation Program Management API" will be imported

**Configure Variables:**
1. Open the collection settings
2. Edit these variables:
    - `baseUrl`: `http://localhost:5000/api`
   - `adminToken`: Your JWT admin token
   - `placeId`: Valid place UUID from database
   - `programId`: Leave empty (will be populated after create request)

**Running Tests:**
1. Select a request from the collection
2. Click "Send" button
3. Review the response in the "Body" tab
4. Use "Tests" tab to add automated assertions (optional)

---

### Option 2: VS Code REST Client Extension

**Installation:**
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "REST Client"
4. Install by Huachao Mao

**File Location:**
- Test file: `backend/test-programs.http`

**Setup:**
1. Open `test-programs.http` in VS Code
2. Edit the variables at the top:
   ```http
    @baseUrl = http://localhost:5000/api
   @adminToken = your-jwt-token-here
   @newProgramId = will-be-set-after-create
   ```

**Running Tests:**
1. Hover over any request (lines starting with POST/GET/PATCH)
2. Click "Send Request" link
3. Response appears in the right panel
4. Response can be saved to file

**Advanced Features:**
- Run all requests in sequence (VS Code Command Palette: "Rest Client: Send Request")
- Save responses to files
- Create request chains with variables

---

### Option 3: PowerShell cURL

**Prerequisites:**
- PowerShell 5.1+ (Windows)
- curl command available

**Basic Syntax:**
```powershell
$baseUrl = "http://localhost:5000/api"
$adminToken = "your-jwt-token-here"
$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

# GET request
curl -Uri "$baseUrl/programs" -Headers $headers -Method Get

# POST request with body
$body = @{
    title = "Test Program"
    description = "Test description with at least 10 characters"
    date = "2025-12-20T10:00:00Z"
    maxParticipants = 100
    placeId = "your-place-id"
} | ConvertTo-Json

curl -Uri "$baseUrl/programs" -Headers $headers -Method Post -Body $body
```

---

## Test Scenarios

### Scenario 0: Stall Reservations (Donors)
Use the VS Code REST client file `backend/tests/programs/stall-reservations.http` or curl. Seed creates program "Community Market Day - Quezon City" with sample stalls.

**Steps:**
1) List stalls for the seeded program
```
GET /api/programs/{{PROGRAM_ID}}/stalls
```
2) Reserve a stall for a donor (uses donorId; generates QR)
```
POST /api/programs/{{PROGRAM_ID}}/stalls/reserve
Body: { "donorId": "{{DONOR_ID}}" }
```
3) Verify QR fields in response
    - `qrCodeUrl` (Data URL image)
    - `qrCodeRef` (reference string)
4) Get reservation by id to retrieve QR again
```
GET /api/stalls/{{RESERVATION_ID}}
```
5) Set stall capacity (admin)
```
POST /api/programs/{{PROGRAM_ID}}/stalls/capacity
Body: { "capacity": 12 }
```
6) Cancel a reservation
```
POST /api/stalls/{{RESERVATION_ID}}/cancel
```
7) Check-in a reservation
```
POST /api/stalls/{{RESERVATION_ID}}/check-in
```

**Expected:**
- Reservations respect `stallCapacity`; duplicate active reservations per donor are blocked.
- Reservation responses include QR fields (`qrCodeUrl`, `qrCodeRef`).
- Cancel decrements `reservedStalls`; check-in sets status to `CHECKED_IN`.


### Scenario 1: Happy Path - Create and Publish Program

**Steps:**
1. Create a new program (PENDING status)
2. Verify it appears in programs list with PENDING status
3. Update program details (title, description)
4. Publish the program (PENDING → APPROVED)
5. Verify it now appears with APPROVED status

**Expected Results:**
```
Step 1: 201 Created with status: PENDING
Step 2: Program appears in GET /programs?status=PENDING
Step 3: 200 OK with updated fields
Step 4: 200 OK with status: APPROVED
Step 5: Program appears in GET /programs?status=APPROVED
```

**Postman Instructions:**
1. Send: "1. Create Program - Valid"
2. Copy response `data.id` to `{{programId}}`
3. Send: "7. Get All Programs - Filter by Status (PENDING)"
4. Send: "13. Update Program - Title and Description"
5. Send: "18. Publish Program (PENDING → APPROVED)"
6. Send: "8. Get All Programs - Filter by Status (APPROVED)"

---

### Scenario 2: Validation Testing

**Test Cases:**

**a) Title Validation**
```powershell
# Test: Too short (< 3 chars)
$body = @{
    title = "AB"
    description = "Valid description with more than 10 characters"
    date = "2025-12-20T10:00:00Z"
    maxParticipants = 100
    placeId = "valid-place-id"
} | ConvertTo-Json

# Expected: 400 Bad Request
# Error message: "Title must be at least 3 characters"
```

**b) Description Validation**
```powershell
# Test: Too short (< 10 chars)
$body = @{
    title = "Valid Title"
    description = "Short"
    date = "2025-12-20T10:00:00Z"
    maxParticipants = 100
    placeId = "valid-place-id"
} | ConvertTo-Json

# Expected: 400 Bad Request
# Error message: "Description must be at least 10 characters"
```

**c) Date Validation**
```powershell
# Test: Past date
$body = @{
    title = "Old Program"
    description = "This date is in the past"
    date = "2020-12-20T10:00:00Z"
    maxParticipants = 100
    placeId = "valid-place-id"
} | ConvertTo-Json

# Expected: 400 Bad Request
# Error message: "Program date must be in the future"
```

**d) MaxParticipants Validation**
```powershell
# Test: Out of range (> 10000)
$body = @{
    title = "Too Many"
    description = "Maximum participants exceeds the allowed limit"
    date = "2025-12-20T10:00:00Z"
    maxParticipants = 50000
    placeId = "valid-place-id"
} | ConvertTo-Json

# Expected: 400 Bad Request
# Error message: "Maximum participants must be between 1 and 10000"
```

**Postman Requests:**
- "3. Create Program - Title Too Short (Validation Error)"
- "4. Create Program - Date in Past (Validation Error)"
- "5. Create Program - Missing Description (Validation Error)"
- "6. Create Program - Invalid MaxParticipants (Validation Error)"

---

### Scenario 3: Business Rules Testing

**Rule 1: Cannot update maxParticipants after publishing**

```powershell
# Step 1: Create program
$programId = "from-previous-create"

# Step 2: Publish it
# POST /api/programs/{programId}/publish

# Step 3: Try to update maxParticipants
$body = @{
    maxParticipants = 250
} | ConvertTo-Json

curl -Uri "http://localhost:5000/api/programs/$programId" `
  -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
  -Method Patch `
  -Body $body

# Expected: 400 Bad Request
# Error: "Cannot update maximum participants for scheduled or ongoing programs"
```

**Rule 2: Cannot update date after publishing**

```powershell
# Try to change date after publishing
$body = @{
    date = "2025-12-25T10:00:00Z"
} | ConvertTo-Json

# Expected: 400 Bad Request
# Error: "Cannot update program date for scheduled or ongoing programs"
```

**Rule 3: Cannot cancel already completed programs**

```powershell
# If program status is CLAIMED (completed):
# POST /api/programs/{programId}/cancel

# Expected: 400 Bad Request
# Error: "Cannot cancel a program that has already been completed"
```

**Rule 4: Cannot publish already published program**

```powershell
# Step 1: Create and publish program

# Step 2: Try to publish again
# POST /api/programs/{programId}/publish

# Expected: 400 Bad Request
# Error: "Cannot publish program with status 'APPROVED'. Only PENDING programs can be published."
```

---

### Scenario 4: Error Handling

**Not Found (404):**
```powershell
curl -Uri "http://localhost:5000/api/programs/nonexistent-id" `
  -Headers @{"Content-Type"="application/json"} `
  -Method Get

# Expected: 404 Not Found
# Response: { success: false, error: "Program with ID nonexistent-id not found" }
```

**Invalid Place ID:**
```powershell
$body = @{
    title = "Valid Title"
    description = "Valid description with more than 10 characters"
    date = "2025-12-20T10:00:00Z"
    maxParticipants = 100
    placeId = "nonexistent-place-id"
} | ConvertTo-Json

# Expected: 400 Bad Request
# Error: "Place with ID nonexistent-place-id not found"
```

**Missing Required Field:**
```powershell
$body = @{
    title = "Missing Description"
    date = "2025-12-20T10:00:00Z"
    maxParticipants = 100
    placeId = "valid-place-id"
} | ConvertTo-Json

# Expected: 400 Bad Request
# Error array includes: "description is required"
```

---

## Complete PowerShell Test Script

Save as `test-programs.ps1` in backend folder:

```powershell
# ============================================
# Program Management API Test Script
# ============================================

param(
    [string]$baseUrl = "http://localhost:5000/api",
    [string]$adminToken = "your-jwt-token-here",
    [string]$placeId = "your-place-id"
)

$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

function Test-CreateProgram {
    Write-Host "`n=== TEST: Create Program ===" -ForegroundColor Green
    
    $body = @{
        title = "Test Program $(Get-Date -Format 'yyyyMMddHHmmss')"
        description = "This is a test program description with more than 10 characters as required"
        date = "2025-12-20T10:00:00Z"
        maxParticipants = 100
        placeId = $placeId
    } | ConvertTo-Json
    
    $response = curl -Uri "$baseUrl/programs" `
        -Headers $headers `
        -Method Post `
        -Body $body `
        -UseBasicParsing
    
    Write-Host "Response: $($response.Content)"
    return $response | ConvertFrom-Json
}

function Test-GetAllPrograms {
    Write-Host "`n=== TEST: Get All Programs ===" -ForegroundColor Green
    
    $response = curl -Uri "$baseUrl/programs" `
        -Headers @{"Content-Type"="application/json"} `
        -Method Get `
        -UseBasicParsing
    
    Write-Host "Response: $($response.Content)"
}

function Test-PublishProgram {
    param([string]$programId)
    Write-Host "`n=== TEST: Publish Program ===" -ForegroundColor Green
    
    $response = curl -Uri "$baseUrl/programs/$programId/publish" `
        -Headers $headers `
        -Method Post `
        -Body "{}" `
        -UseBasicParsing
    
    Write-Host "Response: $($response.Content)"
}

function Test-CancelProgram {
    param([string]$programId)
    Write-Host "`n=== TEST: Cancel Program ===" -ForegroundColor Green
    
    $body = @{
        reason = "Testing cancellation"
    } | ConvertTo-Json
    
    $response = curl -Uri "$baseUrl/programs/$programId/cancel" `
        -Headers $headers `
        -Method Post `
        -Body $body `
        -UseBasicParsing
    
    Write-Host "Response: $($response.Content)"
}

# Run tests
$createResult = Test-CreateProgram
$programId = $createResult.data.id

Test-GetAllPrograms
Test-PublishProgram -programId $programId
Test-CancelProgram -programId $programId

Write-Host "`n=== All tests completed ===" -ForegroundColor Cyan
```

**Run the script:**
```powershell
.\test-programs.ps1 -baseUrl "http://localhost:5000/api" `
  -adminToken "your-token" `
  -placeId "your-place-id"
```

---

## Performance Testing

### Load Testing Example (using PowerShell)

```powershell
function Load-Test-CreatePrograms {
    param(
        [int]$numberOfPrograms = 10
    )
    
    Write-Host "Creating $numberOfPrograms programs..."
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    
    for ($i = 1; $i -le $numberOfPrograms; $i++) {
        $body = @{
            title = "Load Test Program $i"
            description = "This is a load test program number $i with sufficient description"
            date = "2025-12-20T10:00:00Z"
            maxParticipants = 100
            placeId = $placeId
        } | ConvertTo-Json
        
        curl -Uri "$baseUrl/programs" `
            -Headers $headers `
            -Method Post `
            -Body $body `
            -UseBasicParsing | Out-Null
        
        Write-Progress -Activity "Creating programs" -CurrentOperation "Program $i" -PercentComplete (($i/$numberOfPrograms)*100)
    }
    
    $sw.Stop()
    Write-Host "Created $numberOfPrograms programs in $($sw.ElapsedMilliseconds)ms" -ForegroundColor Green
}

Load-Test-CreatePrograms -numberOfPrograms 50
```

---

## Debugging Tips

### Enable Verbose Logging

**In PowerShell:**
```powershell
$DebugPreference = "Continue"
curl -Uri "http://localhost:5000/api/programs" -Verbose
```

### Inspect Request Headers

**Postman:**
1. Open request
2. Click "Headers" tab
3. All sent headers are visible

**REST Client:**
1. Open test-programs.http
2. Hover over request name
3. Click "Toggle Comment" to see headers being sent

### Save Response for Analysis

**Postman:**
1. Get response
2. Click "Save Response"
3. Choose format (JSON, etc.)

**PowerShell:**
```powershell
$response = curl -Uri "..." | ConvertFrom-Json
$response | ConvertTo-Json -Depth 10 | Out-File response.json
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check admin token is valid and included in Authorization header |
| 404 Not Found | Verify program ID exists; check placeId exists in database |
| 400 Bad Request | Check validation errors in response; ensure all required fields present |
| Connection refused | Ensure backend server is running on port 5000 |
| Token expired | Generate new admin token and update in tool |
| Database errors | Check Prisma migrations are applied: `npx prisma migrate deploy` |

---

## Automated Testing Integration

### Jest Test Example

Create `test-programs.test.ts`:

```typescript
describe('Program Management API', () => {
    const baseUrl = 'http://localhost:5000/api';
  
  it('should create a program', async () => {
    const response = await fetch(`${baseUrl}/programs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ADMIN_TOKEN}`
      },
      body: JSON.stringify({
        title: 'Test Program',
        description: 'Test description with more than 10 characters',
        date: '2025-12-20T10:00:00Z',
        maxParticipants: 100,
        placeId: process.env.PLACE_ID
      })
    });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('PENDING');
  });
});
```

Run with:
```bash
npm test test-programs.test.ts
```

---

## Next Steps

1. **Integrate into Main Routes**: Update `backend/src/routes/index.ts` to use `program.routes.v2.ts`
2. **Create Database Migration**: Run `npx prisma migrate dev --name add_program_status`
3. **Deploy**: Ensure v2 routes are active before deploying
4. **Monitor**: Use logs to track program creation and status changes
