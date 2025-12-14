# Beneficiary Application Testing Guide

## 📋 Overview

This guide provides comprehensive instructions for testing the beneficiary registration system, including household member management, food security surveys, and all related endpoints.

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js v18+ installed
- PostgreSQL database running
- Backend server running (`npm run dev`)
- `.env` file configured with DATABASE_URL

### Step 1: Get Admin Token

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "foodonation.org@gmail.com",
  "password": "secureAdmin123!",
  "loginType": "ADMIN"
}
```

Copy the returned JWT token and paste it into `test-beneficiary.http` line 2:
```
@adminToken = your-copied-jwt-token-here
```

### Step 2: Get Valid User ID

```powershell
# Open Prisma Studio and get an existing User ID
npx prisma studio
# Go to User table and copy any UUID
```

Or create a test user:
```http
POST http://localhost:5000/api/auth/register/beneficiary
Content-Type: application/json

{
  "email": "testbeneficiary@example.com",
  "password": "TestPassword123!",
  "firstName": "Test",
  "lastName": "User",
  "gender": "MALE",
  "birthDate": "1990-01-01T00:00:00Z",
  "age": 34,
  "civilStatus": "SINGLE",
  "contactNumber": "09171234567",
  "householdNumber": 1,
  "streetNumber": "123 Test St",
  "barangay": "Test Barangay",
  "municipality": "Test City",
  "zipCode": "1000"
}
```

Copy the returned `userId` from response.

### Step 3: Run Tests

```powershell
# Option A: Using REST Client (VS Code)
Open test-beneficiary.http and click "Send Request"

# Option B: Automated testing
cd backend
node test-beneficiary.mjs

# Option C: Using cURL (see examples below)
```

---

## 🧪 Testing Methods

### Method 1: REST Client (Recommended for Manual Testing)

**Prerequisites:**
- Install REST Client extension in VS Code

**Steps:**
1. Open `backend/test-beneficiary.http`
2. Update variables (lines 1-2)
3. Click "Send Request" above any test

**Features:**
- Visual request/response editor
- Variables support
- Color-coded responses
- No command line needed

---

### Method 2: Automated Testing with Node.js

**Run All Tests:**
```powershell
cd backend
node test-beneficiary.mjs
```

**Output:**
```
✅ Beneficiary created: abc-123-def
📊 Name: Juan Dela Cruz
📊 Household: 6 members
✅ Retrieved 5 beneficiary(ies)
ℹ️ First beneficiary: Maria Santos
...
```

**What Gets Tested:**
1. ✅ Create beneficiary application
2. ✅ Get all beneficiaries
3. ✅ Get single beneficiary
4. ✅ Update beneficiary
5. ✅ Create food security survey
6. ✅ Get survey list
7. ✅ Validation error handling

---

### Method 3: cURL Commands

#### Create Beneficiary
```powershell
$body = @{
  firstName = "Juan"
  lastName = "Dela Cruz"
  gender = "MALE"
  birthDate = "1985-05-15T00:00:00Z"
  age = 39
  civilStatus = "MARRIED"
  contactNumber = "09171234567"
  householdNumber = 6
  userId = "your-user-id"
  householdPosition = "FATHER"
  primaryPhone = "09171234567"
  childrenCount = 3
  adultCount = 2
  seniorCount = 1
  pwdCount = 1
  specialDietRequired = $false
  monthlyIncome = 15000
  incomeSources = @("INFORMAL_GIG", "REMITTANCE")
  mainEmploymentStatus = "EMPLOYED_PART_TIME"
  receivingAid = $true
  declarationAccepted = $true
  privacyAccepted = $true
  address = @{
    streetNumber = "123 Mabuhay Street"
    barangay = "Barangay Libis"
    municipality = "Quezon City"
    region = "NCR"
    zipCode = "1110"
  }
} | ConvertTo-Json

