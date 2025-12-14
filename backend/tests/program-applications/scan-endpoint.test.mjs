// Minimal integration test for scan QR endpoint
import assert from 'assert';
import http from 'http';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const url = new URL(path, BASE_URL);
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    const req = http.request(url, opts, (res) => {
      let chunks = '';
      res.on('data', (d) => (chunks += d));
      res.on('end', () => {
        try {
          const json = chunks ? JSON.parse(chunks) : {};
          resolve({ status: res.statusCode, json });
        } catch (e) {
          resolve({ status: res.statusCode, json: { raw: chunks } });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  console.log('\x1b[34m[Scan Test]\x1b[0m starting');

  // Preconditions: programId, beneficiaryId and application created via register
  const programId = process.env.PROGRAM_ID || 'PROGRAM_ID_HERE';
  const beneficiaryId = process.env.BENEFICIARY_ID || 'BENEFICIARY_ID_HERE';

  if (programId.includes('HERE') || beneficiaryId.includes('HERE')) {
    console.log('\x1b[33m[Skip]\x1b[0m set PROGRAM_ID and BENEFICIARY_ID env to run end-to-end');
    process.exit(0);
  }

  const register = await request('POST', '/programs/register', {
    programId,
    beneficiaryId,
  });

  assert.strictEqual(register.status, 201, 'register should return 201');
  const applicationId = register.json?.data?.application?.id;
  const qrCodeValue = register.json?.data?.application?.qrCodeValue;
  assert.ok(applicationId, 'applicationId present');
  assert.ok(qrCodeValue, 'qrCodeValue present');

  const scan = await request('POST', '/programs/scan-qr', {
    qrCodeValue,
    adminId: process.env.ADMIN_ID || 'ADMIN_ID_TEST',
    notes: 'Automated test scan',
  });

  assert.strictEqual(scan.status, 200, 'scan should return 200');
  const app = scan.json?.data?.application;
  assert.ok(app?.applicationStatus === 'COMPLETED', 'status flipped to COMPLETED');
  assert.ok(app?.qrCodeScannedAt, 'qrCodeScannedAt set');

  console.log('\x1b[32m[PASS]\x1b[0m scan endpoint end-to-end');
}

run().catch((e) => {
  console.error('\x1b[31m[FAIL]\x1b[0m', e?.message || e);
  process.exit(1);
});
