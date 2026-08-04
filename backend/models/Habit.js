const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: '✅' },
    streak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    completions: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Habit', habitSchema);
