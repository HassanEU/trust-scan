const express = require('express');
const FocusSession = require('../models/FocusSession');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { todayStr, awardPoints, updateStreak } = require('../utils/helpers');

const router = express.Router();
router.use(auth);

router.get('/sessions', async (req, res) => {
  try {
    const sessions = await FocusSession.find({ user: req.user._id, type: 'study' })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/sessions', async (req, res) => {
  try {
    const { duration, type } = req.body;
    const session = await FocusSession.create({
      user: req.user._id,
      duration: duration || 25,
      type: type || 'study',
      date: todayStr(),
    });

    if (session.type === 'study') {
      const user = await User.findById(req.user._id);
      user.totalFocusSessions += 1;
      await awardPoints(user, 20);
      await updateStreak(user);
    }

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/today-count', async (req, res) => {
  try {
    const count = await FocusSession.countDocuments({
      user: req.user._id,
      type: 'study',
      date: todayStr(),
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
