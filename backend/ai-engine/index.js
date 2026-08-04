const { detectFakeReviews } = require('./fakeReviewDetector');
const { analyzeReviewSentiment } = require('./sentimentAnalyzer');
const { generateRiskExplanation } = require('./riskExplainer');

async function analyzeWithAI({ reviews, sellerDetails, trustScore, riskLevel, reasons }) {
  const fakeReviewAnalysis = detectFakeReviews(reviews);
  const sentimentAnalysis = analyzeReviewSentiment(reviews);
  const riskExplanation = generateRiskExplanation({
    trustScore,
    riskLevel,
    reasons,
    fakeReviewAnalysis,
    sentimentAnalysis,
    sellerDetails,
  });

  return {
    fakeReviewAnalysis,
    sentimentAnalysis,
    riskExplanation,
  };
}

module.exports = {
  detectFakeReviews,
  analyzeReviewSentiment,
  generateRiskExplanation,
  analyzeWithAI,
};
