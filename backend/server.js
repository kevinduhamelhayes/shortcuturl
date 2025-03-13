const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { redirectToUrl } = require('./controllers/urlController');
const urlRoutes = require('./routes/urlRoutes');
const userRoutes = require('./routes/userRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());

// Special handling for Stripe webhook
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));

// Regular middleware for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message: 'Too many requests, please try again later.'
  }
});

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// More strict rate limiting for URL creation
const createUrlLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 URL creations per hour
  message: {
    status: 429,
    message: 'Too many URLs created from this IP, please try again after an hour'
  }
});

// Speed limiter for redirect route to prevent abuse
const redirectLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 30, // allow 30 requests per 15 minutes, then...
  delayMs: 500 // begin adding 500ms of delay per request
});

// Routes
app.use('/api/urls', urlRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Apply speed limiter to redirect route
app.get('/:shortCode', redirectLimiter, redirectToUrl);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ShortcutURL API' });
});

// Error handling middleware
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});