const express = require('express');
const router = express.Router();

// Import controllers
const { generateApiKey, getApiKeys } = require('../controllers/apiKeyController');
const { getDashboardStats } = require('../controllers/dashboardController');
const { handlePublicApiCall } = require('../controllers/publicApiController');

// Import middleware
const authApiKey = require('../middleware/auth');
const { apiKeyRateLimiter } = require('../middleware/rateLimiter');

// API Key management routes
router.post('/keys', generateApiKey);
router.get('/keys', getApiKeys);

// Dashboard route
router.get('/dashboard-stats', getDashboardStats);

// Public API route (Simplified middleware chain - API Key Rate Limited)
router.post(
  '/public',
  authApiKey,         // 1. Authenticate API Key
  apiKeyRateLimiter,  // 2. Enforce API Key rate limiting (10 reqs per 3 mins)
  handlePublicApiCall // 3. Final endpoint handler
);

module.exports = router;
