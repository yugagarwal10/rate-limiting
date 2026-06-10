const crypto = require('crypto');
const ApiKey = require('../models/ApiKey');

// @desc    Generate a new API Key
// @route   POST /api/keys
// @access  Public
const generateApiKey = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      res.status(400);
      throw new Error('Please provide a name for the API Key');
    }

    // Generate a secure random string prefixed with sk_live_
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const apiKey = `sk_live_${randomBytes}`;

    const newKey = await ApiKey.create({
      name: name.trim(),
      apiKey,
    });

    res.status(201).json({
      success: true,
      data: newKey,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all API Keys
// @route   GET /api/keys
// @access  Public
const getApiKeys = async (req, res, next) => {
  try {
    const keys = await ApiKey.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: keys,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateApiKey,
  getApiKeys,
};