curl -X POST http://localhost:5000/api/beneficiaries `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d $body
```

#### Get All Beneficiaries
```powershell
curl -X GET http://localhost:5000/api/beneficiaries `
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get Beneficiary by ID
```powershell
curl -X GET http://localhost:5000/api/beneficiaries/BENEFICIARY_ID `
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Update Beneficiary
```powershell
$updateBody = @{
  monthlyIncome = 20000
  mainEmploymentStatus = "EMPLOYED_FULL_TIME"
  childrenCount = 2
} | ConvertTo-Json

curl -X PATCH http://localhost:5000/api/beneficiaries/BENEFICIARY_ID `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d $updateBody
```

#### Create Food Security Survey
```powershell
$surveyBody = @{
  q1 = "SOMETIMES"
  q2 = "OFTEN"
  q3 = "RARELY"
  q4 = "SOMETIMES"
  q5 = "NEVER"
  q6 = "SOMETIMES"
} | ConvertTo-Json

curl -X POST http://localhost:5000/api/beneficiaries/BENEFICIARY_ID/food-security-surveys `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d $surveyBody
```

---

## 📊 API Endpoints Reference

### Beneficiary Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/beneficiaries` | Create new beneficiary application | ✅ Admin |
| GET | `/api/beneficiaries` | Get all beneficiaries | ✅ Admin |
| GET | `/api/beneficiaries/:id` | Get single beneficiary | ✅ Admin |
| PATCH | `/api/beneficiaries/:id` | Update beneficiary | ✅ Admin |

### Food Security Survey Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/beneficiaries/:id/food-security-surveys` | Create survey | ✅ Admin |
| GET | `/api/beneficiaries/:id/food-security-surveys` | Get all surveys for beneficiary | ✅ Admin |
| GET | `/api/beneficiaries/:id/food-security-surveys/latest` | Get most recent survey | ✅ Admin |
| GET | `/api/beneficiaries/:id/food-security-surveys/:surveyId` | Get specific survey | ✅ Admin |

---

## 📋 Request/Response Examples

### Create Beneficiary - Success Response
```json
{
  "success": true,
  "data": {
    "id": "abc123def456",
    "firstName": "Juan",
    "lastName": "Dela Cruz",
    "gender": "MALE",
    "age": 39,
    "householdNumber": 6,
    "householdPosition": "FATHER",
    "primaryPhone": "09171234567",
    "childrenCount": 3,
    "adultCount": 2,
    "seniorCount": 1,
    "pwdCount": 1,
    "monthlyIncome": 15000,
    "incomeSources": ["INFORMAL_GIG", "REMITTANCE"],
    "mainEmploymentStatus": "EMPLOYED_PART_TIME",
    "receivingAid": true,
    "declarationAccepted": true,
    "privacyAccepted": true,
    "createdAt": "2025-12-12T10:30:00Z",
    "address": {
      "id": "addr123",
      "streetNumber": "123 Mabuhay Street",
      "barangay": "Barangay Libis",
      "municipality": "Quezon City",
      "region": "NCR",
      "zipCode": "1110"
    },
    "householdMembers": [
      {
        "id": "member1",
        "fullName": "Maria Dela Cruz",
        "birthDate": "1988-03-20T00:00:00Z",
        "age": 36,
        "relationship": "Wife"
      }
    ],
    "user": {
      "id": "user123",
      "email": "juan@example.com",
      "status": "APPROVED"
    }
  }
}
```

### Create Beneficiary - Validation Error
```json
{
  "success": false,
  "errors": [
    {
      "field": "firstName",
      "message": "First name is required"
    },
    {
      "field": "householdPosition",
      "message": "Invalid enum value. Expected 'MOTHER' | 'FATHER' | 'OTHER_RELATIVE' | 'NON_RELATIVE_GUARDIAN'"
    },
    {
      "field": "declarationAccepted",
      "message": "Must accept declaration to proceed"
    }
  ]
}
```

### Food Security Survey - Success Response
```json
{
  "success": true,
  "data": {
    "id": "survey123",
    "beneficiaryId": "ben456",
    "q1": "SOMETIMES",
    "q2": "OFTEN",
    "q3": "RARELY",
    "q4": "SOMETIMES",
    "q5": "NEVER",
    "q6": "SOMETIMES",
    "totalScore": 7,
    "severity": "MODERATE",
    "periodStart": "2025-11-12T00:00:00Z",
    "periodEnd": "2025-12-12T00:00:00Z",
    "createdAt": "2025-12-12T10:35:00Z",
    "updatedAt": "2025-12-12T10:35:00Z"
  }
}
```

---

## 🎨 Data Structures

