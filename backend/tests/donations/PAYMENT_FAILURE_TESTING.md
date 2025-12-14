# Payment Failure Path Testing Guide

## Overview

This guide documents comprehensive testing of payment failure scenarios in the monetary donation system. It ensures proper error handling and validation across all payment methods (GCash, Bank Transfer, PayPal, Stripe, Mastercard, Visa).

## Test Files

### 1. **test-payment-failures.mjs** (Automated Node.js Tests)
Comprehensive automated test suite that validates all failure paths with automatic report generation.

**Location:** `backend/tests/donations/test-payment-failures.mjs`

**Features:**
- ✅ Automated test execution
- ✅ Stripe PaymentIntent creation
- ✅ PayPal Order creation
- ✅ Test result summary with pass/fail stats
- ✅ Detailed error reporting

**Usage:**
```bash
# Make executable
chmod +x backend/tests/donations/test-payment-failures.mjs

# Run tests
node backend/tests/donations/test-payment-failures.mjs
```

### 2. **test-payment-failures.http** (VS Code REST Client)
Manual REST requests for interactive testing using the VS Code REST Client extension.

**Location:** `backend/tests/donations/test-payment-failures.http`

**Installation:**
```
VS Code Extensions → Search "rest-client" → Install humao.rest-client
```

**Usage:**
- Open the file in VS Code
- Click "Send Request" above any request
- View response in the output panel

---

## Test Cases

### GROUP 1: Reference Validation

These tests validate the basic reference check for GCash and Bank Transfer methods.

#### Test 1.1: GCash Reference Too Short
**Expected:** ❌ FAILURE (400 Bad Request)

```json
{
  "donorId": "02986c41-a839-4196-8a43-d6bf253a2bc5",
  "monetaryAmount": 500,
  "paymentMethod": "GCash",
  "paymentReference": "123"
}
```

**Validation Rule:** Reference must be >= 5 characters
**Error Message:** "Reference too short"

---

#### Test 1.2: GCash Valid Reference
**Expected:** ✅ SUCCESS (200 OK)

```json
{
  "donorId": "02986c41-a839-4196-8a43-d6bf253a2bc5",
  "monetaryAmount": 500,
  "paymentMethod": "GCash",
  "paymentReference": "GCH-12345"
}
```

**Response:** Donation created with `paymentStatus: VERIFIED`

---

#### Test 1.3 & 1.4: Bank Transfer
Same rules as GCash - minimum 5 character reference required.

---

### GROUP 2: Stripe PaymentIntent Verification

Tests for Stripe card payments through PaymentIntent API.

#### Test 2.1: Invalid PaymentIntent ID
**Expected:** ❌ FAILURE (400 Bad Request)

```json
{
  "donorId": "02986c41-a839-4196-8a43-d6bf253a2bc5",
  "monetaryAmount": 1000,
  "paymentMethod": "Stripe",
  "paymentReference": "pi_invalid123456"
}
```

**Verification Step:** PayPalGatewayService queries Stripe API
**Error Message:** "PaymentIntent not found or unauthorized"
**HTTP Response:** 404 from Stripe API

---

#### Test 2.2: Amount Mismatch
**Expected:** ❌ FAILURE (400 Bad Request)

**Setup:**
1. Create PaymentIntent for ₱1,000 via Stripe API
2. Request donation for ₱5,000 with that PaymentIntent

```json
{
  "donorId": "02986c41-a839-4196-8a43-d6bf253a2bc5",
  "monetaryAmount": 5000,
  "paymentMethod": "Stripe",
  "paymentReference": "pi_abc123def456"
}
```

**Verification Logic:**
```typescript
const amountOk = intent.amount_received >= Math.round(amount * 100);
// 100000 cents (₱1000) < 500000 cents (₱5000) = FAIL
```

**Error Message:** "Payment not succeeded or amount mismatch"

---

#### Test 2.3: Empty PaymentIntent ID
**Expected:** ❌ FAILURE (400 Bad Request)

```json
{
  "donorId": "02986c41-a839-4196-8a43-d6bf253a2bc5",
  "monetaryAmount": 1000,
  "paymentMethod": "Stripe",
  "paymentReference": ""
}
```

---

### GROUP 3: PayPal Order Verification

Tests for PayPal orders through Orders API v2.

#### Test 3.1: Invalid Order ID
**Expected:** ❌ FAILURE (400 Bad Request)

