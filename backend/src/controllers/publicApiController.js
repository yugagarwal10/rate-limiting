// @desc    Mock Public Endpoint
// @route   POST /api/public
// @access  Public (Requires API Key)
const handlePublicApiCall = async (req, res, next) => {
  try {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const ip = rawIp.includes('::ffff:') ? rawIp.split('::ffff:')[1] : rawIp;

    res.status(200).json({
      success: true,
      message: 'API Request Successful!',
      timestamp: new Date(),
      clientDetails: {
        apiKeyName: req.apiKeyName,
        ipAddress: ip,
      },
      data: {
        info: 'You have successfully authenticated and consumed this public endpoint.',
        serviceStatus: 'Operational',
        latencyMs: Math.floor(Math.random() * 50) + 10,
        quotaLimit: 10,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handlePublicApiCall,
};
