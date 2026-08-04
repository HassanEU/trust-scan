const express = require('express');
const Task = require('../models/Task');
const StudySession = require('../models/StudySession');
const FocusSession = require('../models/FocusSession');
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');
const { todayStr, randomMessage, getAllBadges, getBadgeInfo } = require('../utils/helpers');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const today = todayStr();
    const userId = req.user._id;

    const [tasks, studySessions, focusCount, habits] = await Promise.all([
      Task.find({ user: userId, date: today }),
      StudySession.find({ user: userId, date: today }),
      FocusSession.countDocuments({ user: userId, date: today, type: 'study' }),
      Habit.find({ user: userId }),
    ]);

    const completed = tasks.filter((t) => t.completed).length;
    const pending = tasks.length - completed;
    const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

    const studyMinutes = studySessions.reduce((s, x) => s + x.minutes, 0);
    const habitsDone = habits.filter((h) => h.completions.includes(today)).length;
    const habitTotal = habits.length || 1;

    const focusScore = Math.min(
      100,
      Math.round(
        progress * 0.4 +
          Math.min(studyMinutes / 120, 1) * 30 +
          Math.min(focusCount / 4, 1) * 20 +
          (habitsDone / habitTotal) * 10
      )
    );

    const badges = (req.user.badges || []).map((id) => {
      const info = getBadgeInfo(id);
      return info ? { id, ...info } : { id, name: id, icon: '🏅' };
    });

    const allBadges = getAllBadges().map((b) => ({
      ...b,
      earned: (req.user.badges || []).includes(b.id),
    }));

    res.json({
      greeting: `Hello, ${req.user.name.split(' ')[0]}!`,
      message: randomMessage(),
      today,
      tasks: tasks.slice(0, 8),
      stats: {
        progress,
        focusScore,
        studyMinutes,
        studyHours: Math.round((studyMinutes / 60) * 10) / 10,
        completed,
        pending,
        totalTasks: tasks.length,
        focusSessionsToday: focusCount,
        habitsDone,
        habitTotal,
      },
      user: {
        points: req.user.points,
        streak: req.user.streak,
        badges,
        totalStudyMinutes: req.user.totalStudyMinutes,
        totalFocusSessions: req.user.totalFocusSessions,
        totalTasksCompleted: req.user.totalTasksCompleted,
      },
      allBadges,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
