const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    duration: { type: Number, default: 25 },
    completed: { type: Boolean, default: true },
    date: { type: String, required: true },
    type: { type: String, enum: ['study', 'break'], default: 'study' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FocusSession', focusSessionSchema);
