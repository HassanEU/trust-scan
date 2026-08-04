require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const analyzeRoutes = require('./routes/analyzeRoutes');
const userRoutes = require('./routes/userRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_, res) =>
  res.json({ status: 'ok', app: 'TrustScan', version: '1.0.0' })
);

app.use('/api/auth', authRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/user', userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET is not set. Authentication will not work.');
}

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trustscan')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`TrustScan API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    console.log('Starting server without database — auth and history will not work.');
    app.listen(PORT, () => console.log(`TrustScan API running on port ${PORT} (no DB)`));
  });

module.exports = app;
