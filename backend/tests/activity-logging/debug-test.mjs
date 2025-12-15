#!/usr/bin/env node

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';
const TEST_DONOR_ID = '00000000-0000-0000-0000-000000000001';

async function testMonetaryDonation() {
  console.log('\n🔍 Testing Monetary Donation Creation...\n');
  
  const payload = {
    donorId: TEST_DONOR_ID,
    amount: 500,
    paymentMethod: 'Maya',
    paymentReference: `TEST-${Date.now()}`,
  };
  
  console.log('📤 Sending payload:');
  console.log(JSON.stringify(payload, null, 2));
  console.log();
  
  try {
    const res = await fetch(`${BASE_URL}/donations/monetary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    console.log(`📥 Response status: ${res.status}`);
    
    const data = await res.json();
    console.log('📥 Response body:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

testMonetaryDonation();
