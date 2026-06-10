const ApiKey = require('../models/ApiKey');

const authApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API Key',
      });
    }

    const keyDoc = await ApiKey.findOne({ apiKey });
    if (!keyDoc) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API Key',
      });
    }

    // Attach API key info to request object
    req.apiKey = keyDoc.apiKey;
    req.apiKeyName = keyDoc.name;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authApiKey;
