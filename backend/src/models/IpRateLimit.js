const mongoose = require('mongoose');

const ipRateLimitSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
    index: true,
  },
  count: {
    type: Number,
    required: true,
    default: 1,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 180, // 3 minutes TTL in MongoDB
  },
});

module.exports = mongoose.model('IpRateLimit', ipRateLimitSchema);
