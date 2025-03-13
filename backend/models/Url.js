const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
    },
    customCode: {
      type: String,
      default: null,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
    analytics: {
      referrers: [
        {
          source: String,
          count: Number,
        },
      ],
      browsers: [
        {
          name: String,
          count: Number,
        },
      ],
      devices: [
        {
          type: String,
          count: Number,
        },
      ],
      locations: [
        {
          country: String,
          count: Number,
        },
      ],
    },
    password: {
      type: String,
      default: null,
    },
    isPasswordProtected: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Url', urlSchema); 