```json
{
  "donorId": "02986c41-a839-4196-8a43-d6bf253a2bc5",
  "monetaryAmount": 1000,
  "paymentMethod": "PayPal",
  "paymentReference": "invalid_order_123"
}
```

**Verification Step:** PaymentGatewayService queries PayPal API
**Error Message:** "Order not found or unauthorized"
**HTTP Response:** 404 from PayPal API

---

#### Test 3.2: Amount Mismatch
**Expected:** ❌ FAILURE (400 Bad Request)

**Setup:**
1. Create PayPal Order for ₱2,000
2. Approve order in PayPal Sandbox
3. Request donation for ₱5,000 with that Order

```json
{
  "donorId": "02986c41-a839-4196-8a43-d6bf253a2bc5",
  "monetaryAmount": 5000,
  "paymentMethod": "PayPal",
  "paymentReference": "3C679954H0908715U"
}
```

**Verification Logic:**
```typescript
const orderAmount = parseFloat(order.purchase_units[0].amount.value);
const amountOk = orderAmount >= amount;
// 2000 >= 5000 = FAIL
```

**Error Message:** "Payment not completed or amount mismatch"

---

#### Test 3.3: Non-Completed Order
**Expected:** ❌ FAILURE (400 Bad Request)

Order that hasn't been approved/captured yet (status != COMPLETED)

**Error Message:** "Payment not completed or amount mismatch"

---

### GROUP 4: Unsupported Methods

#### Test 4.1: Unknown Payment Method
**Expected:** ❌ FAILURE (400 Bad Request)

```json
{
  "donorId": "02986c41-a839-4196-8a43-d6bf253a2bc5",
  "monetaryAmount": 1000,
  "paymentMethod": "BitCoin",
  "paymentReference": "BC123ABC456"
}
```

**Error Message:** "Unsupported payment method: BitCoin"

---

### GROUP 5: Input Validation

#### Test 5.1: Negative Amount
**Expected:** ❌ FAILURE (400 Bad Request)

```json
{
  "donorId": "02986c41-a839-4196-8a43-d6bf253a2bc5",
  "monetaryAmount": -500,
  "paymentMethod": "GCash",
  "paymentReference": "GCH-12345"
}
```

**Validation:** Zod schema requires `monetaryAmount > 0`

---

#### Test 5.2: Zero Amount
**Expected:** ❌ FAILURE (400 Bad Request)

```json
{
  "donorId": "02986c41-a839-4196-8a43-d6bf253a2bc5",
  "monetaryAmount": 0,
  "paymentMethod": "GCash",
  "paymentReference": "GCH-12345"
}
```

---

#### Test 5.3: Missing Donor ID
**Expected:** ❌ FAILURE (400 Bad Request)

```json
{
  "donorId": "",
  "monetaryAmount": 500,
  "paymentMethod": "GCash",
  "paymentReference": "GCH-12345"
}
```

**Validation:** Zod schema requires non-empty UUID

---

#### Test 5.4: Missing Payment Reference
**Expected:** ❌ FAILURE (400 Bad Request)

```json
{
  "donorId": "02986c41-a839-4196-8a43-d6bf253a2bc5",
  "monetaryAmount": 500,
  "paymentMethod": "GCash",
  "paymentReference": ""
}
```

---

## Email Notifications

### Failure Notification Email

When a payment verification fails, the `sendPaymentFailureNotification()` method sends:

**Subject:** `❌ Payment Unsuccessful - Action Required`

