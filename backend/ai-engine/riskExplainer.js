function generateRiskExplanation({ trustScore, riskLevel, reasons, fakeReviewAnalysis, sentimentAnalysis, sellerDetails }) {
  const sections = [];

  if (trustScore >= 80) {
    sections.push('This product appears to be from a reputable seller with strong trust indicators.');
  } else if (trustScore >= 50) {
    sections.push('This product shows mixed trust signals. Exercise caution before purchasing.');
  } else {
    sections.push('Multiple red flags detected. This product carries significant authenticity risk.');
  }

  if (fakeReviewAnalysis.isFakeDetected) {
    sections.push(
      `Review analysis flagged potential manipulation (confidence: ${Math.round(fakeReviewAnalysis.confidence * 100)}%).`
    );
  } else if (fakeReviewAnalysis.fakeReviewScore > 20) {
    sections.push('Some review patterns appear unusual but not conclusively fraudulent.');
  } else {
    sections.push('Review patterns appear natural with no major manipulation detected.');
  }

  if (sentimentAnalysis.overallSentiment === 'positive') {
    sections.push(`Customer sentiment is predominantly positive (${Math.round(sentimentAnalysis.positiveRatio * 100)}% positive reviews).`);
  } else if (sentimentAnalysis.overallSentiment === 'negative') {
    sections.push(`Customer sentiment trends negative (${Math.round(sentimentAnalysis.negativeRatio * 100)}% negative reviews).`);
  }

  if (sellerDetails.isVerified) {
    sections.push('Seller is verified on the marketplace platform.');
  }

  if (sellerDetails.isSuspicious) {
    sections.push('Seller has been flagged for suspicious activity patterns.');
  }

  if (sellerDetails.accountAgeDays < 90) {
    sections.push(`Seller account is relatively new (${sellerDetails.accountAgeDays} days old).`);
  } else if (sellerDetails.accountAgeDays > 365) {
    sections.push(`Seller has an established presence (${Math.floor(sellerDetails.accountAgeDays / 365)}+ years).`);
  }

  let recommendation;
  if (trustScore >= 80) {
    recommendation = 'Safe to purchase. Product and seller show strong authenticity indicators.';
  } else if (trustScore >= 50) {
    recommendation = 'Proceed with caution. Verify seller credentials and compare prices across platforms.';
  } else {
    recommendation = 'Not recommended. Consider purchasing from an authorized retailer or verified seller.';
  }

  return {
    summary: sections.join(' '),
    recommendation,
    riskLevel,
    topConcerns: reasons.filter((r) => r.startsWith('⚠') || r.includes('Suspicious') || r.includes('Fake')),
    topStrengths: reasons.filter((r) => r.startsWith('✓')),
  };
}

module.exports = { generateRiskExplanation };
