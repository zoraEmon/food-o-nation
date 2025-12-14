/**
 * Program Application Service Tests
 * Tests for QR code generation, application lifecycle, and scanning
 * 
 * Run with: npm test -- test-program-applications.mjs
 */

import axios from 'axios';
import assert from 'assert';
import chalk from 'chalk';

const API_BASE = 'http://localhost:5000/api';

// =========================================================
// TEST DATA
// =========================================================

let testProgramId = '';
let testBeneficiaryId = '';
let testRegistrationId = '';
let testApplicationId = '';
let testAdminId = '';
let testQRCodeValue = '';

// =========================================================
// HELPER FUNCTIONS
// =========================================================

function log(message, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = `[${timestamp}]`;

  switch (type) {
    case 'success':
      console.log(chalk.green(`${prefix} ✅ ${message}`));
      break;
    case 'error':
      console.log(chalk.red(`${prefix} ❌ ${message}`));
      break;
    case 'warn':
      console.log(chalk.yellow(`${prefix} ⚠️  ${message}`));
      break;
    case 'info':
    default:
      console.log(chalk.blue(`${prefix} ℹ️  ${message}`));
      break;
  }
}

function logSection(title) {
  console.log('\n' + chalk.bold.cyan(`\n📋 ${title}\n`));
}

async function testRequest(method, url, data = null, expectedStatus = 200) {
  try {
    const config = { validateStatus: () => true };
    let response;

    if (method === 'GET') {
      response = await axios.get(url, config);
    } else if (method === 'POST') {
      response = await axios.post(url, data, config);
    } else if (method === 'PUT') {
      response = await axios.put(url, data, config);
    }

    if (response.status === expectedStatus) {
      log(`${method} ${url} - Status: ${response.status}`, 'success');
      return response.data;
    } else {
      log(
        `${method} ${url} - Expected ${expectedStatus}, got ${response.status}`,
        'error'
      );
      console.error('Response:', response.data);
      throw new Error(`Unexpected status: ${response.status}`);
    }
  } catch (error) {
    log(`Request failed: ${error.message}`, 'error');
    throw error;
  }
}

// =========================================================
// SETUP TESTS - Create test data
// =========================================================

async function setupTestData() {
  logSection('SETUP: Creating Test Data');

  try {
    // Get or create admin
    log('Fetching/creating admin user...');
    // For now, we'll use a hardcoded admin ID - adjust based on your test setup
    testAdminId = '550e8400-e29b-41d4-a716-446655440000'; // Replace with actual admin ID from your DB
    log('Using admin ID: ' + testAdminId);

    // Get existing programs
    log('Fetching programs...');
    const programsResponse = await testRequest('GET', `${API_BASE}/programs`);
    assert(programsResponse.data && programsResponse.data.length > 0, 'No programs found');
    testProgramId = programsResponse.data[0].id;
    log(`Using program: ${testProgramId}`);

    // For testing, we'll assume a beneficiary exists - in real scenario, you'd create one
    // You should replace this with an actual beneficiary ID from your database
    testBeneficiaryId = '550e8400-e29b-41d4-a716-446655440001'; // Replace with actual beneficiary ID
    log(`Using beneficiary: ${testBeneficiaryId}`);

    log('Setup complete!', 'success');
  } catch (error) {
    log(`Setup failed: ${error.message}`, 'error');
    throw error;
  }
}

// =========================================================
// TEST SUITE 1: Program Application Registration
// =========================================================

async function testProgramRegistration() {
  logSection('TEST 1: Program Application Registration');

  try {
    // Register beneficiary for program
    log('Registering beneficiary for program...');
    const registrationData = {
      programId: testProgramId,
      beneficiaryId: testBeneficiaryId,
    };

    const response = await testRequest(
      'POST',
      `${API_BASE}/programs/register`,
      registrationData,
      201
    );

    assert(response.success, 'Registration failed');
    assert(response.data.registration.id, 'No registration ID returned');
    assert(response.data.application.id, 'No application ID returned');

    testRegistrationId = response.data.registration.id;
    testApplicationId = response.data.application.id;
    testQRCodeValue = response.data.application.qrCodeValue;

    log(`Registration created: ${testRegistrationId}`, 'success');
    log(`Application created: ${testApplicationId}`, 'success');
    log(`QR Code Value: ${testQRCodeValue}`, 'success');
  } catch (error) {
    log(`Registration test failed: ${error.message}`, 'error');
    throw error;
  }
}

