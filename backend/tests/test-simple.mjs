#!/usr/bin/env node

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function test() {
  try {
    console.log('Testing monetary donation endpoint...');
    const res = await fetch(`${BASE_URL}/donations/monetary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        donorId: '00000000-0000-0000-0000-000000000001',
        amount: 500,
        paymentMethod: 'Maya',
        paymentReference: `TEST-${Date.now()}`,
      }),
    });
    
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (res.status === 201) {
      console.log('\n✅ TEST PASSED');
    } else {
      console.log('\n❌ TEST FAILED');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
