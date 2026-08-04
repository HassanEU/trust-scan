const BaseConnector = require('./BaseConnector');
const { MARKETPLACES } = require('../utils/constants');
const { generateProductProfile, generateReviews } = require('./mockDataHelper');

class ShopifyConnector extends BaseConnector {
  constructor() {
    super(MARKETPLACES.SHOPIFY);
  }

  canHandle(url) {
    return /\.myshopify\.com/i.test(url) || /shopify/i.test(url);
  }

  extractProductId(url) {
    try {
      const parsed = new URL(url);
      const segments = parsed.pathname.split('/').filter(Boolean);
      const productsIndex = segments.indexOf('products');
      if (productsIndex !== -1 && segments[productsIndex + 1]) {
        return segments[productsIndex + 1];
      }
      return `SHOP-${parsed.hostname.split('.')[0]}`;
    } catch {
      return `SHOP-${Date.now()}`;
    }
  }

  extractStoreName(url) {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace('.myshopify.com', '').replace('www.', '');
    } catch {
      return 'independent-store';
    }
  }

  async getProductDetails(productUrl) {
    const profile = generateProductProfile(productUrl, this.marketplace);
    const productId = this.extractProductId(productUrl);
    const storeName = this.extractStoreName(productUrl);

    return {
      productName: profile.productName,
      brand: profile.brand,
      seller: `${storeName} Official Store`,
      price: `$${profile.price.toFixed(2)}`,
      originalPrice: `$${profile.originalPrice.toFixed(2)}`,
      rating: profile.productRating.toString(),
      reviewCount: profile.reviewCount,
      imageUrl: null,
      productId,
      currency: 'USD',
      storeUrl: productUrl,
    };
  }

  async getSellerDetails(productUrl) {
    const profile = generateProductProfile(productUrl, this.marketplace);
    const storeName = this.extractStoreName(productUrl);

    return {
      sellerName: `${storeName} Store`,
      rating: profile.sellerRating,
      totalProducts: Math.floor(profile.seed % 80) + 3,
      accountAgeDays: profile.accountAgeDays,
      isVerified: profile.isVerified,
      isSuspicious: profile.isSuspicious,
      fulfillmentType: 'Direct from Store',
      returnPolicy: 'Store-specific return policy',
      platform: 'Shopify',
    };
  }

  async getReviews(productUrl) {
    const profile = generateProductProfile(productUrl, this.marketplace);
    return generateReviews(profile, this.marketplace);
  }
}

module.exports = ShopifyConnector;
