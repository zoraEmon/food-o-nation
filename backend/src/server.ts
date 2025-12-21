import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/index.js';
import { updateExpiredApplicationStatusesService } from './services/programApplication.service.js';
import { deleteRejectedBeneficiariesOlderThan } from './services/beneficiary.service.js';
import { DonorService } from './services/donor.service.js';
import cron from 'node-cron';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', router);

app.use('/uploads', express.static('uploads'));

// Health Check (Optional)
app.get('/', (req, res) => {
  res.send('Food-o-Nation API is running...');
  
});

// Helper function to retry a promise with exponential backoff
async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 2000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isConnectionError = error?.message?.includes('Can\'t reach database') || error?.message?.includes('ECONNREFUSED');
      if (attempt < maxRetries && isConnectionError) {
        const delay = delayMs * Math.pow(2, attempt - 1);
        console.log(`[Retry] Attempt ${attempt}/${maxRetries} failed. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('All retries exhausted');
}

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Dev debug endpoint info
  if (process.env.NODE_ENV !== 'production') {
    const devToken = process.env.DEV_DEBUG_TOKEN;
    if (devToken) {
      console.log('[Dev] OTP debug endpoint enabled and requires x-dev-debug-token header');
    } else {
      console.log('[Dev] OTP debug endpoint enabled (no token configured) — set DEV_DEBUG_TOKEN to require header authentication');
    }
  }

  // Skip cron jobs in test mode
  if (process.env.TEST_USE_MEMORY === 'true') {
    console.log('[Test Mode] Skipping cron jobs');
    return;
  }
  
  // Startup run once with retry logic
  retryAsync(() => updateExpiredApplicationStatusesService(), 3, 2000)
    .then(() => console.log('[Nightly Expiry Job] Startup run complete'))
    .catch((e: any) => console.error('[Nightly Expiry Job] Startup error:', e?.message || e));

  // Schedule at 02:00 daily (server local time)
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('[Nightly Expiry Job] Running...');
      await retryAsync(() => updateExpiredApplicationStatusesService(), 3, 1000);
      console.log('[Nightly Expiry Job] Completed');
    } catch (e: any) {
      console.error('[Nightly Expiry Job] Error:', e?.message || e);
    }
  });

  // Schedule cleanup for rejected beneficiaries after 30 days at 02:10
  cron.schedule('10 2 * * *', async () => {
    try {
      console.log('[Nightly Beneficiary Cleanup] Running...');
      const result = await retryAsync(() => deleteRejectedBeneficiariesOlderThan(30), 3, 1000);
      console.log(`[Nightly Beneficiary Cleanup] Deleted: ${result.deleted}`);
    } catch (e: any) {
      console.error('[Nightly Beneficiary Cleanup] Error:', e?.message || e);
    }
  });

  // Schedule cleanup for rejected donors after 30 days at 02:15
  cron.schedule('15 2 * * *', async () => {
    try {
      console.log('[Nightly Donor Cleanup] Running...');
      const donorService = new DonorService();
      const result = await retryAsync(() => donorService.deleteRejectedOlderThan(30), 3, 1000);
      console.log(`[Nightly Donor Cleanup] Deleted: ${result.deleted}`);
    } catch (e: any) {
      console.error('[Nightly Donor Cleanup] Error:', e?.message || e);
    }
  });
});