// ============================================================
//  MAA JEWELLERS — Express Server
//  Run: node backend/server.js
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const connectDB  = require('./config/db');

// ── Connect to MongoDB ──────────────────────────────────────
connectDB();

const app = express();

// ── CORS Configuration ──────────────────────────────────────
// Allows the frontend (on any origin during dev, restricted in prod) to talk to this backend.
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  process.env.FRONTEND_URL, // production frontend URL from .env
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Body Parsing Middleware ─────────────────────────────────
// Increased limit to 10MB to support base64 image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Serve Static Frontend ───────────────────────────────────
// When you visit http://localhost:5000 it serves the frontend directly
app.use(express.static(path.join(__dirname, '..')));

// ── API Routes ──────────────────────────────────────────────
app.use('/api/products', require('./routes/products'));
app.use('/api/auth',     require('./routes/auth'));

// ── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:  'ok',
    message: '👑 Maa Jewellers API is running',
    time:    new Date().toISOString(),
  });
});

// ── Catch-all: serve index.html for any unknown route ───────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  👑  MAA JEWELLERS — Server Running          ║');
  console.log(`║  🌐  http://localhost:${PORT}                    ║`);
  console.log(`║  🛒  Customer: http://localhost:${PORT}/          ║`);
  console.log(`║  🔑  Admin:    http://localhost:${PORT}/admin.html║`);
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
});
