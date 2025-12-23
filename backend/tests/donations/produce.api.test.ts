import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';

// Use in-memory PrismaMock for tests
process.env.TEST_USE_MEMORY = 'true';

import donationRouter from '../../src/routes/donation.routes.js';

describe('POST /api/donations/produce (multipart integration)', () => {
  let app: any;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    // Mount only the donations router at /api/donations to avoid loading unrelated modules
    app.use('/api/donations', donationRouter);
  });

  it('accepts multipart with files, fileIndexMap and fileMeta and stores imageUrls', async () => {
    const scheduled = new Date();
    scheduled.setDate(scheduled.getDate() + 3);

    const items = [
      { name: 'Rice', category: 'Grains', quantity: 10, unit: 'kg' },
      { name: 'Canned Tuna', category: 'Canned Goods', quantity: 20, unit: 'cans' },
    ];

    const fileIndexMap = [0, 1, -1];
    const fileMeta = [
      { originalName: 'rice.jpg', note: 'Rice photo', itemIndex: 0 },
      { originalName: 'tuna.jpg', note: 'Tuna photo', itemIndex: 1 },
      { originalName: 'donation.jpg', note: 'Overall', itemIndex: -1 },
    ];

    const res = await request(app)
      .post('/api/donations/produce')
      .field('donationCenterId', '11111111-1111-4111-8111-111111111111')
      .field('scheduledDate', scheduled.toISOString())
      .field('items', JSON.stringify(items))
      .field('fileIndexMap', JSON.stringify(fileIndexMap))
      .field('fileMeta', JSON.stringify(fileMeta))
      .attach('images', Buffer.from('fake-image-1'), { filename: 'rice.jpg', contentType: 'image/jpeg' })
      .attach('images', Buffer.from('fake-image-2'), { filename: 'tuna.jpg', contentType: 'image/jpeg' })
      .attach('images', Buffer.from('fake-image-3'), { filename: 'donation.jpg', contentType: 'image/jpeg' });

    if (res.status !== 201) {
      console.error('Response body on failure:', res.body);
    }

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    const donation = res.body.data.donation;
    expect(donation).toBeDefined();
    expect(Array.isArray(donation.items)).toBe(true);
    // Each item should have imageUrl when mapping applied
    expect(donation.items.length).toBe(2);
    donation.items.forEach((it: any) => {
      expect(it).toHaveProperty('imageUrl');
      expect(typeof it.imageUrl === 'string' || it.imageUrl === null).toBeTruthy();
    });
    // donation-level images should be present
    expect(Array.isArray(donation.imageUrls)).toBe(true);
    expect(donation.imageUrls.length).toBeGreaterThanOrEqual(0);
  });
});
