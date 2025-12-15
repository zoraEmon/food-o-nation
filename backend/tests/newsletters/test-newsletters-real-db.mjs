// Simple real-DB smoke test for Newsletter API running on port 5000
// Requires server running: http://localhost:5000
// Set ADMIN_TOKEN and ADMIN_ID env vars or inline below for quick test

import fetch from 'node-fetch';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const ADMIN_ID = process.env.ADMIN_ID || '';

function log(title, obj) {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(obj, null, 2));
}

async function run() {
  try {
    // 1) Get latest newsletters
    let res = await fetch(`${BASE_URL}/api/newsletters/latest?limit=3`);
    let json = await res.json();
    log('Latest', json);

    // 2) Create newsletter (requires admin token)
    if (!ADMIN_TOKEN || !ADMIN_ID) {
      console.warn('Skipping create: ADMIN_TOKEN or ADMIN_ID not set');
    } else {
      const form = new URLSearchParams();
      form.set('headline', `Test Headline ${Date.now()}`);
      form.set('content', 'Test content from automated script.');
      form.set('adminId', ADMIN_ID);

      res = await fetch(`${BASE_URL}/api/newsletters`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form.toString(),
      });
      json = await res.json();
      log('Create', json);

      if (json?.success && json?.data?.id) {
        const id = json.data.id;

        // 3) Get by ID
        res = await fetch(`${BASE_URL}/api/newsletters/${id}`);
        json = await res.json();
        log('GetById', json);

        // 4) Update
        const updateForm = new URLSearchParams();
        updateForm.set('headline', 'Updated Test Headline');
        updateForm.set('content', 'Updated test content.');

        res = await fetch(`${BASE_URL}/api/newsletters/${id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: updateForm.toString(),
        });
        json = await res.json();
        log('Update', json);

        // 5) Delete
        res = await fetch(`${BASE_URL}/api/newsletters/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`,
          },
        });
        json = await res.json();
        log('Delete', json);
      }
    }

    // 6) List with pagination
    res = await fetch(`${BASE_URL}/api/newsletters?page=1&limit=5&orderBy=createdAt&order=desc`);
    json = await res.json();
    log('List', json);
  } catch (err) {
    console.error('Test error:', err);
    process.exitCode = 1;
  }
}

run();
