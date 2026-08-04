const { MARKETPLACES } = require('../utils/constants');

const MARKETPLACE_PATTERNS = [
  { marketplace: MARKETPLACES.AMAZON, patterns: [/amazon\.(com|in|co\.uk|de|fr|ca|com\.au)/i, /amzn\.to/i] },
  { marketplace: MARKETPLACES.FLIPKART, patterns: [/flipkart\.com/i] },
  { marketplace: MARKETPLACES.EBAY, patterns: [/ebay\.(com|co\.uk|de|in)/i] },
  { marketplace: MARKETPLACES.SHOPIFY, patterns: [/\.myshopify\.com/i, /shopify/i] },
];

function detectMarketplace(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    for (const { marketplace, patterns } of MARKETPLACE_PATTERNS) {
      if (patterns.some((pattern) => pattern.test(host) || pattern.test(url))) {
        return marketplace;
      }
    }

    if (host.includes('shop') || host.includes('store')) {
      return MARKETPLACES.SHOPIFY;
    }

    return MARKETPLACES.UNKNOWN;
  } catch {
    return MARKETPLACES.UNKNOWN;
  }
}

module.exports = { detectMarketplace, MARKETPLACE_PATTERNS };
