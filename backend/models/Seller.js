const mongoose = require('mongoose');

const sellerHistorySchema = new mongoose.Schema(
  {
    event: { type: String, required: true },
    trustScore: { type: Number },
    note: { type: String },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const sellerSchema = new mongoose.Schema(
  {
    sellerName: { type: String, required: true, trim: true },
    marketplace: { type: String, required: true, index: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalProducts: { type: Number, default: 0 },
    trustScore: { type: Number, default: 50, min: 0, max: 100 },
    accountAgeDays: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isSuspicious: { type: Boolean, default: false },
    history: [sellerHistorySchema],
    status: {
      type: String,
      enum: ['active', 'flagged', 'suspended', 'unknown'],
      default: 'unknown',
    },
  },
  { timestamps: true }
);

sellerSchema.index({ sellerName: 1, marketplace: 1 }, { unique: true });

module.exports = mongoose.model('Seller', sellerSchema);
