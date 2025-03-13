const express = require('express');
const router = express.Router();
const {
  createShortUrl,
  getUrls,
  deleteUrl,
} = require('../controllers/urlController');
const { protect } = require('../middleware/authMiddleware');

// Public route to create a short URL
router.post('/', createShortUrl);

// Protected routes for authenticated users
router.get('/', protect, getUrls);
router.delete('/:id', protect, deleteUrl);

module.exports = router; 