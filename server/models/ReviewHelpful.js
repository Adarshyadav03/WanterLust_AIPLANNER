const mongoose = require('mongoose');

const reviewHelpfulSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    review: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reviewType: {
      type: String,
      enum: ['destination', 'hotel'],
      default: 'destination',
    },
  },
  {
    timestamps: true,
  }
);

reviewHelpfulSchema.index({ user: 1, review: 1 }, { unique: true });

module.exports = mongoose.model('ReviewHelpful', reviewHelpfulSchema);
