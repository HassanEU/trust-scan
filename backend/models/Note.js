const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    color: { type: String, default: '#fef3c7' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Note', noteSchema);
