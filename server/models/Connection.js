const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'blocked'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes to prevent duplicate connection requests and fast lookups
connectionSchema.index({ requester: 1, receiver: 1 }, { unique: true });
connectionSchema.index({ receiver: 1, status: 1 });
connectionSchema.index({ requester: 1, status: 1 });

module.exports = mongoose.model('Connection', connectionSchema);
