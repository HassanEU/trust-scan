const express = require('express');
const Task = require('../models/Task');
const StudySession = require('../models/StudySession');
const FocusSession = require('../models/FocusSession');
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');
const { getDateRange, todayStr } = require('../utils/helpers');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const weekDates = getDateRange('week');
    const monthDates = getDateRange('month');

    const [weekStudy, monthStudy, weekTasks, habits, weekFocus] = await Promise.all([
      StudySession.find({ user: userId, date: { $in: weekDates } }),
      StudySession.find({ user: userId, date: { $in: monthDates } }),
      Task.find({ user: userId, date: { $in: weekDates } }),
      Habit.find({ user: userId }),
      FocusSession.find({ user: userId, date: { $in: weekDates }, type: 'study' }),
    ]);

    const studyTrend = weekDates.map((d) => ({
      date: d,
      minutes: weekStudy.filter((s) => s.date === d).reduce((a, s) => a + s.minutes, 0),
    }));

    const taskTrend = weekDates.map((d) => {
      const dayTasks = weekTasks.filter((t) => t.date === d);
      return {
        date: d,
        completed: dayTasks.filter((t) => t.completed).length,
        total: dayTasks.length,
      };
    });

    const focusTrend = weekDates.map((d) => ({
      date: d,
      sessions: weekFocus.filter((f) => f.date === d).length,
    }));

    const subjectBreakdown = {};
    monthStudy.forEach((s) => {
      subjectBreakdown[s.subjectName] = (subjectBreakdown[s.subjectName] || 0) + s.minutes;
    });

    const habitConsistency = habits.map((h) => {
      const weekDone = weekDates.filter((d) => h.completions.includes(d)).length;
      return { name: h.name, icon: h.icon, weekDone, streak: h.streak };
    });

    const suggestions = [];
    const todayStudy = weekStudy.filter((s) => s.date === todayStr()).reduce((a, s) => a + s.minutes, 0);
    const todayTasks = weekTasks.filter((t) => t.date === todayStr());
    const todayCompleted = todayTasks.filter((t) => t.completed).length;

    if (todayStudy < 60) suggestions.push('Try to study at least 1 hour today for better consistency.');
    if (todayCompleted < todayTasks.length && todayTasks.length > 0) {
      suggestions.push('You have pending tasks — finish them before the day ends!');
    }
    const weakSubject = Object.entries(subjectBreakdown).sort((a, b) => a[1] - b[1])[0];
    if (weakSubject && weakSubject[1] < 60) {
      suggestions.push(`Spend more time on "${weakSubject[0]}" — it needs attention.`);
    }
    const lowHabits = habitConsistency.filter((h) => h.weekDone < 3);
    if (lowHabits.length > 0) {
      suggestions.push(`Build consistency in: ${lowHabits.map((h) => h.name).join(', ')}.`);
    }
    if (suggestions.length === 0) {
      suggestions.push('Great work! Keep maintaining your current routine.');
    }

    res.json({
      studyTrend,
      taskTrend,
      focusTrend,
      subjectBreakdown: Object.entries(subjectBreakdown).map(([name, minutes]) => ({ name, minutes })),
      habitConsistency,
      suggestions,
      summary: {
        weekStudyMinutes: weekStudy.reduce((a, s) => a + s.minutes, 0),
        weekTasksCompleted: weekTasks.filter((t) => t.completed).length,
        weekFocusSessions: weekFocus.length,
        monthStudyMinutes: monthStudy.reduce((a, s) => a + s.minutes, 0),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
