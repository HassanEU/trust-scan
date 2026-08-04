const express = require('express');
const { body } = require('express-validator');
const { analyze } = require('../controllers/analyzeController');
const { optionalAuth } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.post(
  '/',
  optionalAuth,
  [
    body('productUrl')
      .trim()
      .notEmpty()
      .withMessage('Product URL is required')
      .isURL({ protocols: ['http', 'https'], require_protocol: true })
      .withMessage('Must be a valid HTTP/HTTPS URL'),
  ],
  validate,
  analyze
);

module.exports = router;
