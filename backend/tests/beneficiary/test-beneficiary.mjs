#!/usr/bin/env node

/**
 * Beneficiary Application Testing Script
 * 
 * This script automates testing of the beneficiary registration and food security survey endpoints.
 * Run with: node test-beneficiary.mjs
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';
const ADMIN_TOKEN = ''; // Not needed for beneficiary registration

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
  data: (msg) => console.log(`${colors.yellow}📊 ${msg}${colors.reset}`),
};

// Test data
const beneficiaryTestData = {
  // User registration fields
  email: 'juan.delacruz.test@email.com',
  password: 'SecurePass123!',
  
  // Personal info
  firstName: 'Juan',
  lastName: 'Dela Cruz',
  middleName: 'Manuel',
  gender: 'MALE',
  birthDate: '1985-05-15T00:00:00Z',
  age: 39,
  civilStatus: 'MARRIED',
  contactNumber: '09171234567',
  occupation: 'Construction Worker',
  householdNumber: 6,
  householdAnnualSalary: 180000,

  householdPosition: 'FATHER',
  primaryPhone: '09171234567',
  activeEmail: 'juan.delacruz@email.com',
  governmentIdType: 'PhilID',

  childrenCount: 3,
  adultCount: 2,
  seniorCount: 1,
  pwdCount: 1,

  specialDietRequired: false,

  monthlyIncome: 15000,
  incomeSources: ['INFORMAL_GIG', 'REMITTANCE'],
  mainEmploymentStatus: 'EMPLOYED_PART_TIME',
  receivingAid: true,
  receivingAidDetail: 'Currently receiving 4Ps',

  declarationAccepted: true,
  privacyAccepted: true,

  address: {
    streetNumber: '123 Mabuhay Street',
    barangay: 'Barangay Libis',
    municipality: 'Quezon City',
    region: 'NCR',
    country: 'Philippines',
    zipCode: '1110',
  },

  householdMembers: [
    {
      fullName: 'Maria Dela Cruz',
      birthDate: '1988-03-20T00:00:00Z',
      age: 36,
      relationship: 'Wife',
    },
    {
      fullName: 'Ana Dela Cruz',
      "birthDate": '2007-07-10T00:00:00Z',
      age: 17,
      relationship: 'Daughter',
    },
  ],
};

const foodSecurityTestData = {
  q1: 'SOMETIMES',
  q2: 'OFTEN',
  q3: 'RARELY',
  q4: 'SOMETIMES',
  q5: 'NEVER',
  q6: 'SOMETIMES',
};

// Helper function for API requests
async function apiRequest(method, endpoint, body = null, needsAuth = false) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (needsAuth && ADMIN_TOKEN) {
    options.headers['Authorization'] = `Bearer ${ADMIN_TOKEN}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();

  return { status: response.status, data };
}

// Test: Create beneficiary (via auth registration)
async function testCreateBeneficiary() {
  log.test('Registering beneficiary application...');

  const { status, data } = await apiRequest('POST', '/auth/register/beneficiary', beneficiaryTestData);

  if (status === 201 && data.success) {
    log.success(`Beneficiary registered successfully!`);
    log.data(`User ID: ${data.data.user?.id}`);
    log.data(`Beneficiary ID: ${data.data.beneficiary?.id}`);
    log.data(`Name: ${data.data.beneficiary?.firstName} ${data.data.beneficiary?.lastName}`);
    log.data(`Email: ${data.data.user?.email}`);
    return data.data.beneficiary?.id;
  } else {
    log.error(`Failed to register beneficiary: ${status}`);
    console.log(JSON.stringify(data, null, 2));
    return null;
  }
}

// Test: Get all beneficiaries (requires admin auth)
async function testGetAllBeneficiaries() {
  log.test('Fetching all beneficiaries... (skipped - needs admin auth)');
  log.info('This endpoint requires admin authentication. Use REST Client tests with admin token.');
  return [];
}

// Test: Get beneficiary by ID (requires admin auth)
async function testGetBeneficiaryById(beneficiaryId) {
  log.test(`Fetching beneficiary: ${beneficiaryId}... (skipped - needs admin auth)`);
  log.info('This endpoint requires admin authentication. Use REST Client tests with admin token.');
  return null;
}

// Test: Update beneficiary (requires admin auth)
async function testUpdateBeneficiary(beneficiaryId) {
  log.test(`Updating beneficiary: ${beneficiaryId}... (skipped - needs admin auth)`);
  log.info('This endpoint requires admin authentication. Use REST Client tests with admin token.');
  return null;
}

// Test: Create food security survey (requires admin auth)
async function testCreateFoodSecuritySurvey(beneficiaryId) {
  log.test(`Creating food security survey... (skipped - needs admin auth)`);
  log.info('Food security surveys require admin authentication. Use REST Client tests.');
  return null;
}

// Test: Get food security surveys (requires admin auth)
async function testGetFoodSecuritySurveys(beneficiaryId) {
  log.test(`Fetching surveys... (skipped - needs admin auth)`);
  log.info('Food security surveys require admin authentication. Use REST Client tests.');
  return [];
}

// Test: Validation error - missing required field
async function testValidationError() {
  log.test('Testing validation error (missing required field)...');

  const invalidData = {
    firstName: 'Invalid',
    lastName: 'User',
    // Missing many required fields
  };

  const { status, data } = await apiRequest('POST', '/auth/register/beneficiary', invalidData);

  if (status === 400 || status === 422) {
    log.success(`Validation correctly rejected invalid data`);
    log.data(`Error: ${data.message || JSON.stringify(data.errors || 'Validation failed')}`);
    return true;
  } else {
    log.error(`Expected 400/422 error, got ${status}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║  BENEFICIARY APPLICATION TESTING SUITE             ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log('\n');

  let beneficiaryId = null;
  let surveyId = null;

  try {
    // 1. Create beneficiary
    log.info('TEST 1: Create Beneficiary Application');
    beneficiaryId = await testCreateBeneficiary();
    console.log('');

    if (!beneficiaryId) {
      log.error('Cannot continue without beneficiary ID. Aborting tests.');
      return;
    }

    // 2. Get all beneficiaries
    log.info('TEST 2: Get All Beneficiaries');
    await testGetAllBeneficiaries();
    console.log('');

    // 3. Get beneficiary by ID
    log.info('TEST 3: Get Beneficiary by ID');
    await testGetBeneficiaryById(beneficiaryId);
    console.log('');

    // 4. Update beneficiary
    log.info('TEST 4: Update Beneficiary');
    await testUpdateBeneficiary(beneficiaryId);
    console.log('');

    // 5. Create food security survey
    log.info('TEST 5: Create Food Security Survey');
    surveyId = await testCreateFoodSecuritySurvey(beneficiaryId);
    console.log('');

    // 6. Get food security surveys
    log.info('TEST 6: Get Food Security Surveys');
    await testGetFoodSecuritySurveys(beneficiaryId);
    console.log('');

    // 7. Test validation
    log.info('TEST 7: Test Validation Error Handling');
    await testValidationError();
    console.log('');

    // Summary
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║  TEST SUMMARY                                      ║');
    console.log('╠════════════════════════════════════════════════════╣');
    if (beneficiaryId) {
      console.log(`${colors.green}✅${colors.reset} Beneficiary created: ${beneficiaryId}`);
    }
    if (surveyId) {
      console.log(`${colors.green}✅${colors.reset} Food security survey created: ${surveyId}`);
    }
    console.log('╚════════════════════════════════════════════════════╝');
    console.log('\n');

  } catch (error) {
    log.error(`Test execution failed: ${error.message}`);
    console.error(error);
  }
}

// Run tests
runTests();
