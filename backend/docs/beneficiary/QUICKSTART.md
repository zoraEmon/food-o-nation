# Beneficiary System - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Get Admin Token
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "foodonation.org@gmail.com",
  "password": "secureAdmin123!",
  "loginType": "ADMIN"
}
```

Copy the `token` from response.

---

### 2. Create Beneficiary
```http
POST http://localhost:5000/api/beneficiaries
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "gender": "MALE",
  "birthDate": "1985-05-15T00:00:00Z",
  "age": 39,
  "civilStatus": "MARRIED",
  "contactNumber": "09171234567",
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
  "address": {
    "streetNumber": "123 Mabuhay Street",
    "barangay": "Barangay Libis",
    "municipality": "Quezon City",
    "region": "NCR",
    "zipCode": "1110"
  },
  "householdMembers": [
    {
      "fullName": "Maria Dela Cruz",
      "birthDate": "1988-03-20T00:00:00Z",
      "age": 36,
      "relationship": "Wife"
    }
  ],
  "userId": "clq123...xyz" // Get from User table in Prisma Studio
}
```

---

### 3. Get All Beneficiaries
```http
GET http://localhost:5000/api/beneficiaries
Authorization: Bearer YOUR_TOKEN
```

---

### 4. Get Single Beneficiary
```http
GET http://localhost:5000/api/beneficiaries/{BENEFICIARY_ID}
Authorization: Bearer YOUR_TOKEN
```

---

### 5. Update Beneficiary
```http
PATCH http://localhost:5000/api/beneficiaries/{BENEFICIARY_ID}
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "monthlyIncome": 20000,
  "mainEmploymentStatus": "EMPLOYED_FULL_TIME",
  "receivingAid": false
}
```

---

### 6. Create Food Security Survey
```http
POST http://localhost:5000/api/beneficiaries/{BENEFICIARY_ID}/food-security-surveys
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "q1": "SOMETIMES",
  "q2": "OFTEN",
  "q3": "RARELY",
  "q4": "SOMETIMES",
  "q5": "NEVER",
  "q6": "SOMETIMES"
}
```

---

## 📚 Key Resources

- **Full API Guide:** [BENEFICIARY_API_TESTING.md](BENEFICIARY_API_TESTING.md)
- **Implementation Details:** [BENEFICIARY_IMPLEMENTATION_SUMMARY.md](BENEFICIARY_IMPLEMENTATION_SUMMARY.md)
- **Test Cases:** [test-beneficiary.http](test-beneficiary.http)
- **Automated Tests:** `node test-beneficiary.mjs`

---

## 🎯 Enum Values Reference

### householdPosition
- `MOTHER`
- `FATHER`
- `OTHER_RELATIVE`
- `NON_RELATIVE_GUARDIAN`

### gender
- `MALE`
- `FEMALE`
- `OTHER`

### civilStatus
- `SINGLE`
- `MARRIED`
- `DIVORCED`
- `WIDOWED`

### incomeSources (array)
- `FORMAL_SALARIED`
- `INFORMAL_GIG`
- `GOV_ASSISTANCE`
- `REMITTANCE`
- `NONE`

### mainEmploymentStatus
- `EMPLOYED_FULL_TIME`
- `EMPLOYED_PART_TIME`
- `RECENTLY_UNEMPLOYED`
- `LONG_TERM_UNEMPLOYED`
- `RETIRED_DISABLED`

### Food Security Survey Responses
- `NEVER` (0 days/week) → 0 points
- `RARELY` (1-2 days/week) → 1 point
- `SOMETIMES` (3-4 days/week) → 2 points
- `OFTEN` (5-7 days/week) → 3 points

---

## ⚙️ Setup Checklist

- [ ] Database migration run: `npx prisma migrate dev --name add_beneficiary_application_fields`
- [ ] Prisma client regenerated: `npx prisma generate`
- [ ] Backend server restarted: `npm run dev`
- [ ] Admin token obtained
- [ ] Test beneficiary created successfully
- [ ] Food security survey created

---

**Status:** ✅ Production Ready | **Updated:** Dec 12, 2025
