const mongoose = require('mongoose');

const reviewReportSchema = new mongoose.Schema(
  {
    review: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reviewType: {
      type: String,
      enum: ['destination', 'hotel'],
      default: 'destination',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: ['Spam', 'Offensive', 'Fake', 'Other'],
      default: 'Spam',
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'dismissed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ReviewReport', reviewReportSchema);
