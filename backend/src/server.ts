import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/index.js';
import { updateExpiredApplicationStatusesService } from './services/programApplication.service.js';
import cron from 'node-cron';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', router);

app.use('/uploads', express.static('uploads'));

// Health Check (Optional)
app.get('/', (req, res) => {
  res.send('Food-o-Nation API is running...');
  
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Startup run once
  updateExpiredApplicationStatusesService()
    .then(() => console.log('[Nightly Expiry Job] Startup run complete'))
    .catch((e: any) => console.error('[Nightly Expiry Job] Startup error:', e?.message || e));

  // Schedule at 02:00 daily (server local time)
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('[Nightly Expiry Job] Running...');
      await updateExpiredApplicationStatusesService();
      console.log('[Nightly Expiry Job] Completed');
    } catch (e: any) {
      console.error('[Nightly Expiry Job] Error:', e?.message || e);
    }
  });
});