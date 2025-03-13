const express = require('express');
const router = express.Router();
const {
  createShortUrl,
  getUrls,
  deleteUrl,
  getGlobalStats,
  getUrlAnalytics,
} = require('../controllers/urlController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for URL creation
const createUrlLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 URL creations per hour
  message: {
    status: 429,
    message: 'Too many URLs created from this IP, please try again after an hour'
  }
});

// Public routes
router.post('/', createUrlLimiter, createShortUrl);
router.get('/stats', getGlobalStats);

// Protected routes
router.get('/', protect, getUrls);
router.delete('/:id', protect, deleteUrl);
router.get('/:id/analytics', protect, getUrlAnalytics);

module.exports = router; 