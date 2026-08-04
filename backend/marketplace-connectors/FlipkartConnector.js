const BaseConnector = require('./BaseConnector');
const { MARKETPLACES } = require('../utils/constants');
const { generateProductProfile, generateReviews } = require('./mockDataHelper');

class FlipkartConnector extends BaseConnector {
  constructor() {
    super(MARKETPLACES.FLIPKART);
  }

  canHandle(url) {
    return /flipkart\.com/i.test(url);
  }

  extractProductId(url) {
    const pidMatch = url.match(/pid=([A-Z0-9]+)/i);
    if (pidMatch) return pidMatch[1];
    const pathMatch = url.match(/\/p\/itm[a-z0-9]+/i);
    return pathMatch ? pathMatch[0].split('/').pop() : `FK-${Date.now()}`;
  }

  async getProductDetails(productUrl) {
    const profile = generateProductProfile(productUrl, this.marketplace);
    const productId = this.extractProductId(productUrl);

    return {
      productName: profile.productName,
      brand: profile.brand,
      seller: `Flipkart Assured - ${profile.brand} Retail`,
      price: `₹${profile.price.toLocaleString('en-IN')}`,
      originalPrice: `₹${profile.originalPrice.toLocaleString('en-IN')}`,
      rating: profile.productRating.toString(),
      reviewCount: profile.reviewCount,
      imageUrl: null,
      productId,
      currency: 'INR',
    };
  }

  async getSellerDetails(productUrl) {
    const profile = generateProductProfile(productUrl, this.marketplace);

    return {
      sellerName: `${profile.brand} India Pvt Ltd`,
      rating: profile.sellerRating,
      totalProducts: Math.floor(profile.seed % 300) + 5,
      accountAgeDays: profile.accountAgeDays,
      isVerified: profile.isVerified,
      isSuspicious: profile.isSuspicious,
      fulfillmentType: 'Flipkart Assured',
      returnPolicy: '7-day replacement policy',
    };
  }

  async getReviews(productUrl) {
    const profile = generateProductProfile(productUrl, this.marketplace);
    return generateReviews(profile, this.marketplace);
  }
}

module.exports = FlipkartConnector;
