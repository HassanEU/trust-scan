const TRUST_THRESHOLDS = {
  HIGHLY_TRUSTED: { min: 80, max: 100, label: 'Highly Trusted', color: '#22c55e' },
  MODERATE_RISK: { min: 50, max: 79, label: 'Moderate Risk', color: '#f59e0b' },
  SUSPICIOUS: { min: 0, max: 49, label: 'Suspicious', color: '#ef4444' },
};

const BASE_TRUST_SCORE = 50;

const SCORE_ADJUSTMENTS = {
  HIGH_SELLER_RATING: { value: 20, threshold: 4.5 },
  OLD_TRUSTED_SELLER: { value: 15, minAccountAgeDays: 365 },
  VERIFIED_SELLER: { value: 15 },
  POSITIVE_VERIFIED_REVIEWS: { value: 10, minPositiveRatio: 0.7 },
  VERY_LOW_PRICE: { value: -20, discountThreshold: 0.6 },
  NEW_SELLER: { value: -15, maxAccountAgeDays: 90 },
  FAKE_REVIEWS: { value: -20 },
  SUSPICIOUS_SELLER: { value: -25 },
};

const MARKETPLACES = {
  AMAZON: 'amazon',
  FLIPKART: 'flipkart',
  EBAY: 'ebay',
  SHOPIFY: 'shopify',
  UNKNOWN: 'unknown',
};

module.exports = {
  TRUST_THRESHOLDS,
  BASE_TRUST_SCORE,
  SCORE_ADJUSTMENTS,
  MARKETPLACES,
};
