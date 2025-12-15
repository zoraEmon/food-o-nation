#!/usr/bin/env node
import { pathToFileURL } from 'url';
/**
 * Donation API Test Script
 * 
 * This script tests all donation endpoints without requiring a frontend.
 * 
 * Usage:
 *   1. Start your backend server: npm run dev
 *   2. Update the test data below (donorId, donationCenterId)
 *   3. Run this script: node test-donations.js
 * 
 * Requirements:
 *   - Backend server must be running
 *   - You need valid donor and donation center IDs from your database
 */

const BASE_URL = 'http://localhost:5000/api';

// ===== CONFIGURE TEST DATA =====
// Updated with seeded test data (run: npx prisma db seed)
const TEST_DATA = {
  donorId: process.env.TEST_USE_MEMORY === 'true' ? '00000000-0000-0000-0000-000000000001' : '36400fa7-22f7-4e94-b514-a441e516b9b5',
  donationCenterId: process.env.TEST_USE_MEMORY === 'true' ? '00000000-0000-0000-0000-000000000002' : process.env.DONATION_CENTER_ID || '422553fa-645c-47ff-96ad-b16c4218ffeb',
};

// ===== UTILITY FUNCTIONS =====

async function makeRequest(method, endpoint, body = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    console.log(`\n🔄 ${method} ${endpoint}`);
    if (body) {
      console.log('📤 Request Body:', JSON.stringify(body, null, 2));
    }

    const response = await fetch(url, options);
    const data = await response.json();

    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log('📥 Response:', JSON.stringify(data, null, 2));

    return { response, data };
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return { response: null, data: null, error };
  }
}

// ===== TEST CASES =====

async function testCreateMonetaryDonation() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 1: Create Monetary Donation');
  console.log('='.repeat(60));

  const result = await makeRequest('POST', '/donations/monetary', {
    donorId: TEST_DATA.donorId,
    amount: 1000,
    paymentMethod: 'Maya',
    paymentReference: `MAYA-${Date.now()}`,
  });

  if (result.data?.success) {
    console.log('✅ Monetary donation created successfully!');
    return result.data.data.donation.id;
  } else {
    console.log('❌ Failed to create monetary donation');
    return null;
  }
}

async function testCreateProduceDonation() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: Create Produce Donation');
  console.log('='.repeat(60));

  // Set scheduled date to 7 days from now
  const scheduledDate = new Date();
  scheduledDate.setDate(scheduledDate.getDate() + 7);

  const result = await makeRequest('POST', '/donations/produce', {
    donorId: TEST_DATA.donorId,
    donationCenterId: TEST_DATA.donationCenterId,
    scheduledDate: scheduledDate.toISOString(),
    items: [
      {
        name: 'White Rice',
        category: 'Grains',
        quantity: 50,
        unit: 'kg',
      },
      {
        name: 'Canned Sardines',
        category: 'Canned Goods',
        quantity: 100,
        unit: 'cans',
      },
      {
        name: 'Instant Noodles',
        category: 'Processed Foods',
        quantity: 200,
        unit: 'packs',
      },
    ],
  });

  if (result.data?.success) {
    console.log('✅ Produce donation created successfully!');
    console.log('📱 QR Code generated:', result.data.data.donation.qrCodeRef ? 'Yes' : 'No');
    return {
      id: result.data.data.donation.id,
      scheduledDate: result.data.data.donation.scheduledDate,
    };
  } else {
    console.log('❌ Failed to create produce donation');
    return null;
  }
}

async function testScanDonationQr(produceDonation) {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 3: Scan Donation QR');
  console.log('='.repeat(60));

  const qrPayload = {
    donationId: produceDonation.id,
    donorId: TEST_DATA.donorId,
    scheduledDate: produceDonation.scheduledDate,
    type: 'PRODUCE_DONATION',
  };

  const result = await makeRequest('POST', '/donations/scan-qr', {
    qrData: JSON.stringify(qrPayload),
  });

  if (result.data?.success) {
    console.log('✅ Donation QR scanned and marked completed');
    return true;
  } else {
    console.log('❌ Failed to scan donation QR');
    return false;
  }
}

async function testGetDonationById(donationId) {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 4: Get Donation by ID');
  console.log('='.repeat(60));

  const result = await makeRequest('GET', `/donations/${donationId}`);

  if (result.data?.success) {
    console.log('✅ Successfully retrieved donation');
    return true;
  } else {
    console.log('❌ Failed to retrieve donation');
    return false;
  }
}

async function testGetAllDonations() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 5: Get All Donations with Pagination');
  console.log('='.repeat(60));

  const result = await makeRequest('GET', '/donations?limit=5&offset=0');

  if (result.data?.success) {
    console.log(`✅ Retrieved ${result.data.data.donations.length} donations`);
    console.log(`📊 Total: ${result.data.data.pagination.total}`);
    return true;
  } else {
    console.log('❌ Failed to retrieve donations');
    return false;
  }
}

