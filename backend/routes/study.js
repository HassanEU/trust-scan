const express = require('express');
const StudySession = require('../models/StudySession');
const Subject = require('../models/Subject');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { todayStr, awardPoints, updateStreak, getDateRange } = require('../utils/helpers');

const router = express.Router();
router.use(auth);

router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user._id }).sort({ name: 1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/subjects', async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ message: 'Subject name is required' });
    const subject = await Subject.create({ user: req.user._id, name, color });
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/subjects/:id', async (req, res) => {
  try {
    await Subject.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/sessions', async (req, res) => {
  try {
    const { period } = req.query;
    let filter = { user: req.user._id };
    if (period) {
      const dates = getDateRange(period);
      filter.date = { $in: dates };
    }
    const sessions = await StudySession.find(filter).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/sessions', async (req, res) => {
  try {
    const { subjectId, subjectName, minutes, date, notes } = req.body;
    if (!minutes || minutes < 1) return res.status(400).json({ message: 'Study time is required' });

    let subject = null;
    let name = subjectName || 'General';
    if (subjectId) {
      subject = await Subject.findOne({ _id: subjectId, user: req.user._id });
      if (subject) {
        name = subject.name;
        subject.totalMinutes += minutes;
        await subject.save();
      }
    }

    const session = await StudySession.create({
      user: req.user._id,
      subject: subject?._id || null,
      subjectName: name,
      minutes,
      date: date || todayStr(),
      notes: notes || '',
    });

    const user = await User.findById(req.user._id);
    user.totalStudyMinutes += minutes;
    const points = Math.min(Math.floor(minutes / 10) * 5, 30);
    await awardPoints(user, points);
    await updateStreak(user);

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const dates = getDateRange(period);
    const sessions = await StudySession.find({
      user: req.user._id,
      date: { $in: dates },
    });

    const daily = {};
    dates.forEach((d) => (daily[d] = 0));
    const bySubject = {};

    sessions.forEach((s) => {
      daily[s.date] = (daily[s.date] || 0) + s.minutes;
      bySubject[s.subjectName] = (bySubject[s.subjectName] || 0) + s.minutes;
    });

    const total = sessions.reduce((sum, s) => sum + s.minutes, 0);
    res.json({
      period,
      totalMinutes: total,
      totalHours: Math.round((total / 60) * 10) / 10,
      daily: dates.map((d) => ({ date: d, minutes: daily[d] || 0 })),
      bySubject: Object.entries(bySubject).map(([name, minutes]) => ({ name, minutes })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
