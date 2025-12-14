#!/usr/bin/env node
/**
 * Payment Failure Path Tests
 * 
 * Tests payment verification error scenarios:
 * - Invalid/short GCash references
 * - PayPal amount mismatches
 * - Stripe amount mismatches
 * - Invalid payment IDs
 * - Missing payment credentials
 * 
 * Usage:
 *   1. Start backend: npm run dev
 *   2. Configure test donor ID below
 *   3. Run: node test-payment-failures.mjs
 * 
 * Requirements:
 *   - Backend running on http://localhost:5000
 *   - Valid Stripe test account (sk_test_...)
 *   - Valid PayPal sandbox account
 *   - Valid donor ID in database
 */

const BASE_URL = 'http://localhost:5000/api';

// Test donor ID - update with valid ID from your database
const TEST_DONOR_ID = process.env.TEST_DONOR_ID || '02986c41-a839-4196-8a43-d6bf253a2bc5';

// Stripe test credentials (from .env - REQUIRED)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error('ERROR: STRIPE_SECRET_KEY not set in environment variables (.env file)');
  console.error('Set STRIPE_SECRET_KEY in .env before running tests');
  process.exit(1);
}

// PayPal test credentials (from .env - REQUIRED)
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  console.error('ERROR: PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET not set in environment variables (.env file)');
  console.error('Set both PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env before running tests');
  process.exit(1);
}

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// ===== UTILITY FUNCTIONS =====

async function makeRequest(method, endpoint, body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { error: 'Failed to parse response' };
    }

    return {
      status: response.status,
      data,
      ok: response.ok,
    };
  } catch (error) {
    throw new Error(`Connection failed: ${error.message}`);
  }
}

async function testPaymentFailure(testName, paymentMethod, amount, paymentReference, expectedFailure = true) {
  console.log(`\n📋 ${testName}`);
  console.log(`   Payment Method: ${paymentMethod}`);
  console.log(`   Amount: ₱${amount}`);
  console.log(`   Reference: ${paymentReference}`);

  const body = {
    donorId: TEST_DONOR_ID,
    amount: amount,
    paymentMethod,
    paymentReference,
  };

  try {
    const response = await makeRequest('POST', '/donations/monetary', body);

    if (expectedFailure && !response.ok) {
      console.log(`   ✅ PASS - Payment rejected as expected`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Reason: ${response.data?.message || response.data?.error || 'Verification failed'}`);
      testResults.passed++;
      testResults.tests.push({
        name: testName,
        status: 'PASS',
        expectedFailure: true,
        actualStatus: response.status,
      });
    } else if (!expectedFailure && response.ok) {
      console.log(`   ✅ PASS - Payment accepted as expected`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Donation ID: ${response.data?.id}`);
      testResults.passed++;
      testResults.tests.push({
        name: testName,
        status: 'PASS',
        expectedFailure: false,
        actualStatus: response.status,
      });
    } else {
      console.log(`   ❌ FAIL - Unexpected response`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Expected: ${expectedFailure ? 'failure' : 'success'}`);
      console.log(`   Response: ${JSON.stringify(response.data)}`);
      testResults.failed++;
      testResults.tests.push({
        name: testName,
        status: 'FAIL',
        expectedFailure,
        actualStatus: response.status,
      });
    }
  } catch (error) {
    console.log(`   ❌ ERROR - ${error.message}`);
    testResults.failed++;
    testResults.tests.push({
      name: testName,
      status: 'ERROR',
      error: error.message,
    });
  }
}

async function createStripePaymentIntent(amount) {
  try {
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `amount=${amount}&currency=php&payment_method_types[]=card`,
    });

    const data = await response.json();
    if (data.id) {
      // Confirm the payment immediately
      const confirmRes = await fetch(`https://api.stripe.com/v1/payment_intents/${data.id}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'payment_method=pm_card_visa',
      });
      const confirmedData = await confirmRes.json();
      return confirmedData.id;
    }
  } catch (error) {
    console.error('Failed to create Stripe PaymentIntent:', error.message);
  }
  return null;
}

async function createPayPalOrder(amount) {
  try {
    // Get OAuth token
    const creds = `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`;
    const tokenRes = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(creds).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    // Create order
    const orderRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'PHP',
              value: String(amount / 100), // Convert cents to PHP
            },
          },
        ],
      }),
    });

    const orderData = await orderRes.json();
    return orderData.id;
  } catch (error) {
    console.error('Failed to create PayPal Order:', error.message);
  }
  return null;
}

