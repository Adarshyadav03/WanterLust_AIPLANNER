const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  time: { type: String, required: true },
  activity: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, default: '' },
  estimatedCost: { type: Number, default: 0 },
  travelTime: { type: String, default: '' },
});

const daySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  activities: [activitySchema],
});

const tripSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tripTitle: {
      type: String,
      required: true,
    },
    startingCity: {
      type: String,
      default: 'Mumbai',
    },
    destination: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: () => new Date(+new Date() + 5 * 24 * 60 * 60 * 1000),
    },
    travelersCount: {
      type: Number,
      default: 2,
    },
    budget: {
      type: Number,
      required: true,
    },
    travelStyle: {
      type: String,
      default: 'Adventure',
    },
    foodPreference: {
      type: String,
      default: 'Vegetarian',
    },
    interests: [String],
    itinerary: [daySchema],
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed'],
      default: 'Upcoming',
    },
    inviteCode: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Trip', tripSchema);
