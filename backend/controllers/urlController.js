const { nanoid } = require('nanoid');
const Url = require('../models/Url');
const User = require('../models/User');
const Recaptcha = require('recaptcha-v2').Recaptcha;
const bcrypt = require('bcryptjs');

// @desc    Create a short URL
// @route   POST /api/urls
// @access  Public/Private
const createShortUrl = async (req, res) => {
  try {
    const { originalUrl, captchaResponse, customCode, expiresIn, password } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: 'Please provide a URL' });
    }

    // Check if URL is valid
    try {
      new URL(originalUrl);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid URL' });
    }

    // Verify CAPTCHA for non-authenticated users
    if (!req.user) {
      // Skip CAPTCHA verification in development environment
      if (process.env.NODE_ENV !== 'development' && !captchaResponse) {
        return res.status(400).json({ message: 'CAPTCHA verification required' });
      }

      if (process.env.NODE_ENV !== 'development') {
        const recaptcha = new Recaptcha(
          process.env.RECAPTCHA_SITE_KEY,
          process.env.RECAPTCHA_SECRET_KEY,
          { remoteip: req.ip }
        );

        const recaptchaVerification = await new Promise((resolve) => {
          recaptcha.verify({ response: captchaResponse }, (success) => {
            resolve(success);
          });
        });

        if (!recaptchaVerification) {
          return res.status(400).json({ message: 'CAPTCHA verification failed' });
        }
      }
    }

    // Check URL limit for authenticated users
    if (req.user) {
      const urlCount = await Url.countDocuments({ user: req.user._id });
      const user = await User.findById(req.user._id);
      
      if (urlCount >= user.maxUrls) {
        return res.status(403).json({ 
          message: 'You have reached your URL limit. Upgrade to premium for more URLs.',
          isPremiumFeature: true
        });
      }
    }

    // Handle custom code (premium feature)
    let shortCode = nanoid(6);
    
    if (customCode && req.user) {
      const user = await User.findById(req.user._id);
      
      if (!user.customUrlsEnabled) {
        return res.status(403).json({ 
          message: 'Custom URLs are a premium feature. Please upgrade your plan.',
          isPremiumFeature: true
        });
      }
      
      // Check if custom code already exists
      const existingUrl = await Url.findOne({ shortCode: customCode });
      if (existingUrl) {
        return res.status(400).json({ message: 'This custom code is already in use' });
      }
      
      shortCode = customCode;
    }

    // Handle URL expiry (premium feature)
    let expiresAt = null;
    
    if (expiresIn && req.user) {
      const user = await User.findById(req.user._id);
      
      if (!user.urlExpiryEnabled) {
        return res.status(403).json({ 
          message: 'URL expiry is a premium feature. Please upgrade your plan.',
          isPremiumFeature: true
        });
      }
      
      const now = new Date();
      expiresAt = new Date(now);
      
      // Convert expiresIn to days and add to current date
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresIn));
    }

    // Handle password protection (premium feature)
    let hashedPassword = null;
    let isPasswordProtected = false;
    
    if (password && req.user) {
      const user = await User.findById(req.user._id);
      
      if (user.subscription === 'free') {
        return res.status(403).json({ 
          message: 'Password protection is a premium feature. Please upgrade your plan.',
          isPremiumFeature: true
        });
      }
      
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
      isPasswordProtected = true;
    }

    // Create a new URL
    const url = new Url({
      originalUrl,
      shortCode,
      customCode: customCode || null,
      user: req.user ? req.user._id : null,
      expiresAt,
      isExpired: false,
      password: hashedPassword,
      isPasswordProtected,
      analytics: {
        referrers: [],
        browsers: [],
        devices: [],
        locations: [],
      },
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

    // Check if URL has expired
    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      url.isExpired = true;
      await url.save();
      return res.status(410).json({ message: 'This URL has expired' });
    }

    // Check if URL is password protected
    if (url.isPasswordProtected) {
      const { password } = req.query;
      
      if (!password) {
        return res.status(401).json({ 
          message: 'This URL is password protected',
          isPasswordProtected: true
        });
      }
      
      const isMatch = await bcrypt.compare(password, url.password);
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' });
      }
    }

    // Collect analytics data if user has analytics enabled
    if (url.user) {
      const user = await User.findById(url.user);
      
      if (user && user.analyticsEnabled) {
        // Get referrer
        const referrer = req.get('Referrer') || 'direct';
        
        // Get browser info from user agent
        const userAgent = req.get('User-Agent') || '';
        let browser = 'unknown';
        
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';
        else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) browser = 'Internet Explorer';
        
        // Determine device type
        let device = 'desktop';
        if (userAgent.includes('Mobile')) device = 'mobile';
        else if (userAgent.includes('Tablet')) device = 'tablet';
        
        // Update analytics
        // Referrer
        const referrerIndex = url.analytics.referrers.findIndex(r => r.source === referrer);
        if (referrerIndex >= 0) {
          url.analytics.referrers[referrerIndex].count += 1;
        } else {
          url.analytics.referrers.push({ source: referrer, count: 1 });
        }
        
        // Browser
        const browserIndex = url.analytics.browsers.findIndex(b => b.name === browser);
        if (browserIndex >= 0) {
          url.analytics.browsers[browserIndex].count += 1;
        } else {
          url.analytics.browsers.push({ name: browser, count: 1 });
        }
        
        // Device
        const deviceIndex = url.analytics.devices.findIndex(d => d.type === device);
        if (deviceIndex >= 0) {
          url.analytics.devices[deviceIndex].count += 1;
        } else {
          url.analytics.devices.push({ type: device, count: 1 });
        }
      }
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

// @desc    Get global statistics
// @route   GET /api/urls/stats
// @access  Public
const getGlobalStats = async (req, res) => {
  try {
    const totalUrls = await Url.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalClicks = await Url.aggregate([
      {
        $group: {
          _id: null,
          totalClicks: { $sum: '$clicks' }
        }
      }
    ]);

    const stats = {
      totalUrls,
      totalUsers,
      totalClicks: totalClicks.length > 0 ? totalClicks[0].totalClicks : 0
    };

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get URL analytics
// @route   GET /api/urls/:id/analytics
// @access  Private
const getUrlAnalytics = async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Check if user owns the URL
    if (url.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if user has analytics enabled
    const user = await User.findById(req.user._id);
    if (!user.analyticsEnabled) {
      return res.status(403).json({ 
        message: 'Analytics is a premium feature. Please upgrade your plan.',
        isPremiumFeature: true
      });
    }

    res.json({
      clicks: url.clicks,
      analytics: url.analytics,
      createdAt: url.createdAt,
      shortCode: url.shortCode,
      originalUrl: url.originalUrl
    });
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
  getGlobalStats,
  getUrlAnalytics,
}; 