const { generateItineraryWithAI } = require('../services/geminiService');
const Trip = require('../models/Trip');
const { getFallbackStatus } = require('../config/db');
const { memoryTrips } = require('./tripController');

const generateItinerary = async (req, res) => {
  const { startingCity, destination, budget, duration, travelStyle, foodPreference, interests, saveTrip } = req.body;

  if (!destination) {
    return res.status(400).json({ message: 'Destination is required' });
  }

  try {
    const itineraryResult = await generateItineraryWithAI({
      startingCity: startingCity || 'Mumbai',
      destination,
      budget: Number(budget) || 20000,
      duration: Number(duration) || 5,
      travelStyle: travelStyle || 'Adventure',
      foodPreference: foodPreference || 'Vegetarian',
      interests: Array.isArray(interests) ? interests : [interests || 'Sightseeing'],
    });

    let savedTripData = null;

    if (saveTrip !== false) {
      let ownerId = req.user && req.user._id ? req.user._id : '65f8a09b1234567890abcdef';

      const tripData = {
        owner: ownerId,
        tripTitle: itineraryResult.tripTitle || `${duration || 5}-Day ${destination} Trip`,
        startingCity: startingCity || 'Mumbai',
        destination,
        startDate: new Date(),
        endDate: new Date(Date.now() + Number(duration || 5) * 24 * 60 * 60 * 1000),
        travelersCount: 2,
        budget: Number(budget) || 20000,
        travelStyle: travelStyle || 'Adventure',
        foodPreference: foodPreference || 'Vegetarian',
        interests: Array.isArray(interests) ? interests : [interests || 'Sightseeing'],
        itinerary: itineraryResult.days || [],
        status: 'Upcoming',
        inviteCode: (destination.replace(/\s+/g, '').substring(0, 4) + Math.floor(1000 + Math.random() * 9000)).toUpperCase(),
      };

      if (getFallbackStatus()) {
        savedTripData = { _id: 'trip_' + Date.now(), ...tripData };
        memoryTrips.unshift(savedTripData);
      } else {
        try {
          savedTripData = await Trip.create(tripData);
        } catch (e) {
          console.warn('Trip.create fallback warning:', e.message);
          savedTripData = { _id: 'trip_' + Date.now(), ...tripData };
          memoryTrips.unshift(savedTripData);
        }
      }
    }

    return res.json({
      success: true,
      itinerary: itineraryResult,
      trip: savedTripData || { _id: 'trip_' + Date.now(), itinerary: itineraryResult.days, destination, tripTitle: `${duration || 5}-Day ${destination} Trip` },
    });
  } catch (error) {
    console.error('AI generation controller error:', error);
    const fallbackItin = {
      tripTitle: `${duration || 5}-Day ${destination} Trip`,
      destination,
      totalBudget: Number(budget) || 20000,
      days: [
        {
          day: 1,
          title: 'Arrival & Local Exploration',
          activities: [
            { time: '09:00 AM', activity: `Arrival at ${destination}`, description: `Check-in and explore ${destination} town.`, location: destination, estimatedCost: 1500, travelTime: '30 mins' }
          ]
        }
      ]
    };
    return res.json({
      success: true,
      itinerary: fallbackItin,
      trip: { _id: 'trip_' + Date.now(), ...fallbackItin },
    });
  }
};

module.exports = { generateItinerary };
