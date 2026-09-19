const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    category: {
      type: String,
      required: true,
      enum: ['Mountains', 'Beaches', 'Heritage', 'Adventure', 'Wildlife', 'Nature'],
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    reviewCount: {
      type: Number,
      default: 120,
    },
    averageBudget: {
      type: Number,
      required: true,
    },
    activities: [String],
    bestTime: {
      type: String,
      default: 'October to March',
    },
    hotels: [
      {
        name: String,
        price: Number,
        rating: Number,
        image: String,
      },
    ],
    restaurants: [
      {
        name: String,
        cuisine: String,
        rating: Number,
        priceRange: String,
      },
    ],
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Destination', destinationSchema);
