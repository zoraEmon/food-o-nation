// Mint a temporary admin JWT for testing newsletter endpoints
// Usage: node tests/newsletters/mint-admin-token.mjs "AllPeopleAreBornFree" "user-uuid"

import jwt from 'jsonwebtoken';

const [,, secret, userId] = process.argv;

if (!secret || !userId) {
  console.error('Usage: node tests/newsletters/mint-admin-token.mjs <JWT_SECRET> <USER_ID>');
  process.exit(1);
}

const payload = {
  userId,
  roles: ['ADMIN'],
  status: 'APPROVED',
};

const token = jwt.sign(payload, secret, { expiresIn: '2h' });
console.log(token);
