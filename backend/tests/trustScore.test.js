const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { calculateTrustScore } = require('../services/trustScoreService');
const { detectFakeReviews } = require('../ai-engine/fakeReviewDetector');
const { analyzeReviewSentiment } = require('../ai-engine/sentimentAnalyzer');

describe('TrustScoreService', () => {
  it('returns highly trusted for strong seller signals', () => {
    const fakeReviewAnalysis = detectFakeReviews([]);
    const sentimentAnalysis = analyzeReviewSentiment([
      { text: 'Excellent genuine product', rating: 5, verified: true },
    ]);

    const result = calculateTrustScore({
      sellerDetails: {
        rating: 4.8,
        accountAgeDays: 800,
        isVerified: true,
        isSuspicious: false,
      },
      productData: { price: '$100', originalPrice: '$110' },
      fakeReviewAnalysis,
      sentimentAnalysis,
    });

    assert.ok(result.trustScore >= 80);
    assert.equal(result.riskLevel, 'Highly Trusted');
  });

  it('returns suspicious for red flags', () => {
    const reviews = Array.from({ length: 10 }, () => ({
      text: 'Amazing product!!! Best ever!!! Buy now!!!',
      rating: 5,
      verified: false,
      date: new Date().toISOString(),
    }));

    const fakeReviewAnalysis = detectFakeReviews(reviews);
    const sentimentAnalysis = analyzeReviewSentiment(reviews);

    const result = calculateTrustScore({
      sellerDetails: {
        rating: 2.8,
        accountAgeDays: 30,
        isVerified: false,
        isSuspicious: true,
      },
      productData: { price: '$20', originalPrice: '$200' },
      fakeReviewAnalysis,
      sentimentAnalysis,
    });

    assert.ok(result.trustScore < 50);
    assert.equal(result.riskLevel, 'Suspicious');
  });
});

describe('FakeReviewDetector', () => {
  it('detects repeated and unnatural reviews', () => {
    const reviews = [
      { text: 'Great product great product great product', rating: 5, verified: false, date: '2025-01-01' },
      { text: 'Great product great product great product', rating: 5, verified: false, date: '2025-01-01' },
      { text: 'Amazing!!! Best ever!!! Buy now!!!', rating: 5, verified: false, date: '2025-01-01' },
    ];

    const result = detectFakeReviews(reviews);
    assert.ok(result.fakeReviewScore > 0);
    assert.ok(result.flags.length > 0);
  });
});
