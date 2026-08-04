const ProductCheck = require('../models/ProductCheck');
const AppError = require('../utils/AppError');

exports.getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [checks, total] = await Promise.all([
      ProductCheck.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductCheck.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      success: true,
      data: checks,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

exports.getCheckById = async (req, res, next) => {
  try {
    const check = await ProductCheck.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).lean();

    if (!check) throw new AppError('Product check not found', 404);

    res.json({ success: true, data: check });
  } catch (err) {
    next(err);
  }
};

exports.deleteCheck = async (req, res, next) => {
  try {
    const check = await ProductCheck.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!check) throw new AppError('Product check not found', 404);

    res.json({ success: true, message: 'Check deleted successfully' });
  } catch (err) {
    next(err);
  }
};
