import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', router);
app.use('/uploads', express.static('uploads'));

// Health Check (Optional)
app.get('/', (req, res) => {
  res.send('Food-o-Nation API is running...');
  
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});