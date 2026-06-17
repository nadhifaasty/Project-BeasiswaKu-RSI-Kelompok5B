import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes';

const app = express();

// Secure backend headers with Helmet (disabling default strict CSP to allow Vite/React dev assets and external Supabase connections)
app.use(helmet({
  contentSecurityPolicy: false,
}));

// Cross-Origin Resource Sharing
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// Request body parser with payload size limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  res.on('finish', () => {
    console.log(`[RESPONSE] ${req.method} ${req.url} -> ${res.statusCode}`);
  });
  next();
});

// Global API Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX ? Number(process.env.RATE_LIMIT_MAX) : 150, // Default to 150, allow override for testing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi setelah 15 menit.'
  }
});

app.use('/api', limiter);
app.use('/api/v1', limiter);
app.use('/api/v1', routes);
app.use('/api', routes);

export default app;
