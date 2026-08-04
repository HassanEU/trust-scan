const {
  TRUST_THRESHOLDS,
  BASE_TRUST_SCORE,
  SCORE_ADJUSTMENTS,
} = require('../utils/constants');

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getRiskLevel(score) {
  if (score >= TRUST_THRESHOLDS.HIGHLY_TRUSTED.min) {
    return TRUST_THRESHOLDS.HIGHLY_TRUSTED.label;
  }
  if (score >= TRUST_THRESHOLDS.MODERATE_RISK.min) {
    return TRUST_THRESHOLDS.MODERATE_RISK.label;
  }
  return TRUST_THRESHOLDS.SUSPICIOUS.label;
}

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const numeric = priceStr.replace(/[^0-9.]/g, '');
  return parseFloat(numeric) || 0;
}

function calculateTrustScore({ sellerDetails, productData, fakeReviewAnalysis, sentimentAnalysis }) {
  let score = BASE_TRUST_SCORE;
  const reasons = [];

  const sellerRating = sellerDetails.rating || 0;

  if (sellerRating > SCORE_ADJUSTMENTS.HIGH_SELLER_RATING.threshold) {
    score += SCORE_ADJUSTMENTS.HIGH_SELLER_RATING.value;
    reasons.push(`✓ Seller has excellent rating (${sellerRating}/5)`);
  } else if (sellerRating < 3.5) {
    reasons.push(`⚠ Seller rating is below average (${sellerRating}/5)`);
  }

  if (sellerDetails.accountAgeDays >= SCORE_ADJUSTMENTS.OLD_TRUSTED_SELLER.minAccountAgeDays) {
    score += SCORE_ADJUSTMENTS.OLD_TRUSTED_SELLER.value;
    reasons.push(`✓ Established seller (${sellerDetails.accountAgeDays} days on platform)`);
  }

  if (sellerDetails.isVerified) {
    score += SCORE_ADJUSTMENTS.VERIFIED_SELLER.value;
    reasons.push('✓ Seller is verified on the marketplace');
  }

  if (
    sentimentAnalysis.hasPositiveVerifiedReviews &&
    sentimentAnalysis.positiveRatio >= SCORE_ADJUSTMENTS.POSITIVE_VERIFIED_REVIEWS.minPositiveRatio
  ) {
    score += SCORE_ADJUSTMENTS.POSITIVE_VERIFIED_REVIEWS.value;
    reasons.push(`✓ Positive verified reviews (${Math.round(sentimentAnalysis.positiveRatio * 100)}% positive)`);
  }

  const currentPrice = parsePrice(productData.price);
  const originalPrice = parsePrice(productData.originalPrice);
  if (originalPrice > 0 && currentPrice / originalPrice < SCORE_ADJUSTMENTS.VERY_LOW_PRICE.discountThreshold) {
    score += SCORE_ADJUSTMENTS.VERY_LOW_PRICE.value;
    const discount = Math.round((1 - currentPrice / originalPrice) * 100);
    reasons.push(`⚠ Price is unusually low (${discount}% below typical retail)`);
  }

  if (sellerDetails.accountAgeDays <= SCORE_ADJUSTMENTS.NEW_SELLER.maxAccountAgeDays) {
    score += SCORE_ADJUSTMENTS.NEW_SELLER.value;
    reasons.push(`⚠ New seller account (${sellerDetails.accountAgeDays} days old)`);
  }

  if (fakeReviewAnalysis.isFakeDetected) {
    score += SCORE_ADJUSTMENTS.FAKE_REVIEWS.value;
    reasons.push('⚠ Fake review patterns detected');
    fakeReviewAnalysis.flags.forEach((flag) => reasons.push(`  → ${flag}`));
  }

  if (sellerDetails.isSuspicious) {
    score += SCORE_ADJUSTMENTS.SUSPICIOUS_SELLER.value;
    reasons.push('⚠ Seller flagged as suspicious');
  }

  if (sentimentAnalysis.overallSentiment === 'negative') {
    reasons.push(`⚠ Negative customer sentiment detected`);
  }

  score = clampScore(score);
  const riskLevel = getRiskLevel(score);

  return { trustScore: score, riskLevel, reasons };
}

module.exports = { calculateTrustScore, getRiskLevel, clampScore };
