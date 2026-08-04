const AmazonConnector = require('./AmazonConnector');
const FlipkartConnector = require('./FlipkartConnector');
const EbayConnector = require('./EbayConnector');
const ShopifyConnector = require('./ShopifyConnector');
const { detectMarketplace } = require('./marketplaceDetector');
const { MARKETPLACES } = require('../utils/constants');
const AppError = require('../utils/AppError');

const connectors = [
  new AmazonConnector(),
  new FlipkartConnector(),
  new EbayConnector(),
  new ShopifyConnector(),
];

function getConnector(url) {
  const detected = detectMarketplace(url);

  const connector = connectors.find((c) => c.canHandle(url));
  if (connector) return connector;

  if (detected === MARKETPLACES.SHOPIFY) return new ShopifyConnector();

  throw new AppError(
    `Unsupported marketplace. Supported: Amazon, Flipkart, eBay, Shopify. Detected: ${detected}`,
    400
  );
}

async function fetchProductData(productUrl) {
  const connector = getConnector(productUrl);
  return connector.fetchAll(productUrl);
}

module.exports = {
  connectors,
  getConnector,
  fetchProductData,
  detectMarketplace,
};