// =========================================================
// TEST SUITE 2: Fetch Application Details
// =========================================================

async function testGetApplication() {
  logSection('TEST 2: Get Application Details');

  try {
    log('Fetching application by ID...');
    const response = await testRequest(
      'GET',
      `${API_BASE}/programs/application/${testApplicationId}`
    );

    assert(response.success, 'Failed to fetch application');
    const app = response.data;

    assert.strictEqual(
      app.id,
      testApplicationId,
      'Application ID mismatch'
    );
    assert.strictEqual(
      app.applicationStatus,
      'PENDING',
      'Expected status PENDING'
    );
    assert(app.qrCodeImageUrl, 'No QR code image URL');
    assert(app.scheduledDeliveryDate, 'No scheduled delivery date');

    log('Application details verified', 'success');
    log(`Status: ${app.applicationStatus}`, 'info');
    log(`Scheduled Date: ${app.scheduledDeliveryDate}`, 'info');
    log(`QR Code Generated: ${app.qrCodeImageUrl.substring(0, 50)}...`, 'info');
  } catch (error) {
    log(`Get application test failed: ${error.message}`, 'error');
    throw error;
  }
}

// =========================================================
// TEST SUITE 3: Get Beneficiary Applications
// =========================================================

async function testGetBeneficiaryApplications() {
  logSection('TEST 3: Get Beneficiary Applications');

  try {
    log('Fetching all applications for beneficiary...');
    const response = await testRequest(
      'GET',
      `${API_BASE}/programs/beneficiary/${testBeneficiaryId}/applications`
    );

    assert(response.success, 'Failed to fetch beneficiary applications');
    assert(Array.isArray(response.data), 'Expected array of applications');
    assert(response.data.length > 0, 'No applications found');

    const app = response.data.find((a) => a.id === testApplicationId);
    assert(app, 'Created application not found in beneficiary list');

    log(`Found ${response.data.length} applications for beneficiary`, 'success');
  } catch (error) {
    log(
      `Get beneficiary applications test failed: ${error.message}`,
      'error'
    );
    throw error;
  }
}

// =========================================================
// TEST SUITE 4: Scan QR Code (Admin)
// =========================================================

async function testScanQRCode() {
  logSection('TEST 4: Scan QR Code (Admin)');

  try {
    log('Scanning QR code...');
    const scanData = {
      qrCodeValue: testQRCodeValue,
      adminId: testAdminId,
      notes: 'Verified and distributed on delivery day',
    };

    const response = await testRequest(
      'POST',
      `${API_BASE}/programs/scan-qr`,
      scanData
    );

    assert(response.success, 'QR scan failed');
    const app = response.data.application;

    assert.strictEqual(
      app.applicationStatus,
      'COMPLETED',
      'Expected status COMPLETED after scan'
    );
    assert(app.qrCodeScannedAt, 'Scan timestamp not recorded');
    assert.strictEqual(
      app.qrCodeScannedByAdminId,
      testAdminId,
      'Admin ID not recorded'
    );

    log('QR code scanned successfully', 'success');
    log(`Application status updated to: ${app.applicationStatus}`, 'success');
    log(`Scanned at: ${app.qrCodeScannedAt}`, 'info');
    log(`Scanned by admin: ${app.qrCodeScannedByAdminId}`, 'info');
  } catch (error) {
    log(`Scan QR code test failed: ${error.message}`, 'error');
    throw error;
  }
}

// =========================================================
// TEST SUITE 5: Get Program Applications (Admin)
// =========================================================

