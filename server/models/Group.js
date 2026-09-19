const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    pendingInvites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    inviteCode: {
      type: String,
      unique: true,
      required: true,
    },
    inviteEnabled: {
      type: Boolean,
      default: true,
    },
    privacy: {
      type: String,
      enum: ['private', 'public'],
      default: 'private',
    },
    joinRequests: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending',
        },
      },
    ],
    travelDates: {
      type: String,
      default: 'Dec 12 - Dec 18, 2026',
    },
    budget: {
      type: Number,
      default: 25000,
    },
    maxMembers: {
      type: Number,
      default: 10,
    },
    groupImage: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: 'Group trip planned with WanderLust.',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Group', groupSchema);
