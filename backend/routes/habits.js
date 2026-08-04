const express = require('express');
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');
const { todayStr, yesterdayStr, awardPoints } = require('../utils/helpers');

const router = express.Router();
router.use(auth);

const DEFAULT_HABITS = [
  { name: 'Wake up early', icon: '🌅' },
  { name: 'Exercise', icon: '💪' },
  { name: 'Study daily', icon: '📖' },
  { name: 'Read', icon: '📕' },
  { name: 'Sleep on time', icon: '😴' },
];

router.get('/', async (req, res) => {
  try {
    let habits = await Habit.find({ user: req.user._id }).sort({ createdAt: 1 });
    if (habits.length === 0) {
      habits = await Habit.insertMany(
        DEFAULT_HABITS.map((h) => ({ ...h, user: req.user._id }))
      );
    }
    const today = todayStr();
    const enriched = habits.map((h) => ({
      ...h.toObject(),
      doneToday: h.completions.includes(today),
    }));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name) return res.status(400).json({ message: 'Habit name is required' });
    const habit = await Habit.create({ user: req.user._id, name, icon: icon || '✅' });
    res.status(201).json(habit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/toggle', async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const today = todayStr();
    const yesterday = yesterdayStr();
    const idx = habit.completions.indexOf(today);

    if (idx >= 0) {
      habit.completions.splice(idx, 1);
      habit.streak = Math.max(0, habit.streak - 1);
    } else {
      habit.completions.push(today);
      const lastDone = habit.completions
        .filter((d) => d !== today)
        .sort()
        .pop();
      if (lastDone === yesterday || habit.streak === 0) {
        habit.streak += 1;
      } else {
        habit.streak = 1;
      }
      if (habit.streak > habit.bestStreak) habit.bestStreak = habit.streak;

      const user = await require('../models/User').findById(req.user._id);
      await awardPoints(user, 8);
    }

    await habit.save();
    res.json({ ...habit.toObject(), doneToday: habit.completions.includes(today) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Habit.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Habit deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
