require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { checkDbConnection } = require('./lib/prisma');

const authRoutes = require('./routes/auth');
const ordersRoutes = require('./routes/orders');
const servicesRoutes = require('./routes/services');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Health Check with Database Status
app.get('/api/health', async (req, res) => {
  const dbStatus = await checkDbConnection();
  res.json({
    status: 'ok',
    service: 'Darzi Backend API',
    database: {
      orm: 'Prisma 6',
      provider: 'postgresql',
      connected: dbStatus.connected,
      error: dbStatus.error || null,
    },
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api', servicesRoutes);

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, async () => {
  console.log(`=================================`);
  console.log(`Darzi Backend Running on http://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  const dbCheck = await checkDbConnection();
  if (dbCheck.connected) {
    console.log(`PostgreSQL Database: Connected via Prisma ✅`);
  } else {
    console.log(`PostgreSQL Database: Standing by / Local fallback active ⚡`);
  }
  console.log(`=================================`);
});
