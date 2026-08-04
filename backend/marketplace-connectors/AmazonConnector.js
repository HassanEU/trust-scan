const BaseConnector = require('./BaseConnector');
const { MARKETPLACES } = require('../utils/constants');
const { generateProductProfile, generateReviews } = require('./mockDataHelper');

class AmazonConnector extends BaseConnector {
  constructor() {
    super(MARKETPLACES.AMAZON);
  }

  canHandle(url) {
    return /amazon\.(com|in|co\.uk|de|fr|ca|com\.au)/i.test(url) || /amzn\.to/i.test(url);
  }

  extractProductId(url) {
    const asinMatch = url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
    if (asinMatch) return asinMatch[1];
    const paramMatch = url.match(/[?&]asin=([A-Z0-9]{10})/i);
    return paramMatch ? paramMatch[1] : `AMZ-${Date.now()}`;
  }

  async getProductDetails(productUrl) {
    const profile = generateProductProfile(productUrl, this.marketplace);
    const productId = this.extractProductId(productUrl);

    return {
      productName: profile.productName,
      brand: profile.brand,
      seller: `Amazon Seller - ${profile.brand} Official${profile.isVerified ? ' (Verified)' : ''}`,
      price: `$${profile.price.toFixed(2)}`,
      originalPrice: `$${profile.originalPrice.toFixed(2)}`,
      rating: profile.productRating.toString(),
      reviewCount: profile.reviewCount,
      imageUrl: null,
      productId,
      currency: 'USD',
    };
  }

  async getSellerDetails(productUrl) {
    const profile = generateProductProfile(productUrl, this.marketplace);

    return {
      sellerName: `${profile.brand} Marketplace Store`,
      rating: profile.sellerRating,
      totalProducts: Math.floor(profile.seed % 500) + 10,
      accountAgeDays: profile.accountAgeDays,
      isVerified: profile.isVerified,
      isSuspicious: profile.isSuspicious,
      fulfillmentType: profile.isVerified ? 'FBA' : 'Merchant',
      returnPolicy: '30-day return policy',
    };
  }

  async getReviews(productUrl) {
    const profile = generateProductProfile(productUrl, this.marketplace);
    return generateReviews(profile, this.marketplace);
  }
}

module.exports = AmazonConnector;