### Beneficiary Application Fields

#### Personal Information
```typescript
firstName: string              // Required
lastName: string               // Required
middleName?: string            // Optional
gender: Gender                 // MALE | FEMALE | OTHER
birthDate: string (ISO 8601)  // Required
age: number                    // Required (calculated)
civilStatus: CivilStatus       // SINGLE | MARRIED | DIVORCED | WIDOWED
contactNumber: string          // Required, min 11 digits
occupation?: string            // Optional
```

#### Household Position & Contact
```typescript
householdPosition: HouseholdPosition  // MOTHER | FATHER | OTHER_RELATIVE | NON_RELATIVE_GUARDIAN
householdPositionDetail?: string      // Specify relationship if OTHER
primaryPhone: string                  // Required, min 11 digits
activeEmail?: string                  // Optional, must be email
governmentIdType?: string             // e.g., PhilID, UMID, SSS
governmentIdFileUrl?: string          // URL to digital copy
```

#### Household Composition
```typescript
householdNumber: number        // Total members eating in household
childrenCount: number          // Ages 0-17
adultCount: number             // Ages 18-64
seniorCount: number            // Ages 65+
pwdCount: number               // Persons with disability
```

#### Health & Diet
```typescript
specialDietRequired: boolean   // Does household have dietary restrictions?
specialDietDescription?: string // e.g., "Gluten-free due to celiac disease"
```

#### Economic Status
```typescript
monthlyIncome?: number                      // Total household monthly income
incomeSources: IncomeSource[]              // FORMAL_SALARIED | INFORMAL_GIG | GOV_ASSISTANCE | REMITTANCE | NONE
mainEmploymentStatus?: MainEmploymentStatus // EMPLOYED_FULL_TIME | EMPLOYED_PART_TIME | RECENTLY_UNEMPLOYED | LONG_TERM_UNEMPLOYED | RETIRED_DISABLED
householdAnnualSalary?: number             // Optional, annual income
receivingAid: boolean                       // Currently receiving government/NGO aid?
receivingAidDetail?: string                 // Specify which programs
```

#### Consent & Declaration
```typescript
declarationAccepted: boolean   // "I declare all info is true and accurate"
privacyAccepted: boolean       // "I consent to use of my info"
signatureUrl?: string          // URL to e-signature image
```

#### Address
```typescript
address: {
  streetNumber: string         // e.g., "123 Main Street"
  barangay: string             // Barangay name
  municipality: string         // City/municipality
  region?: string              // Region (NCR, CAR, etc.)
  country?: string             // Default: Philippines
  zipCode?: string             // Postal code
}
```

#### Household Members List
```typescript
householdMembers?: {
  fullName: string
  birthDate: string (ISO 8601)
  age: number
  relationship: string  // e.g., "Wife", "Son", "Mother"
}[]
```

---

## 🎯 Scenario-Based Testing

### Scenario 1: Complete Beneficiary Application

**Goal:** Register a complete beneficiary with all details

**Steps:**
1. Create beneficiary with all fields filled
2. Verify all fields saved correctly
3. Get beneficiary and confirm data integrity
4. Update economic status
5. Add additional household members
6. Create food security survey

**Expected Result:** All data persists, relationships intact

---

### Scenario 2: Minimal Application

**Goal:** Register beneficiary with only required fields

**Fields Provided:**
- Basic personal info
- Household position
- Address
- Consent (both checked)
- Household composition

**Expected Result:** Beneficiary created successfully, optional fields null/default

---

### Scenario 3: Household Member Management

**Goal:** Test household member CRUD operations

**Steps:**
1. Create beneficiary with 3 household members
2. Update to replace members
3. Verify old members deleted
4. Verify new members created
5. Confirm household counts updated

**Expected Result:** Members properly deleted and recreated on update

---

### Scenario 4: Food Security Survey Tracking

**Goal:** Track beneficiary's food security status over time

**Steps:**
1. Create beneficiary
2. Survey 1 (Month 1): Moderate food insecurity (score 7)
3. Survey 2 (Month 2): Improved (score 4)
4. Survey 3 (Month 3): Severe relapse (score 10)
5. Query all surveys
6. Get latest survey
7. Verify severity calculations

