const POSITIVE_WORDS = [
  'excellent', 'great', 'good', 'amazing', 'perfect', 'love', 'recommend',
  'satisfied', 'quality', 'authentic', 'genuine', 'fast', 'helpful', 'works',
  'happy', 'best', 'wonderful', 'fantastic', 'reliable', 'durable',
];

const NEGATIVE_WORDS = [
  'fake', 'counterfeit', 'scam', 'terrible', 'awful', 'broken', 'defective',
  'refund', 'disappointed', 'poor', 'worst', 'fraud', 'misleading', 'cheap',
  'damaged', 'return', 'suspicious', 'knockoff', 'waste',
];

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
}

function analyzeReviewSentiment(reviews = []) {
  if (reviews.length === 0) {
    return {
      sentimentScore: 0.5,
      positiveRatio: 0,
      negativeRatio: 0,
      neutralRatio: 1,
      overallSentiment: 'neutral',
      positiveCount: 0,
      negativeCount: 0,
      neutralCount: 0,
    };
  }

  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  reviews.forEach((review) => {
    const tokens = tokenize(review.text);
    const positiveHits = tokens.filter((t) => POSITIVE_WORDS.includes(t)).length;
    const negativeHits = tokens.filter((t) => NEGATIVE_WORDS.includes(t)).length;

    const ratingBoost = review.rating >= 4 ? 1 : review.rating <= 2 ? -1 : 0;

    if (negativeHits > positiveHits || ratingBoost < 0) {
      negativeCount += 1;
    } else if (positiveHits > 0 || ratingBoost > 0) {
      positiveCount += 1;
    } else {
      neutralCount += 1;
    }
  });

  const total = reviews.length;
  const positiveRatio = positiveCount / total;
  const negativeRatio = negativeCount / total;
  const neutralRatio = neutralCount / total;
  const sentimentScore = Math.round(((positiveRatio - negativeRatio + 1) / 2) * 100) / 100;

  let overallSentiment = 'neutral';
  if (sentimentScore >= 0.65) overallSentiment = 'positive';
  else if (sentimentScore <= 0.35) overallSentiment = 'negative';

  return {
    sentimentScore,
    positiveRatio: Math.round(positiveRatio * 100) / 100,
    negativeRatio: Math.round(negativeRatio * 100) / 100,
    neutralRatio: Math.round(neutralRatio * 100) / 100,
    overallSentiment,
    positiveCount,
    negativeCount,
    neutralCount,
    hasPositiveVerifiedReviews: reviews.some((r) => r.verified && r.rating >= 4),
  };
}

module.exports = { analyzeReviewSentiment };