// ===== TEST SUITE =====

async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║        PAYMENT FAILURE PATH VERIFICATION TESTS            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Test 1: Short GCash reference
  console.log('\n\n📌 TEST GROUP 1: Reference Validation');
  await testPaymentFailure(
    'Test 1.1: GCash - Reference Too Short',
    'GCash',
    500,
    '123', // < 5 characters
    true // expect failure
  );

  await testPaymentFailure(
    'Test 1.2: GCash - Valid Reference',
    'GCash',
    500,
    'GCH-12345', // >= 5 characters
    false // expect success
  );

  // Test 2: Stripe amount mismatch
  console.log('\n\n📌 TEST GROUP 2: Stripe Payment Intent Verification');
  
  console.log('\n   Creating Stripe PaymentIntent for ₱1,000...');
  const stripeIntentId = await createStripePaymentIntent(100000); // 1000 PHP in cents
  
  if (stripeIntentId) {
    await testPaymentFailure(
      'Test 2.1: Stripe - Amount Mismatch (expect ₱5,000, got ₱1,000)',
      'Stripe',
      5000, // Request for 5000
      stripeIntentId, // But PaymentIntent is for 1000
      true // expect failure
    );

    await testPaymentFailure(
      'Test 2.2: Stripe - Amount Match (expect ₱1,000, got ₱1,000)',
      'Stripe',
      1000, // Request for 1000
      stripeIntentId, // PaymentIntent is for 1000
      false // expect success
    );
  } else {
    console.log('   ⚠️  Skipped: Could not create Stripe PaymentIntent');
  }

  // Test 3: PayPal amount mismatch
  console.log('\n\n📌 TEST GROUP 3: PayPal Order Verification');
  
  console.log('\n   Creating PayPal Order for ₱2,000...');
  const paypalOrderId = await createPayPalOrder(200000); // 2000 PHP
  
  if (paypalOrderId) {
    console.log(`   Order ID: ${paypalOrderId}`);
    console.log('   ⚠️  NOTE: PayPal orders need approval. Please approve at:');
    console.log(`   https://www.sandbox.paypal.com/checkoutnow?token=${paypalOrderId}`);
    console.log('   After approval, continue testing...\n');

    // Give user time to approve
    await new Promise(resolve => setTimeout(resolve, 5000));

    await testPaymentFailure(
      'Test 3.1: PayPal - Amount Mismatch (expect ₱5,000, got ₱2,000)',
      'PayPal',
      5000, // Request for 5000
      paypalOrderId, // But Order is for 2000
      true // expect failure
    );

    await testPaymentFailure(
      'Test 3.2: PayPal - Amount Match (expect ₱2,000, got ₱2,000)',
      'PayPal',
      2000, // Request for 2000
      paypalOrderId, // Order is for 2000
      false // expect success
    );
  } else {
    console.log('   ⚠️  Skipped: Could not create PayPal Order');
  }

  // Test 4: Invalid payment IDs
  console.log('\n\n📌 TEST GROUP 4: Invalid Payment IDs');
  
  await testPaymentFailure(
    'Test 4.1: Stripe - Invalid PaymentIntent ID',
    'Stripe',
    1000,
    'pi_invalid12345',
    true // expect failure
  );

  await testPaymentFailure(
    'Test 4.2: PayPal - Invalid Order ID',
    'PayPal',
    1000,
    'invalid_order_id',
    true // expect failure
  );

  // Test 5: Unsupported payment method
  console.log('\n\n📌 TEST GROUP 5: Unsupported Methods');
  
  await testPaymentFailure(
    'Test 5.1: Unsupported Payment Method',
    'BitCoin',
    1000,
    'BC123ABC456',
    true // expect failure
  );

  // ===== PRINT SUMMARY =====
  console.log('\n\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                     TEST SUMMARY                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total:  ${testResults.passed + testResults.failed}`);
  console.log(`📈 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);

  console.log('\n📋 Detailed Results:');
  testResults.tests.forEach((test, idx) => {
    const icon = test.status === 'PASS' ? '✅' : '❌';
    console.log(`  ${idx + 1}. ${icon} ${test.name}`);
    if (test.error) {
      console.log(`     Error: ${test.error}`);
    }
  });

  console.log('\n');
}

// Run all tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
