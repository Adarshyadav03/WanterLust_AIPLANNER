const Trip = require('../models/Trip');
const { getFallbackStatus } = require('../config/db');

const memoryTrips = [
  {
    _id: 'trip_1',
    owner: '65f8a09b1234567890abcdef',
    tripTitle: '5-Day Manali Adventure',
    startingCity: 'Mumbai',
    destination: 'Manali',
    startDate: new Date('2026-12-12'),
    endDate: new Date('2026-12-16'),
    travelersCount: 4,
    budget: 20000,
    travelStyle: 'Adventure',
    foodPreference: 'Vegetarian',
    interests: ['Trekking', 'Nature', 'Photography'],
    status: 'Upcoming',
    inviteCode: 'MANALI2026',
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Local Sightseeing',
        activities: [
          { time: '08:00 AM', activity: 'Breakfast', description: 'Breakfast at hotel and briefing', location: 'Hotel Restaurant', estimatedCost: 300, travelTime: '0 mins' },
          { time: '10:00 AM', activity: 'Visit Hadimba Temple', description: 'Explore the ancient wooden temple in cedar forest', location: 'Hadimba Road', estimatedCost: 100, travelTime: '20 mins' },
          { time: '02:00 PM', activity: 'Lunch at Cafe 1947', description: 'Enjoy wood-fired pizza by the river stream', location: 'Old Manali', estimatedCost: 600, travelTime: '15 mins' },
          { time: '05:00 PM', activity: 'Mall Road Stroll', description: 'Shopping for woolens and local handicrafts', location: 'Manali Mall Road', estimatedCost: 1000, travelTime: '10 mins' },
        ],
      },
      {
        day: 2,
        title: 'Solang Valley Adventure Sports',
        activities: [
          { time: '08:00 AM', activity: 'Drive to Solang Valley', description: 'Scenic drive up the mountain slopes', location: 'Solang Valley Road', estimatedCost: 1200, travelTime: '45 mins' },
          { time: '10:00 AM', activity: 'Paragliding & Cable Car Ride', description: 'Tandem paragliding jump over snowfields', location: 'Solang Ropeway', estimatedCost: 3200, travelTime: '15 mins' },
          { time: '02:00 PM', activity: 'Mountain Bistro Lunch', description: 'Hot noodles and traditional thali', location: 'Solang Village', estimatedCost: 400, travelTime: '10 mins' },
        ],
      },
      {
        day: 3,
        title: 'Rohtang Pass Snow Experience',
        activities: [
          { time: '06:00 AM', activity: 'Early Departure for Rohtang', description: 'Cross high altitude snow pass at 13,058 ft', location: 'Rohtang Pass Highway', estimatedCost: 2500, travelTime: '2 hours' },
          { time: '10:00 AM', activity: 'Snow Scooter & Photography', description: 'Play in glacier snow and shoot viral travel videos', location: 'Rohtang Crest', estimatedCost: 1500, travelTime: '30 mins' },
        ],
      },
      {
        day: 4,
        title: 'Old Manali Cultural & Cafe Exploration',
        activities: [
          { time: '09:30 AM', activity: 'Manu Temple Trail', description: 'Walk through historic stone alleyways', location: 'Old Manali', estimatedCost: 150, travelTime: '30 mins' },
          { time: '01:00 PM', activity: 'Live Acoustic Session Lunch', description: 'Unwind with local musicians at Drifters Inn', location: 'Old Manali Cafe Strip', estimatedCost: 800, travelTime: '10 mins' },
        ],
      },
      {
        day: 5,
        title: 'Departure & Souvenir Shopping',
        activities: [
          { time: '09:00 AM', activity: 'Final Apple Orchard Walk', description: 'Fresh organic fruit picking and packing', location: 'Aleo Orchards', estimatedCost: 300, travelTime: '15 mins' },
          { time: '01:00 PM', activity: 'Volvo Bus Departure', description: 'Return journey back to home city', location: 'Private Bus Stand', estimatedCost: 1500, travelTime: '30 mins' },
        ],
      },
    ],
  },
];

const getTrips = async (req, res) => {
  if (getFallbackStatus()) {
    return res.json(memoryTrips);
  }

  try {
    const trips = await Trip.find({ owner: req.user._id }).sort({ createdAt: -1 });
    if (trips.length === 0) {
      return res.json(memoryTrips);
    }
    res.json(trips);
  } catch (error) {
    res.json(memoryTrips);
  }
};

const getTripById = async (req, res) => {
  const { id } = req.params;

  if (getFallbackStatus()) {
    const found = memoryTrips.find((t) => t._id === id);
    return res.json(found || memoryTrips[0]);
  }

  try {
    const trip = await Trip.findById(id);
    if (trip) {
      return res.json(trip);
    }
    res.status(404).json({ message: 'Trip not found' });
  } catch (error) {
    const found = memoryTrips.find((t) => t._id === id);
    res.json(found || memoryTrips[0]);
  }
};

const createTrip = async (req, res) => {
  const tripData = {
    ...req.body,
    owner: req.user ? req.user._id : '65f8a09b1234567890abcdef',
    inviteCode: (req.body.destination || 'TRIP').toUpperCase().slice(0, 4) + Math.floor(1000 + Math.random() * 9000),
  };

  if (getFallbackStatus()) {
    const newTrip = { _id: 'trip_' + Date.now(), ...tripData };
    memoryTrips.unshift(newTrip);
    return res.status(201).json(newTrip);
  }

  try {
    const trip = await Trip.create(tripData);
    res.status(201).json(trip);
  } catch (error) {
    const newTrip = { _id: 'trip_' + Date.now(), ...tripData };
    memoryTrips.unshift(newTrip);
    res.status(201).json(newTrip);
  }
};

const updateTrip = async (req, res) => {
  const { id } = req.params;

  if (getFallbackStatus()) {
    const idx = memoryTrips.findIndex((t) => t._id === id);
    if (idx !== -1) {
      memoryTrips[idx] = { ...memoryTrips[idx], ...req.body };
      return res.json(memoryTrips[idx]);
    }
  }

  try {
    const trip = await Trip.findByIdAndUpdate(id, req.body, { new: true });
    res.json(trip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTrip = async (req, res) => {
  const { id } = req.params;

  if (getFallbackStatus()) {
    const idx = memoryTrips.findIndex((t) => t._id === id);
    if (idx !== -1) {
      memoryTrips.splice(idx, 1);
      return res.json({ message: 'Trip deleted' });
    }
  }

  try {
    await Trip.findByIdAndDelete(id);
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  memoryTrips,
};