async function testGetProgramApplications() {
  logSection('TEST 5: Get Program Applications (Admin)');

  try {
    log('Fetching all applications for program...');
    const response = await testRequest(
      'GET',
      `${API_BASE}/programs/${testProgramId}/applications`
    );

    assert(response.success, 'Failed to fetch program applications');
    assert(Array.isArray(response.data), 'Expected array of applications');

    const testApp = response.data.find((a) => a.id === testApplicationId);
    assert(testApp, 'Created application not found in program list');

    log(`Found ${response.data.length} applications for program`, 'success');
    log(`Test application found in list`, 'success');
  } catch (error) {
    log(
      `Get program applications test failed: ${error.message}`,
      'error'
    );
    throw error;
  }
}

// =========================================================
// TEST SUITE 6: Get Application Statistics
// =========================================================

async function testGetApplicationStats() {
  logSection('TEST 6: Get Application Statistics');

  try {
    log('Fetching application statistics...');
    const response = await testRequest(
      'GET',
      `${API_BASE}/programs/${testProgramId}/applications/stats`
    );

    assert(response.success, 'Failed to fetch statistics');
    const stats = response.data;

    assert(stats.total >= 1, 'Total should be at least 1');
    assert(typeof stats.completed === 'number', 'Completed should be a number');
    assert(typeof stats.pending === 'number', 'Pending should be a number');
    assert(typeof stats.cancelled === 'number', 'Cancelled should be a number');

    log('Application statistics retrieved', 'success');
    log(`Total Applications: ${stats.total}`, 'info');
    log(`Completed: ${stats.completed}`, 'info');
    log(`Pending: ${stats.pending}`, 'info');
    log(`Cancelled: ${stats.cancelled}`, 'info');
    log(`Scan Rate: ${stats.scanRate}`, 'info');
  } catch (error) {
    log(`Get application stats test failed: ${error.message}`, 'error');
    throw error;
  }
}

// =========================================================
// ERROR HANDLING TEST
// =========================================================

async function testInvalidQRCode() {
  logSection('TEST 7: Error Handling - Invalid QR Code');

  try {
    log('Attempting to scan invalid QR code...');
    const scanData = {
      qrCodeValue: 'INVALID-QR-CODE-VALUE',
      adminId: testAdminId,
    };

    const response = await testRequest(
      'POST',
      `${API_BASE}/programs/scan-qr`,
      scanData,
      400
    );

    assert(!response.success, 'Should fail with invalid QR code');
    assert(response.error, 'Error message should be present');

    log('Invalid QR code properly rejected', 'success');
    log(`Error message: ${response.error}`, 'info');
  } catch (error) {
    log(`Invalid QR code test failed: ${error.message}`, 'error');
    throw error;
  }
}

// =========================================================
// MAIN TEST RUNNER
// =========================================================

async function runAllTests() {
  console.clear();
  console.log(
    chalk.bold.yellow('🚀 PROGRAM APPLICATION TESTING SUITE\n')
  );

  let passCount = 0;
  let failCount = 0;

  const tests = [
    { name: 'Setup', fn: setupTestData },
    { name: 'Registration', fn: testProgramRegistration },
    { name: 'Get Application', fn: testGetApplication },
    { name: 'Beneficiary Applications', fn: testGetBeneficiaryApplications },
    { name: 'QR Code Scan', fn: testScanQRCode },
    { name: 'Program Applications', fn: testGetProgramApplications },
    { name: 'Application Stats', fn: testGetApplicationStats },
    { name: 'Error Handling', fn: testInvalidQRCode },
  ];

  for (const test of tests) {
    try {
      await test.fn();
      passCount++;
    } catch (error) {
      failCount++;
      log(`Test "${test.name}" failed`, 'error');
    }
  }

  // Summary
  logSection('TEST SUMMARY');
  console.log(chalk.bold.green(`✅ Passed: ${passCount}`));
  console.log(chalk.bold.red(`❌ Failed: ${failCount}`));
  console.log(
    chalk.bold.cyan(`📊 Total: ${passCount + failCount}\n`)
  );

  if (failCount > 0) {
    process.exit(1);
  }
}

// Run tests
runAllTests().catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
