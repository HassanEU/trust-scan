class BaseConnector {
  constructor(marketplace) {
    if (new.target === BaseConnector) {
      throw new Error('BaseConnector is abstract and cannot be instantiated directly');
    }
    this.marketplace = marketplace;
  }

  canHandle() {
    throw new Error('canHandle() must be implemented');
  }

  extractProductId() {
    throw new Error('extractProductId() must be implemented');
  }

  async getProductDetails() {
    throw new Error('getProductDetails() must be implemented');
  }

  async getSellerDetails() {
    throw new Error('getSellerDetails() must be implemented');
  }

  async getReviews() {
    throw new Error('getReviews() must be implemented');
  }

  async fetchAll(productUrl) {
    const [product, seller, reviews] = await Promise.all([
      this.getProductDetails(productUrl),
      this.getSellerDetails(productUrl),
      this.getReviews(productUrl),
    ]);

    return {
      productName: product.productName,
      brand: product.brand,
      seller: seller.sellerName || product.seller,
      price: product.price,
      originalPrice: product.originalPrice,
      rating: product.rating,
      reviewCount: product.reviewCount,
      imageUrl: product.imageUrl,
      productId: product.productId,
      reviews,
      sellerDetails: seller,
      marketplace: this.marketplace,
    };
  }

  normalizeResponse(data) {
    return {
      productName: data.productName || 'Unknown Product',
      seller: data.seller || 'Unknown Seller',
      price: data.price || 'N/A',
      rating: data.rating || '0',
      reviews: data.reviews || [],
    };
  }
}

module.exports = BaseConnector;
