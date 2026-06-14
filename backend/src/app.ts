import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes';

const app = express();

// Secure backend headers with Helmet
app.use(helmet());

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
  max: 10000, // High limit to prevent 429 errors in local/testing environments
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
