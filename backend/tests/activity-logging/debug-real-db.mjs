#!/usr/bin/env node

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';
// Use REAL donor ID from the actual database
const REAL_DONOR_ID = '36400fa7-22f7-4e94-b514-a441e516b9b5';

async function testMonetaryDonation() {
  console.log('\n🔍 Testing Monetary Donation with REAL database...\n');
  
  const payload = {
    donorId: REAL_DONOR_ID,
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
    
    if (res.status === 201) {
      console.log('\n✅ SUCCESS! Donation created with activity logging!');
    } else {
      console.log('\n❌ FAILED! See errors above.');
    }
    
  } catch (error) {
    console.error('❌ Connection Error:', error.message);
  }
}

testMonetaryDonation();
