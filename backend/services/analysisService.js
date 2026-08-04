const { fetchProductData } = require('../marketplace-connectors');
const { analyzeWithAI } = require('../ai-engine');
const { calculateTrustScore } = require('./trustScoreService');
const Seller = require('../models/Seller');
const AppError = require('../utils/AppError');

async function upsertSeller(sellerDetails, marketplace, trustScore) {
  try {
    const seller = await Seller.findOneAndUpdate(
      { sellerName: sellerDetails.sellerName, marketplace },
      {
        $set: {
          rating: sellerDetails.rating,
          totalProducts: sellerDetails.totalProducts,
          trustScore,
          isVerified: sellerDetails.isVerified,
          isSuspicious: sellerDetails.isSuspicious,
          accountAgeDays: sellerDetails.accountAgeDays,
          status: sellerDetails.isSuspicious ? 'flagged' : 'active',
        },
        $push: {
          history: {
            event: 'product_analyzed',
            trustScore,
            note: `Trust score updated after product analysis`,
            date: new Date(),
          },
        },
      },
      { upsert: true, new: true }
    );
    return seller;
  } catch {
    return null;
  }
}

async function analyzeProduct(productUrl) {
  if (!productUrl || typeof productUrl !== 'string') {
    throw new AppError('Product URL is required', 400);
  }

  let productData;
  try {
    productData = await fetchProductData(productUrl);
  } catch (err) {
    if (err.isOperational) throw err;
    throw new AppError(`Failed to fetch product data: ${err.message}`, 502);
  }

  const { fakeReviewAnalysis, sentimentAnalysis } = await analyzeWithAI({
    reviews: productData.reviews,
    sellerDetails: productData.sellerDetails,
    trustScore: 50,
    riskLevel: 'Moderate Risk',
    reasons: [],
  });

  const { trustScore, riskLevel, reasons } = calculateTrustScore({
    sellerDetails: productData.sellerDetails,
    productData,
    fakeReviewAnalysis,
    sentimentAnalysis,
  });

  const { riskExplanation } = await analyzeWithAI({
    reviews: productData.reviews,
    sellerDetails: productData.sellerDetails,
    trustScore,
    riskLevel,
    reasons,
  });

  await upsertSeller(productData.sellerDetails, productData.marketplace, trustScore);

  return {
    productName: productData.productName,
    brand: productData.brand,
    sellerName: productData.sellerDetails.sellerName,
    sellerRating: productData.sellerDetails.rating,
    marketplace: productData.marketplace,
    price: productData.price,
    trustScore,
    riskLevel,
    reasons,
    recommendation: riskExplanation.recommendation,
    analysisDetails: {
      fakeReviewScore: fakeReviewAnalysis.fakeReviewScore,
      sentimentScore: sentimentAnalysis.sentimentScore,
      priceAnalysis: productData.originalPrice
        ? `Listed at ${productData.price} (MSRP: ${productData.originalPrice})`
        : `Listed at ${productData.price}`,
      sellerAnalysis: riskExplanation.summary,
      fakeReviewFlags: fakeReviewAnalysis.flags,
      sentiment: sentimentAnalysis.overallSentiment,
      reviewCount: productData.reviews.length,
    },
    productUrl,
  };
}

module.exports = { analyzeProduct };
