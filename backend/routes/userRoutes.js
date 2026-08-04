const express = require('express');
const { getHistory, getCheckById, deleteCheck } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/history', getHistory);
router.get('/history/:id', getCheckById);
router.delete('/history/:id', deleteCheck);

module.exports = router;
