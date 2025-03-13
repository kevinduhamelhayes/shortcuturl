const { nanoid } = require('nanoid');
const Url = require('../models/Url');

// @desc    Create a short URL
// @route   POST /api/urls
// @access  Public/Private
const createShortUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: 'Please provide a URL' });
    }

    // Check if URL is valid
    try {
      new URL(originalUrl);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid URL' });
    }

    // Generate a short code
    const shortCode = nanoid(6);

    // Create a new URL
    const url = new Url({
      originalUrl,
      shortCode,
      user: req.user ? req.user._id : null,
    });

    await url.save();

    res.status(201).json(url);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all URLs for a user
// @route   GET /api/urls
// @access  Private
const getUrls = async (req, res) => {
  try {
    const urls = await Url.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(urls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Redirect to original URL
// @route   GET /:shortCode
// @access  Public
const redirectToUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Increment click count
    url.clicks++;
    await url.save();

    res.redirect(url.originalUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a URL
// @route   DELETE /api/urls/:id
// @access  Private
const deleteUrl = async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Check if user owns the URL
    if (url.user && url.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await url.deleteOne();
    res.json({ message: 'URL removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createShortUrl,
  getUrls,
  redirectToUrl,
  deleteUrl,
}; 