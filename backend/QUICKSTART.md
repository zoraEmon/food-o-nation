# 🚀 Quick Start Guide - Donation API Testing

## ⚡ Fast Track (5 Minutes)

### Step 1: Start Backend (30 seconds)
```powershell
cd backend
npm run dev
```

### Step 2: Get Test Data (30 seconds)
```powershell
node get-test-ids.mjs
```

**Copy the output** - you'll see something like:
```
@donorId = 550e8400-e29b-41d4-a716-446655440000
@donationCenterId = 660e8400-e29b-41d4-a716-446655440000
```

### Step 3: Choose Your Testing Method

#### Option A: REST Client (VS Code) - EASIEST ⭐
1. Install "REST Client" extension in VS Code
2. Open `backend/test-donations.http`
3. Paste the IDs at the top (lines 5-6)
4. Click "Send Request" above any test
5. View results instantly!

#### Option B: Automated Script - FASTEST 🚀
1. Open `backend/test-donations.mjs`
2. Update TEST_DATA (lines 14-16) with your IDs
3. Run: `node test-donations.mjs`
4. Watch all tests run automatically!

#### Option C: cURL - MANUAL 🔧
```powershell
# Create Monetary Donation
curl -X POST http://localhost:5000/api/donations/monetary `
  -H "Content-Type: application/json" `
  -d '{
    "donorId": "YOUR_DONOR_ID",
    "amount": 1000,
    "paymentMethod": "GCash",
    "paymentReference": "GCASH-123456"
  }'
```

---

## 📋 Test Checklist

### Basic Tests (Try These First)
- [ ] Create a monetary donation
- [ ] Create a produce donation
- [ ] Get donation by ID
- [ ] List all donations

### Advanced Tests
- [ ] Filter donations by status
- [ ] Filter donations by date range
- [ ] Update donation status
- [ ] Test validation errors

---

## 🎯 Expected Results

### ✅ Successful Monetary Donation
```json
{
  "success": true,
  "message": "Monetary donation created successfully",
  "data": {
    "donation": {
      "id": "...",
      "status": "COMPLETED",
      "amount": 1000,
      ...
    }
  }
}
```

**Side Effects:**
- ✉️ Donor receives confirmation email
- ✉️ All admins receive notification email
- 🏆 Donor points updated (+100 points for ₱1000)

### ✅ Successful Produce Donation
```json
{
  "success": true,
  "message": "Produce donation scheduled successfully",
  "data": {
    "donation": {
      "id": "...",
      "status": "SCHEDULED",
      "qrCodeRef": "data:image/png;base64,...",
      "items": [...]
    }
  }
}
```

**Side Effects:**
- 📱 QR code generated and stored
- ✉️ Donor receives email with QR code
- ✉️ All admins receive notification email

---

## ❌ Common Issues & Fixes

### "Donor not found"
**Fix:** Run `node get-test-ids.mjs` to get valid donor IDs

### "Donation center not found"
**Fix:** Run `node get-test-ids.mjs` or add centers via Prisma Studio

### Email not sending
**Fix:** Add to `backend/.env`:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### "fetch is not defined" (Node.js < 18)
**Fix:** Upgrade Node.js or use REST Client instead

---

## 📊 What Gets Created

When you test the API, these records are created in your database:

### Monetary Donation:
- ✅ Donation record (status: COMPLETED)
- ✅ DonationItem record (category: Monetary)
- ✅ Donor points updated
- ✅ Donor totalDonation updated

### Produce Donation:
- ✅ Donation record (status: SCHEDULED)
- ✅ Multiple DonationItem records
- ✅ QR code generated and stored
- ✅ Image URLs stored (if uploaded)

---

## 🔍 View Your Data

### Prisma Studio (Recommended)
```powershell
cd backend
npx prisma studio
```
Opens a web UI at http://localhost:5555

### Database Queries
```sql
-- View recent donations
SELECT * FROM "Donation" ORDER BY "createdAt" DESC LIMIT 10;

-- View donation items
SELECT * FROM "DonationItem" WHERE "donationId" = 'YOUR_DONATION_ID';

-- View donor points
SELECT "displayName", "totalDonation", "points" FROM "Donor";
```

---

## 💡 Pro Tips

1. **Test in Order:**
   - Start with monetary donation (simpler)
   - Then try produce donation (more complex)
   - Finally test filters and updates

2. **Check Emails:**
   - Set up email first to see notifications
   - Check spam folder if emails don't arrive

3. **Use REST Client:**
   - Fastest way to test
   - No need to install Postman
   - Results right in VS Code

4. **Automate Testing:**
   - Use `test-donations.mjs` for regression testing
   - Run it after every code change

5. **Monitor Console:**
   - Backend logs show what's happening
   - Look for "Email sent" messages
   - Check for errors

---

## 📖 Full Documentation

For detailed documentation, see:
- **API Reference:** `DONATION_API_TESTING.md`
- **Implementation Details:** `DONATION_IMPLEMENTATION_SUMMARY.md`

---

## 🆘 Need Help?

### Common Questions:

**Q: Where do I get donor and donation center IDs?**
A: Run `node get-test-ids.mjs`

**Q: How do I test without a frontend?**
A: Use REST Client extension or the Node.js test script

**Q: Can I test file uploads?**
A: Yes! Use REST Client with multipart/form-data or Postman

**Q: How do I see the QR code?**
A: Copy the qrCodeRef value and paste in browser address bar

**Q: How do I configure admin emails?**
A: Add ADMIN_EMAILS to .env (comma-separated)

---

## ✨ Success!

If you can:
- ✅ Create donations via API
- ✅ See them in Prisma Studio
- ✅ Receive email notifications

Then everything is working perfectly! 🎉

---

**Ready to test? Pick a method above and start creating donations!**
