const { analyzeProduct } = require('../services/analysisService');
const ProductCheck = require('../models/ProductCheck');

exports.analyze = async (req, res, next) => {
  try {
    const { productUrl } = req.body;
    const result = await analyzeProduct(productUrl);

    if (req.user) {
      await ProductCheck.create({
        user: req.user._id,
        productUrl: result.productUrl,
        productName: result.productName,
        brand: result.brand,
        sellerName: result.sellerName,
        sellerRating: result.sellerRating,
        marketplace: result.marketplace,
        price: result.price,
        trustScore: result.trustScore,
        riskLevel: result.riskLevel,
        reasons: result.reasons,
        recommendation: result.recommendation,
        analysisDetails: result.analysisDetails,
      });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
