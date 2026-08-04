const mongoose = require('mongoose');

const productCheckSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    productUrl: { type: String, required: true },
    productName: { type: String, required: true },
    brand: { type: String, default: 'Unknown' },
    sellerName: { type: String, required: true },
    sellerRating: { type: Number, default: 0 },
    marketplace: { type: String, required: true },
    price: { type: String, default: 'N/A' },
    trustScore: { type: Number, required: true, min: 0, max: 100 },
    riskLevel: { type: String, required: true },
    reasons: [{ type: String }],
    recommendation: { type: String, required: true },
    analysisDetails: {
      fakeReviewScore: { type: Number, default: 0 },
      sentimentScore: { type: Number, default: 0 },
      priceAnalysis: { type: String },
      sellerAnalysis: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProductCheck', productCheckSchema);
