const ApiKey = require('../models/ApiKey');
const ApiKeyRateLimit = require('../models/ApiKeyRateLimit');

// @desc    Get usage statistics for Dashboard
// @route   GET /api/dashboard-stats
// @access  Public
const getDashboardStats = async (req, res, next) => {
  try {
    const { apiKey } = req.query;

    const stats = {
      apiKey: null,
      apiKeyStats: {
        used: 0,
        remaining: 10,
        resetTimer: 180, // Default 3 minutes in seconds
      },
    };

    const now = Date.now();
    const expiryTime = new Date(now - 180000); // 3 minutes window (180,000 ms)

    // Retrieve API Key details and stats (if apiKey provided)
    if (apiKey) {
      const keyDoc = await ApiKey.findOne({ apiKey });
      if (keyDoc) {
        stats.apiKey = {
          name: keyDoc.name,
          apiKey: keyDoc.apiKey,
          createdAt: keyDoc.createdAt,
        };

        // Clean up and compute stats for the API key
        await ApiKeyRateLimit.deleteMany({ apiKey, createdAt: { $lt: expiryTime } });
        const keyLimitDoc = await ApiKeyRateLimit.findOne({ apiKey });
        if (keyLimitDoc) {
          stats.apiKeyStats.used = keyLimitDoc.count;
          stats.apiKeyStats.remaining = Math.max(0, 10 - keyLimitDoc.count);
          const timePassed = now - keyLimitDoc.createdAt.getTime();
          stats.apiKeyStats.resetTimer = Math.max(0, Math.ceil((180000 - timePassed) / 1000));
        }
      }
    }

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