**Expected Results:**
- Survey 1: severity = MODERATE
- Survey 2: severity = MILD
- Survey 3: severity = SEVERE
- Sorted by date when queried

---

### Scenario 5: Validation Testing

**Goal:** Verify validation catches all errors

**Invalid Cases:**
1. Missing `declarationAccepted` → 400 error
2. Phone number too short → 400 error
3. Invalid household position → 400 error
4. Missing address fields → 400 error
5. Non-email in activeEmail → 400 error
6. Invalid employment status → 400 error

**Expected Result:** All return 400 with specific field errors

---

## 📊 Food Security Survey Scoring

### Score Calculation
- NEVER = 0 points
- RARELY = 1 point
- SOMETIMES = 2 points
- OFTEN = 3 points

**Total Score:** Sum of all 6 questions (0-18)

### Severity Mapping
| Score | Severity | Interpretation |
|-------|----------|-----------------|
| 0-1 | SECURE | Food secure household |
| 2-3 | MILD | Mild food insecurity |
| 4-7 | MODERATE | Moderate food insecurity |
| 8-18 | SEVERE | Severe food insecurity |

### Example Scoring
```
Q1: SOMETIMES (2)
Q2: OFTEN (3)
Q3: RARELY (1)
Q4: SOMETIMES (2)
Q5: NEVER (0)
Q6: SOMETIMES (2)

Total: 2+3+1+2+0+2 = 10
Severity: SEVERE
```

---

## 🔍 Debugging & Troubleshooting

### Issue: "User not found"

**Solution:**
```powershell
# Get a valid user ID from database
npx prisma studio
# Go to User table, copy any ID
```

Or create a new user via auth endpoint.

---

### Issue: "Beneficiary not found" when updating

**Check:**
1. Beneficiary ID is correct UUID format
2. Beneficiary was created successfully
3. Use correct ID from create response

---

### Issue: "Invalid household position"

**Valid Values:**
- `MOTHER`
- `FATHER`
- `OTHER_RELATIVE`
- `NON_RELATIVE_GUARDIAN`

---

### Issue: Food Security Survey returns null severity

**Check:**
1. All 6 questions (q1-q6) are filled
2. Valid frequency values: NEVER, RARELY, SOMETIMES, OFTEN
3. Service correctly calculates score and maps to severity

---

### Issue: "Email already exists"

**Solution:**
Use a unique email in activeEmail field, or omit it if optional

---

## 📈 Load Testing

### Create 10 Beneficiaries
```powershell
for ($i = 1; $i -le 10; $i++) {
  $email = "beneficiary$i@example.com"
  $body = @{
    # ... full beneficiary data with unique firstName/email
  } | ConvertTo-Json
  
  curl -X POST http://localhost:5000/api/beneficiaries `
    -H "Content-Type: application/json" `
    -H "Authorization: Bearer YOUR_TOKEN" `
    -d $body
}
```

---

## 📝 Monitoring & Logging

### Backend Console
Watch for:
```
✅ Beneficiary created: abc123def456
✅ Beneficiary updated: abc123def456
❌ Validation error: Missing required field
📧 Email sent: verification@example.com
```

### Database Verification
```powershell
npx prisma studio
# Check:
# 1. Beneficiary table
# 2. HouseholdMember table
# 3. FoodSecuritySurvey table
# 4. Address table
```

---

## ✅ Success Criteria Checklist

After running all tests, verify:

- [ ] Beneficiary created successfully
- [ ] All personal fields saved correctly
- [ ] Address relationship working
- [ ] Household members list created
- [ ] Food security survey created
- [ ] Score calculated correctly
- [ ] Severity level assigned
- [ ] Beneficiary can be retrieved
- [ ] Beneficiary can be updated
- [ ] Household members can be replaced
- [ ] Validation errors returned for bad data
- [ ] All timestamps correct (createdAt, updatedAt)

---

## 🎓 Learning Path

1. **Start:** Scenario 1 (Complete Application)
2. **Explore:** Scenario 2 (Minimal Data)
3. **Practice:** Scenario 3 (Household Management)
4. **Advanced:** Scenario 4 (Survey Tracking)
5. **Validate:** Scenario 5 (Error Handling)

---

**Last Updated:** December 12, 2025
**Status:** ✅ Complete and Production Ready
