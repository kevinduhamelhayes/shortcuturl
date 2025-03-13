const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getSubscriptionPlans,
  createCheckoutSession,
  handleWebhook,
  getUserSubscription,
  cancelSubscription,
} = require('../controllers/subscriptionController');

// Public routes
router.get('/plans', getSubscriptionPlans);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.post('/create-checkout-session', protect, createCheckoutSession);
router.get('/me', protect, getUserSubscription);
router.post('/cancel', protect, cancelSubscription);

module.exports = router; 