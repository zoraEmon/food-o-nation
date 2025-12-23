#!/usr/bin/env node
import { fileURLToPath } from 'url';
import path from 'path';

// Simple unit-style test to verify fileIndexMap -> item image mapping in DonationService
process.env.TEST_USE_MEMORY = 'true';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { DonationService } from '../../../src/services/donation.service.js';

async function run() {
  const svc = new DonationService();

  // Prepare items
  const items = [
    { name: 'Rice', category: 'Grains', quantity: 10, unit: 'kg' },
    { name: 'Canned Tuna', category: 'Canned Goods', quantity: 20, unit: 'cans' },
  ];

  // Mock uploaded files (paths would normally be multer paths)
  const files = [
    { path: 'uploads/item-tuna.jpg' },
    { path: 'uploads/item-rice.jpg' },
    { path: 'uploads/donation-overall.jpg' },
  ];

  // fileIndexMap maps each file to item index: first file -> item index 1 (tuna), second -> 0 (rice), third -> -1 (donation-level)
  const fileIndexMap = [1, 0, -1];

  try {
    const donation = await svc.createProduceDonation(undefined, '00000000-0000-0000-0000-000000000002', new Date(Date.now() + 86400000), items, files, fileIndexMap, 'Guest', 'guest@test.local');

    console.log('Created donation id:', donation.id);
    console.log('Donation items and imageUrl mapping:');
    donation.items.forEach((it) => console.log(` - ${it.name}: ${it.imageUrl}`));
    console.log('Donation-level images:', donation.imageUrls || []);

    // Basic assertions
    const rice = donation.items.find(i => i.name === 'Rice');
    const tuna = donation.items.find(i => i.name === 'Canned Tuna');
    if (!rice || !tuna) throw new Error('Items not present');
    if (rice.imageUrl !== 'uploads/item-rice.jpg') throw new Error('Rice mapping incorrect');
    if (tuna.imageUrl !== 'uploads/item-tuna.jpg') throw new Error('Tuna mapping incorrect');
    if (!donation.imageUrls || donation.imageUrls[0] !== 'uploads/donation-overall.jpg') throw new Error('Donation-level image mapping incorrect');

    console.log('✅ Image mapping test passed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Image mapping test failed:', err);
    process.exit(2);
  }
}

run();
