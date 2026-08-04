const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const { todayStr, awardPoints, updateStreak } = require('../utils/helpers');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    const filter = { user: req.user._id };
    if (date) filter.date = date;
    const tasks = await Task.find(filter).sort({ completed: 1, priority: 1, createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, priority, deadline, reminder, date } = req.body;
    if (!title) return res.status(400).json({ message: 'Task title is required' });
    const task = await Task.create({
      user: req.user._id,
      title,
      description: description || '',
      priority: priority || 'Medium',
      deadline: deadline || null,
      reminder: reminder || null,
      date: date || todayStr(),
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const fields = ['title', 'description', 'priority', 'deadline', 'reminder', 'completed', 'date'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) task[f] = req.body[f];
    });
    if (req.body.completed === true && !task.completedAt) {
      task.completedAt = new Date();
    }
    if (req.body.completed === false) task.completedAt = null;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/toggle', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const wasCompleted = task.completed;
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    await task.save();

    if (task.completed && !wasCompleted) {
      const user = await require('../models/User').findById(req.user._id);
      user.totalTasksCompleted += 1;
      const points = task.priority === 'High' ? 15 : task.priority === 'Medium' ? 10 : 5;
      await awardPoints(user, points);
      await updateStreak(user);
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
