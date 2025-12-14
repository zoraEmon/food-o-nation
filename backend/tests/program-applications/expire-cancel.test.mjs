// Test the expiry cancellation service via HTTP endpoint
import assert from 'assert';
import http from 'http';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const url = new URL(path, BASE_URL);
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    const req = http.request(url, opts, (res) => {
      let chunks = '';
      res.on('data', (d) => (chunks += d));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, json: JSON.parse(chunks || '{}') }); }
        catch { resolve({ status: res.statusCode, json: { raw: chunks } }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  console.log('\x1b[34m[Expire Test]\x1b[0m starting');
  const resp = await request('POST', '/programs/admin/update-expired');
  assert.strictEqual(resp.status, 200, 'update-expired should return 200');
  const updatedCount = resp.json?.data?.updatedCount ?? resp.json?.data?.count;
  assert.ok(updatedCount >= 0, 'returns updated count');
  console.log('\x1b[32m[PASS]\x1b[0m expire cancellation ran');
}

run().catch((e) => { console.error('\x1b[31m[FAIL]\x1b[0m', e?.message || e); process.exit(1); });
