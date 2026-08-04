const BaseConnector = require('./BaseConnector');
const { MARKETPLACES } = require('../utils/constants');
const { generateProductProfile, generateReviews } = require('./mockDataHelper');

class EbayConnector extends BaseConnector {
  constructor() {
    super(MARKETPLACES.EBAY);
  }

  canHandle(url) {
    return /ebay\.(com|co\.uk|de|in)/i.test(url);
  }

  extractProductId(url) {
    const itemMatch = url.match(/\/itm\/(\d+)/i);
    return itemMatch ? itemMatch[1] : `EBAY-${Date.now()}`;
  }

  async getProductDetails(productUrl) {
    const profile = generateProductProfile(productUrl, this.marketplace);
    const productId = this.extractProductId(productUrl);

    return {
      productName: profile.productName,
      brand: profile.brand,
      seller: `eBay Seller - ${profile.brand}_deals`,
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
      sellerName: `${profile.brand.toLowerCase()}_premium_deals`,
      rating: profile.sellerRating,
      totalProducts: Math.floor(profile.seed % 150) + 1,
      accountAgeDays: profile.accountAgeDays,
      isVerified: profile.isVerified,
      isSuspicious: profile.isSuspicious,
      fulfillmentType: profile.isVerified ? 'Top Rated Seller' : 'Standard',
      returnPolicy: '14-day returns accepted',
      feedbackScore: Math.floor(profile.seed % 5000) + 100,
    };
  }

  async getReviews(productUrl) {
    const profile = generateProductProfile(productUrl, this.marketplace);
    return generateReviews(profile, this.marketplace);
  }
}

module.exports = EbayConnector;
