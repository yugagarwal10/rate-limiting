const ApiKeyRateLimit = require('../models/ApiKeyRateLimit');

const apiKeyRateLimiter = async (req, res, next) => {
  try {
    const apiKey = req.apiKey;
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API Key',
      });
    }

    const now = Date.now();
    const expiryTime = new Date(now - 180000); // 3 minutes window (180,000 ms)

    // Hybrid Cleanup: Delete expired records manually so reset happens immediately
    await ApiKeyRateLimit.deleteMany({ apiKey, createdAt: { $lt: expiryTime } });

    // Atomically upsert and increment count
    const keyLimitDoc = await ApiKeyRateLimit.findOneAndUpdate(
      { apiKey },
      { 
        $setOnInsert: { createdAt: new Date() }, 
        $inc: { count: 1 } 
      },
      { upsert: true, new: true }
    );

    // Calculate limit metrics
    const limit = 10; // 10 requests max
    const count = keyLimitDoc.count;
    const remaining = Math.max(0, limit - count);
    const timePassedMs = now - keyLimitDoc.createdAt.getTime();
    const resetSeconds = Math.max(0, Math.ceil((180000 - timePassedMs) / 1000));

    // Expose headers
    res.setHeader('X-RateLimit-Limit-ApiKey', limit);
    res.setHeader('X-RateLimit-Remaining-ApiKey', remaining);
    res.setHeader('X-RateLimit-Reset-ApiKey', resetSeconds);
    res.setHeader('Access-Control-Expose-Headers', 'X-RateLimit-Limit-ApiKey, X-RateLimit-Remaining-ApiKey, X-RateLimit-Reset-ApiKey');

    if (count > limit) {
      return res.status(429).json({
        success: false,
        message: 'API Key rate limit exceeded',
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  apiKeyRateLimiter,
};