**Template:** [backend/src/services/email.service.ts#L248-L278](backend/src/services/email.service.ts#L248-L278)

**Content:**
- Donor name greeting
- Failed amount
- Failure reason (from PaymentGatewayService)
- Retry button link
- Support contact information

**Email Flow:**
```
Test triggers failure
    ↓
PaymentGatewayService returns {success: false, failureReason: "..."}
    ↓
donation.service.ts catches failure
    ↓
emailService.sendPaymentFailureNotification() called
    ↓
Email sent to donor with specific failure reason
```

---

## Running the Automated Tests

### Prerequisites

1. **Backend Server Running**
   ```bash
   cd backend
   npm run dev
   # Server will start on http://localhost:5000
   ```

2. **Valid Donor in Database**
   ```bash
   # Update TEST_DONOR_ID in test-payment-failures.mjs
   TEST_DONOR_ID = '02986c41-a839-4196-8a43-d6bf253a2bc5'
   ```

3. **Environment Variables Set** (.env file)
   ```
   STRIPE_SECRET_KEY=sk_test_...
   PAYPAL_CLIENT_ID=...
   PAYPAL_CLIENT_SECRET=...
   PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
   ```

### Execution Steps

```bash
# 1. Make script executable
chmod +x backend/tests/donations/test-payment-failures.mjs

# 2. Run the test suite
node backend/tests/donations/test-payment-failures.mjs

# 3. View output
# ✅ Test results appear in console
# ✅ Summary at the end with pass/fail counts
```

### Example Output

```
╔════════════════════════════════════════════════════════════╗
║        PAYMENT FAILURE PATH VERIFICATION TESTS            ║
╚════════════════════════════════════════════════════════════╝

📌 TEST GROUP 1: Reference Validation

📋 Test 1.1: GCash - Reference Too Short
   Payment Method: GCash
   Amount: ₱500
   Reference: 123
   ✅ PASS - Payment rejected as expected
   Status: 400
   Reason: Reference too short

📋 Test 1.2: GCash - Valid Reference
   Payment Method: GCash
   Amount: ₱500
   Reference: GCH-12345
   ✅ PASS - Payment accepted as expected
   Status: 200
   Donation ID: a1b2c3d4-e5f6-7890

...

╔════════════════════════════════════════════════════════════╗
║                     TEST SUMMARY                           ║
╚════════════════════════════════════════════════════════════╝

✅ Passed: 15
❌ Failed: 0
📊 Total:  15
📈 Success Rate: 100%
```

---

## Troubleshooting

### Issue: "Can't reach database server"
**Solution:** Ensure Prisma is connected to the correct database
```bash
# Check connection string
cat .env | grep DATABASE_URL

# Test connection
npx prisma db execute --stdin < /dev/null
```

### Issue: Stripe PaymentIntent not found
**Solution:** 
1. Verify STRIPE_SECRET_KEY is correct in .env
2. Ensure PaymentIntent was created before testing
3. Check PaymentIntent status via Stripe Dashboard

### Issue: PayPal authentication fails
**Solution:**
1. Verify PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env
2. Ensure using sandbox credentials (not production)
3. Check PAYPAL_API_BASE points to sandbox: `https://api-m.sandbox.paypal.com`

### Issue: Email not sent on failure
**Solution:**
1. Check EMAIL_USER and EMAIL_PASS in .env
2. Verify Gmail SMTP is enabled
3. Check backend logs for email errors: `tail -f logs/backend.log`

---

## Manual Testing with REST Client

### Quick Start

1. **Install VS Code Extension**
   - Open VS Code Extensions (Ctrl+Shift+X)
   - Search "rest-client"
   - Install by humao

2. **Open test file**
   ```
   backend/tests/donations/test-payment-failures.http
   ```

3. **Update test donor ID** (optional)
   ```
   @donorId = 02986c41-a839-4196-8a43-d6bf253a2bc5
   ```

4. **Click "Send Request"** above any test
   - Response appears in right panel
   - View status code and response body

---

## Test Coverage Summary

| Category | Test Cases | Status |
|----------|-----------|--------|
| Reference Validation | 4 | ✅ Complete |
| Stripe Verification | 3 | ✅ Complete |
| PayPal Verification | 3 | ✅ Complete |
| Input Validation | 4 | ✅ Complete |
| Email Notifications | 1 | ✅ Complete |
| **Total** | **15** | **✅ Complete** |

---

## Related Files

- **Payment Gateway Service:** [backend/src/services/paymentGateway.service.ts](backend/src/services/paymentGateway.service.ts)
- **Donation Service:** [backend/src/services/donation.service.ts](backend/src/services/donation.service.ts)
- **Email Service:** [backend/src/services/email.service.ts](backend/src/services/email.service.ts#L248)
- **Validators:** [backend/src/utils/validators.ts](backend/src/utils/validators.ts)
- **Database Schema:** [backend/prisma/schema.prisma](backend/prisma/schema.prisma)

---

## Next Steps

After completing failure path testing:

1. ✅ **Commit Changes** to Git repository
2. ✅ **Add to Postman Collection** (optional)
3. ✅ **Deploy to Production** with live API keys
4. ✅ **Monitor Logs** for payment errors

---

*Last Updated: December 14, 2025*
*Test Suite Version: 1.0*
