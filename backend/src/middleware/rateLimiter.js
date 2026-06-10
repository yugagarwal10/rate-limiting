const IpRateLimit = require('../models/IpRateLimit');

const ipRateLimiter = async (req, res, next) => {
  try {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const ip = rawIp.includes('::ffff:') ? rawIp.split('::ffff:')[1] : rawIp;

    const now = Date.now();
    const expiryTime = new Date(now - 180000); // 3 minutes window (180,000 ms)

    // Hybrid Cleanup: Delete expired records manually so reset happens immediately
    await IpRateLimit.deleteMany({ ip, createdAt: { $lt: expiryTime } });

    // Atomically upsert and increment count
    const ipLimitDoc = await IpRateLimit.findOneAndUpdate(
      { ip },
      { 
        $setOnInsert: { createdAt: new Date() }, 
        $inc: { count: 1 } 
      },
      { upsert: true, new: true }
    );

    // Calculate limit metrics
    const limit = 10; // 10 requests max
    const count = ipLimitDoc.count;
    const remaining = Math.max(0, limit - count);
    const timePassedMs = now - ipLimitDoc.createdAt.getTime();
    const resetSeconds = Math.max(0, Math.ceil((180000 - timePassedMs) / 1000));

    // Expose headers (only exposing IP rate limit headers)
    res.setHeader('X-RateLimit-Limit-Ip', limit);
    res.setHeader('X-RateLimit-Remaining-Ip', remaining);
    res.setHeader('X-RateLimit-Reset-Ip', resetSeconds);
    res.setHeader('Access-Control-Expose-Headers', 'X-RateLimit-Limit-Ip, X-RateLimit-Remaining-Ip, X-RateLimit-Reset-Ip');

    if (count > limit) {
      return res.status(429).json({
        success: false,
        message: 'IP rate limit exceeded',
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  ipRateLimiter,
};
