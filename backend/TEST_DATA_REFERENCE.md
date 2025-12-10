# 🧪 Test Data Reference

This file contains information about the seeded test data for the Food-O-Nation donation system.

**Last Seeded:** December 8, 2025

---

## 🔑 Test Credentials

### Admin Account
```
Email: foodonation.org@gmail.com
Password: secureAdmin123!
Role: ADMIN
```

### Test Donor Accounts
**All test donors use the same password:** `TestPassword123!`

| Email | Display Name | Type | ID |
|-------|-------------|------|-----|
| john.donor@test.com | John Generous Donor | INDIVIDUAL | eda3a03e-4542-4cba-b4d5-2ecb5f60e186 |
| maria.philanthropist@test.com | Maria Philanthropist | INDIVIDUAL | a20940e2-5f3e-4466-ad96-3ce06dbf068f |
| abc.corporation@test.com | ABC Corporation | ORGANIZATION | a2c8d74b-0a8a-49e3-b6c2-58f7592021e1 |
| good.samaritan.foundation@test.com | Good Samaritan Foundation | ORGANIZATION | ec8f8e5c-6179-444a-adc9-f3cb3277223b |
| local.bakery@test.com | Local Bakery Shop | BUSINESS | e187c1b2-6829-4099-9c0a-61ecb4978d1d |

---

## 🏢 Donation Centers

| ID | Name | Address | Contact |
|----|------|---------|---------|
| a442218b-3bb8-4a4f-9352-46969a162137 | Main Distribution Center - Quezon City | 123 Commonwealth Avenue, Quezon City | qc.center@foodonation.org \| +63 917 123 4567 |
| 26d82d4c-47c7-4448-bb04-25e9cf6f1c4b | Manila Central Food Hub | 456 Rizal Avenue, Manila City | manila.hub@foodonation.org \| +63 917 234 5678 |
| 694ffbd3-011c-4e70-81d6-19b9377d8a07 | Makati Corporate Donation Center | 789 Ayala Avenue, Makati City | makati.center@foodonation.org \| +63 917 345 6789 |
| 960e69fc-9bc4-451f-830f-2d6294676eed | Pasig Community Kitchen | 321 Ortigas Avenue, Pasig City | pasig.kitchen@foodonation.org \| +63 917 456 7890 |
| 250c4cb6-55f9-43c0-a15c-1efb65b93add | Taguig Donation Hub | 654 McKinley Road, Taguig City | taguig.hub@foodonation.org \| +63 917 567 8901 |

---

## 🚀 Quick Start Testing

### 1. Update Test Files

**For `test-donations.http`:**
```http
@donorId = a20940e2-5f3e-4466-ad96-3ce06dbf068f
@donationCenterId = 250c4cb6-55f9-43c0-a15c-1efb65b93add
```

**For `test-donations.mjs`:**
```javascript
const TEST_DATA = {
  donorId: 'a20940e2-5f3e-4466-ad96-3ce06dbf068f',
  donationCenterId: '250c4cb6-55f9-43c0-a15c-1efb65b93add',
};
```

### 2. Run Tests

```powershell
# Automated tests
node test-donations.mjs

# Or use REST Client in VS Code
# Open test-donations.http and click "Send Request"
```

---

## 🔄 Re-seeding Data

To re-run the seed (adds new data if not exists):

```powershell
cd backend
npx prisma db seed
```

To completely reset and re-seed:

```powershell
cd backend
npx prisma migrate reset
# This will:
# 1. Drop all data
# 2. Re-run migrations
# 3. Run seed script automatically
```

---

## 📊 Test Data Characteristics

### Donor Diversity
- **2 Individuals:** Regular people making donations
- **2 Organizations:** Non-profit foundations
- **1 Business:** Commercial entity donating surplus

### Center Coverage
- **5 Major Areas:** QC, Manila, Makati, Pasig, Taguig
- **Real Coordinates:** Actual latitude/longitude for testing maps
- **Contact Info:** Realistic format for testing

### Use Cases
- ✅ Test different donor types (individual, org, business)
- ✅ Test multiple drop-off locations
- ✅ Test email notifications
- ✅ Test points system across donor types
- ✅ Test filtering and searching

---

## 🧹 Cleaning Test Data

If you want to remove only test data (keep admin):

```sql
-- Connect to your database and run:
DELETE FROM "Donation" WHERE "donorId" IN (
  SELECT id FROM "Donor" WHERE "userId" IN (
    SELECT id FROM "User" WHERE email LIKE '%@test.com'
  )
);

DELETE FROM "Donor" WHERE "userId" IN (
  SELECT id FROM "User" WHERE email LIKE '%@test.com'
);

DELETE FROM "User" WHERE email LIKE '%@test.com';

DELETE FROM "DonationCenter" WHERE "placeId" IN (
  SELECT id FROM "Place" WHERE name LIKE '%Distribution Center%' 
  OR name LIKE '%Food Hub%' 
  OR name LIKE '%Kitchen%'
);

DELETE FROM "Place" WHERE name LIKE '%Distribution Center%' 
  OR name LIKE '%Food Hub%' 
  OR name LIKE '%Kitchen%';
```

---

## 📝 Notes

- **Password:** All test donors use `TestPassword123!`
- **Status:** All test accounts are pre-approved (APPROVED status)
- **Points:** All start with 0 points
- **Donations:** All start with 0 total donations
- **Emails:** All test emails use `@test.com` domain
- **Production:** These accounts should NOT be used in production!

---

## ⚠️ Important Reminders

1. **Test Only:** These are for testing purposes only
2. **Not Production:** Do not use test credentials in production
3. **Re-seedable:** Safe to re-run seed script (checks for existing data)
4. **Identifiable:** All test emails end with `@test.com`
5. **Documented:** Keep this file updated if seed data changes

---

**For more testing information, see:**
- `QUICKSTART.md` - Quick start guide
- `DONATION_API_TESTING.md` - Complete API testing guide
- `API_REFERENCE.md` - API endpoint reference
