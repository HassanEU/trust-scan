function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function findRepeatedSentences(reviews) {
  const sentenceCounts = {};
  let repeatedCount = 0;

  reviews.forEach((review) => {
    const sentences = review.text.split(/[.!?]+/).map((s) => normalizeText(s)).filter(Boolean);
    sentences.forEach((sentence) => {
      if (sentence.length < 10) return;
      sentenceCounts[sentence] = (sentenceCounts[sentence] || 0) + 1;
      if (sentenceCounts[sentence] === 2) repeatedCount += 1;
    });
  });

  return { repeatedCount, threshold: 2 };
}

function findSimilarReviews(reviews) {
  const textMap = {};
  let similarPairs = 0;

  reviews.forEach((review) => {
    const normalized = normalizeText(review.text);
    const key = normalized.slice(0, 40);
    if (textMap[key]) similarPairs += 1;
    textMap[key] = (textMap[key] || 0) + 1;
  });

  const similarityRatio = reviews.length > 0 ? similarPairs / reviews.length : 0;
  return { similarPairs, similarityRatio, threshold: 0.3 };
}

function detectUnnaturalLanguage(reviews) {
  let unnaturalCount = 0;

  const patterns = [
    /!{2,}/,
    /(.)\1{3,}/i,
    /\b(best|amazing|perfect|wow|incredible)\b.*\b(best|amazing|perfect|wow|incredible)\b/i,
    /^[A-Z\s!]+$/,
    /\b(buy now|five stars|a\+{2,})\b/i,
  ];

  reviews.forEach((review) => {
    if (patterns.some((pattern) => pattern.test(review.text))) {
      unnaturalCount += 1;
    }
  });

  const unnaturalRatio = reviews.length > 0 ? unnaturalCount / reviews.length : 0;
  return { unnaturalCount, unnaturalRatio, threshold: 0.25 };
}

function detectReviewSpikes(reviews) {
  const dateCounts = {};

  reviews.forEach((review) => {
    const dateKey = new Date(review.date).toISOString().split('T')[0];
    dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
  });

  const counts = Object.values(dateCounts);
  const maxDaily = counts.length > 0 ? Math.max(...counts) : 0;
  const avgDaily = counts.length > 0 ? counts.reduce((a, b) => a + b, 0) / counts.length : 0;
  const hasSpike = maxDaily > avgDaily * 3 && maxDaily >= 5;

  return { maxDaily, avgDaily: Math.round(avgDaily * 10) / 10, hasSpike };
}

function detectFakeReviews(reviews = []) {
  if (reviews.length === 0) {
    return {
      fakeReviewScore: 0,
      isFakeDetected: false,
      flags: [],
      confidence: 0,
    };
  }

  const repeated = findRepeatedSentences(reviews);
  const similar = findSimilarReviews(reviews);
  const unnatural = detectUnnaturalLanguage(reviews);
  const spikes = detectReviewSpikes(reviews);

  const flags = [];
  let fakeReviewScore = 0;

  if (repeated.repeatedCount >= repeated.threshold) {
    flags.push('Repeated sentences detected across multiple reviews');
    fakeReviewScore += 25;
  }

  if (similar.similarityRatio >= similar.threshold) {
    flags.push('Too many similar reviews with near-identical content');
    fakeReviewScore += 30;
  }

  if (unnatural.unnaturalRatio >= unnatural.threshold) {
    flags.push('Unnatural language patterns found in reviews');
    fakeReviewScore += 25;
  }

  if (spikes.hasSpike) {
    flags.push(`Sudden review spike detected (${spikes.maxDaily} reviews in a single day)`);
    fakeReviewScore += 20;
  }

  const unverifiedHighRating = reviews.filter((r) => r.rating >= 5 && !r.verified).length;
  const unverifiedRatio = unverifiedHighRating / reviews.length;
  if (unverifiedRatio > 0.5) {
    flags.push('High proportion of unverified 5-star reviews');
    fakeReviewScore += 15;
  }

  fakeReviewScore = Math.min(100, fakeReviewScore);

  return {
    fakeReviewScore,
    isFakeDetected: fakeReviewScore >= 40,
    flags,
    confidence: fakeReviewScore / 100,
    details: { repeated, similar, unnatural, spikes },
  };
}

module.exports = { detectFakeReviews };
