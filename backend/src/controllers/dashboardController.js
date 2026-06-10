const ApiKey = require('../models/ApiKey');
const IpRateLimit = require('../models/IpRateLimit');

// @desc    Get usage statistics for Dashboard
// @route   GET /api/dashboard-stats
// @access  Public
const getDashboardStats = async (req, res, next) => {
  try {
    const { apiKey } = req.query;
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const ip = rawIp.includes('::ffff:') ? rawIp.split('::ffff:')[1] : rawIp;

    const stats = {
      apiKey: null,
      ipStats: {
        ip,
        used: 0,
        remaining: 10,
        resetTimer: 180, // Default 3 minutes in seconds
      },
    };

    const now = Date.now();
    const expiryTime = new Date(now - 180000); // 3 minutes window (180,000 ms)

    // Clean up and compute IP Rate Limit stats
    await IpRateLimit.deleteMany({ ip, createdAt: { $lt: expiryTime } });
    const ipLimitDoc = await IpRateLimit.findOne({ ip });
    if (ipLimitDoc) {
      stats.ipStats.used = ipLimitDoc.count;
      stats.ipStats.remaining = Math.max(0, 10 - ipLimitDoc.count);
      const timePassed = now - ipLimitDoc.createdAt.getTime();
      stats.ipStats.resetTimer = Math.max(0, Math.ceil((180000 - timePassed) / 1000));
    }

    // Retrieve API Key details (if apiKey provided)
    if (apiKey) {
      const keyDoc = await ApiKey.findOne({ apiKey });
      if (keyDoc) {
        stats.apiKey = {
          name: keyDoc.name,
          apiKey: keyDoc.apiKey,
          createdAt: keyDoc.createdAt,
        };
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
