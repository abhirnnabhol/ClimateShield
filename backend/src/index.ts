import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import riskRoutes from './routes/riskRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import monitorRoutes from './routes/monitorRoutes.js';
import airQualityRoutes from './routes/airQualityRoutes.js';
import { riskController } from './controllers/riskController.js';
import { profileController } from './controllers/profileController.js';
import { requireAuth } from './middleware/auth.js';
import { initializeMonitoringJob } from './jobs/monitorJob.js';

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow localhost, local network and undefined origins (curl, mobile, etc.)
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// Health Check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'ClimateShield API Gateway',
    version: '1.0.0',
    demoMode: config.demoMode,
    timestamp: new Date().toISOString()
  });
});

// Direct alias for /api/dashboard as specified in Section 31
app.get('/api/dashboard', requireAuth, (req, res) => riskController.getDashboard(req, res));

// Direct alias for /api/settings/notifications
app.get('/api/settings/notifications', requireAuth, (req, res) => profileController.getNotificationSettings(req, res));
app.put('/api/settings/notifications', requireAuth, (req, res) => profileController.updateNotificationSettings(req, res));

// Registered Routes
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/monitor', monitorRoutes);
app.use('/api/air-quality', airQualityRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🌍 ClimateShield Backend Server Running`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📊 Mode: ${config.nodeEnv.toUpperCase()} | Demo Mode: ${config.demoMode ? 'ENABLED' : 'DISABLED (LIVE SENSORS)'}`);
  console.log(`🔒 JWT Authentication & Protected Routes Active`);
  console.log(`📍 Monitored Locations & Risk Engine Initialized`);
  console.log(`======================================================\n`);

  // Initialize automated climate monitoring background job
  initializeMonitoringJob();
});
