const BADGES = [
  { id: 'first_task', name: 'First Step', description: 'Complete your first task', icon: '🎯', threshold: (u) => u.totalTasksCompleted >= 1 },
  { id: 'task_master', name: 'Task Master', description: 'Complete 10 tasks', icon: '🏆', threshold: (u) => u.totalTasksCompleted >= 10 },
  { id: 'study_starter', name: 'Study Starter', description: 'Log 60 minutes of study', icon: '📚', threshold: (u) => u.totalStudyMinutes >= 60 },
  { id: 'focus_hero', name: 'Focus Hero', description: 'Complete 5 focus sessions', icon: '🧠', threshold: (u) => u.totalFocusSessions >= 5 },
  { id: 'streak_3', name: '3-Day Streak', description: 'Stay active 3 days in a row', icon: '🔥', threshold: (u) => u.streak >= 3 },
  { id: 'streak_7', name: 'Week Warrior', description: 'Stay active 7 days in a row', icon: '⚡', threshold: (u) => u.streak >= 7 },
  { id: 'point_collector', name: 'Point Collector', description: 'Earn 100 points', icon: '⭐', threshold: (u) => u.points >= 100 },
  { id: 'discipline_pro', name: 'Discipline Pro', description: 'Earn 500 points', icon: '💎', threshold: (u) => u.points >= 500 },
];

const MOTIVATIONAL_MESSAGES = [
  'Small steps every day lead to big results!',
  'You are closer to your goals than yesterday.',
  'Discipline is choosing what you want most over what you want now.',
  'Focus on progress, not perfection.',
  'Your future self will thank you for today.',
  'Consistency beats intensity every time.',
  'One focused hour beats three distracted ones.',
  'You have got this — keep going!',
  'Every expert was once a beginner who did not quit.',
  'Today is a great day to get better.',
];

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function randomMessage() {
  return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
}

async function updateStreak(user) {
  const today = todayStr();
  const yesterday = yesterdayStr();
  if (user.lastActiveDate === today) return user;
  if (user.lastActiveDate === yesterday) {
    user.streak += 1;
  } else {
    user.streak = 1;
  }
  user.lastActiveDate = today;
  await user.save();
  return user;
}

async function awardPoints(user, points) {
  user.points += points;
  await checkBadges(user);
  await user.save();
  return user;
}

async function checkBadges(user) {
  const earned = new Set(user.badges || []);
  for (const badge of BADGES) {
    if (!earned.has(badge.id) && badge.threshold(user)) {
      earned.add(badge.id);
      user.points += 25;
    }
  }
  user.badges = [...earned];
}

function getBadgeInfo(badgeId) {
  return BADGES.find((b) => b.id === badgeId);
}

function getAllBadges() {
  return BADGES;
}

function getDateRange(period) {
  const end = new Date();
  const start = new Date();
  if (period === 'week') start.setDate(start.getDate() - 6);
  else if (period === 'month') start.setDate(start.getDate() - 29);
  else start.setHours(0, 0, 0, 0);
  const dates = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

module.exports = {
  todayStr,
  yesterdayStr,
  randomMessage,
  updateStreak,
  awardPoints,
  checkBadges,
  getBadgeInfo,
  getAllBadges,
  getDateRange,
  MOTIVATIONAL_MESSAGES,
};