async function testGetDonationsByDonor() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 6: Get Donations by Donor');
  console.log('='.repeat(60));

  const result = await makeRequest('GET', `/donations?donorId=${TEST_DATA.donorId}&limit=10`);

  if (result.data?.success) {
    console.log(`✅ Retrieved ${result.data.data.donations.length} donations for donor`);
    return true;
  } else {
    console.log('❌ Failed to retrieve donations by donor');
    return false;
  }
}

async function testGetDonationsByStatus() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 7: Get Donations by Status');
  console.log('='.repeat(60));

  const result = await makeRequest('GET', '/donations?status=SCHEDULED&limit=10');

  if (result.data?.success) {
    console.log(`✅ Retrieved ${result.data.data.donations.length} scheduled donations`);
    return true;
  } else {
    console.log('❌ Failed to retrieve donations by status');
    return false;
  }
}

async function testUpdateDonationStatus(donationId) {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 8: Update Donation Status (Admin)');
  console.log('='.repeat(60));

  const result = await makeRequest('PATCH', `/donations/${donationId}/status`, {
    status: 'COMPLETED',
    notes: 'Donation received and verified - Test completion',
  });

  if (result.data?.success) {
    console.log('✅ Successfully updated donation status');
    return true;
  } else {
    console.log('❌ Failed to update donation status');
    return false;
  }
}

async function testValidationErrors() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 9: Validation Error Handling');
  console.log('='.repeat(60));

  console.log('\n--- Test 8a: Invalid Amount ---');
  await makeRequest('POST', '/donations/monetary', {
    donorId: TEST_DATA.donorId,
    amount: -100, // Negative amount
    paymentMethod: 'Maya',
    paymentReference: 'TEST-REF',
  });

  console.log('\n--- Test 8b: Invalid UUID ---');
  await makeRequest('POST', '/donations/monetary', {
    donorId: 'invalid-uuid-format',
    amount: 100,
    paymentMethod: 'Maya',
    paymentReference: 'TEST-REF',
  });

  console.log('\n--- Test 8c: Invalid Payment Method ---');
  await makeRequest('POST', '/donations/monetary', {
    donorId: TEST_DATA.donorId,
    amount: 100,
    paymentMethod: 'BitcoinATM', // Not in allowed enum
    paymentReference: 'TEST-REF',
  });

  console.log('\n--- Test 8d: Past Scheduled Date ---');
  await makeRequest('POST', '/donations/produce', {
    donorId: TEST_DATA.donorId,
    donationCenterId: TEST_DATA.donationCenterId,
    scheduledDate: '2020-01-01T00:00:00.000Z', // Past date
    items: [{ name: 'Rice', category: 'Grains', quantity: 10, unit: 'kg' }],
  });

  console.log('\n--- Test 8e: Empty Items Array ---');
  await makeRequest('POST', '/donations/produce', {
    donorId: TEST_DATA.donorId,
    donationCenterId: TEST_DATA.donationCenterId,
    scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    items: [], // Empty array
  });

  console.log('✅ All validation tests completed');
}

// ===== MAIN TEST RUNNER =====

async function runAllTests() {
  console.log('\n' + '🧪'.repeat(30));
  console.log('FOOD-O-NATION DONATION API TEST SUITE');
  console.log('🧪'.repeat(30));

  // Check if test data is configured
  if (TEST_DATA.donorId === 'YOUR_DONOR_ID_HERE' || TEST_DATA.donationCenterId === 'YOUR_DONATION_CENTER_ID_HERE') {
    console.log('\n❌ ERROR: Please update TEST_DATA with actual IDs from your database');
    console.log('\nTo get test data:');
    console.log('  1. Start your backend: npm run dev');
    console.log('  2. Query your database for a donor ID and donation center ID');
    console.log('  3. Update TEST_DATA at the top of this file');
    console.log('  4. Run this script again: node test-donations.js\n');
    return;
  }

  let monetaryDonationId = null;
  let produceDonation = null;

  try {
    // Test creating donations
    monetaryDonationId = await testCreateMonetaryDonation();
    produceDonation = await testCreateProduceDonation();

    // Test retrieval operations
    if (produceDonation) {
      await testScanDonationQr(produceDonation);
      await testGetDonationById(produceDonation.id);
    }
    await testGetAllDonations();
    await testGetDonationsByDonor();
    await testGetDonationsByStatus();

    // Test update operations
    if (produceDonation) {
      await testUpdateDonationStatus(produceDonation.id);
    }

    // Test validation
    await testValidationErrors();

    console.log('\n' + '✅'.repeat(30));
    console.log('ALL TESTS COMPLETED!');
    console.log('✅'.repeat(30));
    console.log('\nCreated Donations:');
    if (monetaryDonationId) console.log(`  - Monetary: ${monetaryDonationId}`);
    if (produceDonation?.id) console.log(`  - Produce: ${produceDonation.id}`);
    console.log('\n');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
  }
}

// Run tests if this script is executed directly (Windows-friendly check)
const isDirectRun = (() => {
  const arg = process.argv[1];
  if (!arg) return false;
  return import.meta.url === pathToFileURL(arg).href;
})();

if (isDirectRun) {
  runAllTests();
}

export { runAllTests, TEST_DATA };
