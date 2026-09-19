const Destination = require('../models/Destination');
const { getFallbackStatus } = require('../config/db');

// Expanded Destination Catalog across India
const memoryDestinations = [
  {
    _id: 'dest_1',
    name: 'Manali',
    location: 'Himachal Pradesh, North India',
    state: 'Himachal Pradesh',
    description: 'A high-altitude Himalayan resort town known for snow-capped peaks, Solang Valley sports, and serene monasteries.',
    images: [
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1593181629936-11c609b8db9b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'Mountains',
    rating: 4.8,
    reviewCount: 342,
    averageBudget: 20000,
    activities: ['Paragliding', 'Solang Trekking', 'Skiing', 'Old Manali Cafe Crawl', 'Hadimba Temple Visit'],
    bestTime: 'October to June',
    hotels: [
      { name: 'Solang Valley Resort', price: 4500, rating: 4.7, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80' },
      { name: 'The Himalayan Hotel', price: 3200, rating: 4.5, image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400&q=80' }
    ],
    restaurants: [
      { name: 'Cafe 1947', cuisine: 'Italian & Local', rating: 4.8, priceRange: '₹800 for two' },
      { name: 'Drifters Inn', cuisine: 'Continental', rating: 4.6, priceRange: '₹600 for two' }
    ],
    lat: 32.2432,
    lng: 77.1892,
  },
  {
    _id: 'dest_2',
    name: 'Goa',
    location: 'North & South Goa, West Coast India',
    state: 'Goa',
    description: 'Famous for sandy beaches, vibrant nightlife, Portuguese colonial architecture, and delicious seafood.',
    images: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'Beaches',
    rating: 4.7,
    reviewCount: 512,
    averageBudget: 18000,
    activities: ['Scuba Diving', 'Baga Beach Parties', 'Dudhsagar Waterfalls Tour', 'Water Sports', 'Sunset Cruise'],
    bestTime: 'November to February',
    hotels: [
      { name: 'Taj Exotica Resort', price: 8500, rating: 4.9, image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=400&q=80' },
      { name: 'Alila Diwa Goa', price: 5500, rating: 4.7, image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=400&q=80' }
    ],
    restaurants: [
      { name: 'Britto’s Shack', cuisine: 'Seafood & Goan', rating: 4.7, priceRange: '₹1200 for two' },
      { name: 'Thalassa', cuisine: 'Greek & Mediterranean', rating: 4.8, priceRange: '₹2000 for two' }
    ],
    lat: 15.2993,
    lng: 74.124,
  },
  {
    _id: 'dest_7',
    name: 'Mumbai',
    location: 'Mumbai, Maharashtra, West India',
    state: 'Maharashtra',
    description: 'The City of Dreams! Home to Gateway of India, Marine Drive skyline, Bollywood studios, street food, and historic South Mumbai architecture.',
    images: [
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'Heritage',
    rating: 4.8,
    reviewCount: 780,
    averageBudget: 22000,
    activities: ['Marine Drive Evening Walk', 'Gateway of India Ferry', 'Elephanta Caves Tour', 'Chhatrapati Shivaji Terminus Visit', 'Colaba Causeway Shopping'],
    bestTime: 'October to March',
    hotels: [
      { name: 'The Taj Mahal Palace', price: 18000, rating: 5.0, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80' },
      { name: 'Trident Nariman Point', price: 9500, rating: 4.8, image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400&q=80' }
    ],
    restaurants: [
      { name: 'Bademiya', cuisine: 'Kebab & Mughlai', rating: 4.7, priceRange: '₹800 for two' },
      { name: 'Leopold Cafe', cuisine: 'Continental & Beer', rating: 4.6, priceRange: '₹1200 for two' }
    ],
    lat: 18.922,
    lng: 72.8347,
  },
  {
    _id: 'dest_3',
    name: 'Kerala',
    location: 'Alleppey, Munnar & Kochi, South India',
    state: 'Kerala',
    description: 'God’s Own Country boasting lush tea plantations, tranquil backwaters, houseboat cruises, and Ayurvedic wellness.',
    images: [
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'Nature',
    rating: 4.9,
    reviewCount: 428,
    averageBudget: 22000,
    activities: ['Backwater Houseboat Staying', 'Munnar Tea Garden Walking', 'Ayurvedic Massage', 'Kathakali Dance Show'],
    bestTime: 'September to March',
    hotels: [
      { name: 'Kumarakom Lake Resort', price: 9000, rating: 4.9, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80' }
    ],
    restaurants: [
      { name: 'Vembanad Restaurant', cuisine: 'South Indian & Kerala Seafood', rating: 4.8, priceRange: '₹1000 for two' }
    ],
    lat: 9.4981,
    lng: 76.3388,
  },
  {
    _id: 'dest_4',
    name: 'Leh-Ladakh',
    location: 'Leh & Nubra Valley, High Himalayas',
    state: 'Jammu & Kashmir',
    description: 'Surreal mountain pass vistas, Pangong Lake reflections, ancient monasteries, and high-altitude motorcycling.',
    images: [
      'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'Adventure',
    rating: 4.9,
    reviewCount: 290,
    averageBudget: 35000,
    activities: ['Pangong Tso Camping', 'Khardung La Pass Ride', 'Diskit Monastery Visit', 'Nubra Valley Camel Safari'],
    bestTime: 'May to September',
    hotels: [
      { name: 'The Grand Dragon Ladakh', price: 7500, rating: 4.8, image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400&q=80' }
    ],
    restaurants: [
      { name: 'The Tibetan Kitchen', cuisine: 'Tibetan & Ladakhi', rating: 4.9, priceRange: '₹700 for two' }
    ],
    lat: 34.1526,
    lng: 77.5771,
  },
  {
    _id: 'dest_5',
    name: 'Rajasthan (Jaipur & Udaipur)',
    location: 'Jaipur, Udaipur & Jaisalmer, North-West India',
    state: 'Rajasthan',
    description: 'The Land of Kings with majestic palaces, desert forts, royal heritage, vibrant bazaars, and Lake Pichola boat rides.',
    images: [
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'Heritage',
    rating: 4.8,
    reviewCount: 610,
    averageBudget: 24000,
    activities: ['Amber Fort Elephant Ride', 'City Palace Tour', 'Lake Pichola Boating', 'Chokhi Dhani Cultural Night'],
    bestTime: 'October to March',
    hotels: [
      { name: 'Taj Lake Palace Udaipur', price: 15000, rating: 5.0, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80' }
    ],
    restaurants: [
      { name: '1135 AD Amer', cuisine: 'Royal Rajasthani Thali', rating: 4.9, priceRange: '₹2500 for two' }
    ],
    lat: 26.9124,
    lng: 75.7873,
  },
  {
    _id: 'dest_6',
    name: 'Uttarakhand (Rishikesh)',
    location: 'Rishikesh, Haridwar & Mussoorie, North India',
    state: 'Uttarakhand',
    description: 'The Yoga Capital of the world offering white-water rafting, Ganga Aarti ceremonies, and serene mountain retreats.',
    images: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'Adventure',
    rating: 4.7,
    reviewCount: 380,
    averageBudget: 15000,
    activities: ['White Water Rafting', 'Bungee Jumping', 'Triveni Ghat Evening Aarti', 'Beatles Ashram Tour'],
    bestTime: 'September to May',
    hotels: [
      { name: 'Aloha On The Ganges', price: 4200, rating: 4.7, image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=400&q=80' }
    ],
    restaurants: [
      { name: 'Little Buddha Cafe', cuisine: 'Israeli & Vegan', rating: 4.8, priceRange: '₹600 for two' }
    ],
    lat: 30.0869,
    lng: 78.2676,
  },
  {
    _id: 'dest_8',
    name: 'Kashmir (Srinagar & Gulmarg)',
    location: 'Srinagar, Gulmarg & Pahalgam, North India',
    state: 'Jammu & Kashmir',
    description: 'Paradise on Earth! Experience Shikara rides on Dal Lake, Gulmarg gondola rides, snow skiing, and saffron valleys.',
    images: [
      'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'Mountains',
    rating: 4.9,
    reviewCount: 450,
    averageBudget: 28000,
    activities: ['Dal Lake Shikara Ride', 'Gulmarg Cable Car Gondola', 'Pahalgam Valley Horse Riding', 'Mughal Gardens Walk'],
    bestTime: 'All Year Round',
    hotels: [
      { name: 'Khyber Himalayan Resort Gulmarg', price: 14000, rating: 4.9, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80' }
    ],
    restaurants: [
      { name: 'Ahdoos Restaurant Srinagar', cuisine: 'Kashmiri Wazwan', rating: 4.9, priceRange: '₹1400 for two' }
    ],
    lat: 34.0837,
    lng: 74.7973,
  },
  {
    _id: 'dest_9',
    name: 'Ooty (Nilgiris)',
    location: 'Ooty, Coonoor, Tamil Nadu, South India',
    state: 'Tamil Nadu',
    description: 'Queen of Hill Stations surrounded by Nilgiri mountains, tea estates, botanical gardens, and heritage Nilgiri Toy Train rides.',
    images: [
      'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'Nature',
    rating: 4.6,
    reviewCount: 310,
    averageBudget: 16000,
    activities: ['Nilgiri Toy Train Ride', 'Ooty Lake Boating', 'Doddabetta Peak Viewpoint', 'Rose Garden Walk'],
    bestTime: 'October to June',
    hotels: [
      { name: 'Savoy - IHCL SeleQtions Ooty', price: 6500, rating: 4.7, image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400&q=80' }
    ],
    restaurants: [
      { name: 'Nahar Sidewalk Cafe', cuisine: 'Italian & Woodfired Pizza', rating: 4.6, priceRange: '₹700 for two' }
    ],
    lat: 11.4102,
    lng: 76.695,
  },
  {
    _id: 'dest_10',
    name: 'Andaman & Nicobar Islands',
    location: 'Port Blair & Havelock Island, Island Territory',
    state: 'Andaman and Nicobar',
    description: 'Pristine turquoise tropical waters, Radhanagar white sand beach, coral reef snorkeling, and Cellular Jail history.',
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'Beaches',
    rating: 4.9,
    reviewCount: 390,
    averageBudget: 32000,
    activities: ['Scuba Diving Havelock', 'Radhanagar Beach Sunset', 'Cellular Jail Light & Sound Show', 'Sea Walking'],
    bestTime: 'October to May',
    hotels: [
      { name: 'Taj Exotica Resort Havelock', price: 16000, rating: 4.9, image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=400&q=80' }
    ],
    restaurants: [
      { name: 'Full Moon Cafe Havelock', cuisine: 'Seafood & Continental', rating: 4.8, priceRange: '₹1100 for two' }
    ],
    lat: 11.6234,
    lng: 92.7265,
  },
  {
    _id: 'dest_11',
    name: 'Varanasi',
    location: 'Varanasi, Uttar Pradesh, North India',
    state: 'Uttar Pradesh',
    description: 'One of the oldest continuously inhabited cities in the world! Famous for spiritual Ganga Aarti, ancient ghats, and boat rides.',
    images: [
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'Heritage',
    rating: 4.8,
    reviewCount: 520,
    averageBudget: 14000,
    activities: ['Dashashwamedh Ghat Ganga Aarti', 'Sunrise Boat Ride on Ganges', 'Kashi Vishwanath Temple Visit', 'Sarnath Buddhist Tour'],
    bestTime: 'October to March',
    hotels: [
      { name: 'BrijRama Palace Varanasi', price: 11000, rating: 4.9, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80' }
    ],
    restaurants: [
      { name: 'Kashi Chat Bhandar', cuisine: 'Street Food & Chaat', rating: 4.9, priceRange: '₹300 for two' }
    ],
    lat: 25.3176,
    lng: 82.9739,
  },
  {
    _id: 'dest_12',
    name: 'Agra (Taj Mahal)',
    location: 'Agra, Uttar Pradesh, North India',
    state: 'Uttar Pradesh',
    description: 'Home to the iconic Taj Mahal, Agra Fort, and Fatehpur Sikri. A UNESCO World Heritage capital of Mughal architecture.',
    images: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'Heritage',
    rating: 4.9,
    reviewCount: 920,
    averageBudget: 15000,
    activities: ['Sunrise Taj Mahal Tour', 'Agra Fort Exploration', 'Mehtab Bagh Sunset View', 'Petha Sweet Tasting'],
    bestTime: 'October to March',
    hotels: [
      { name: 'The Oberoi Amarvilas Agra', price: 25000, rating: 5.0, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80' }
    ],
    restaurants: [
      { name: 'Pinch of Spice', cuisine: 'North Indian Mughlai', rating: 4.7, priceRange: '₹1000 for two' }
    ],
    lat: 27.1751,
    lng: 78.0421,
  },
  {
    _id: 'dest_13',
    name: 'Coorg (Kodagu)',
    location: 'Coorg, Madikeri, Karnataka, South India',
    state: 'Karnataka',
    description: 'The Scotland of India! Misty coffee plantations, Abbey Waterfalls, Dubare Elephant Camp, and Raja’s Seat sunsets.',
    images: [
      'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'Nature',
    rating: 4.7,
    reviewCount: 360,
    averageBudget: 17000,
    activities: ['Coffee Plantation Walking Tour', 'Abbey Falls Visit', 'Dubare Elephant Camp Bathing', 'Namen droling Golden Temple Visit'],
    bestTime: 'October to May',
    hotels: [
      { name: 'Evolve Back Coorg', price: 13000, rating: 4.9, image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=400&q=80' }
    ],
    restaurants: [
      { name: 'Coorg Cuisine', cuisine: 'Pandi Curry & Kodava Food', rating: 4.8, priceRange: '₹800 for two' }
    ],
    lat: 12.4244,
    lng: 75.7382,
  },
];

const getDestinations = async (req, res) => {
  const { category, search, sort } = req.query;

  let result = [...memoryDestinations];

  if (!getFallbackStatus()) {
    try {
      let query = {};
      if (category && category !== 'All') {
        query.category = category;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { state: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      let sortOptions = {};
      if (sort === 'rating') sortOptions.rating = -1;
      else if (sort === 'budget-low') sortOptions.averageBudget = 1;
      else if (sort === 'budget-high') sortOptions.averageBudget = -1;

      const destinations = await Destination.find(query).sort(sortOptions);
      if (destinations.length > 0) {
        return res.json(destinations);
      }
    } catch (error) {
      // Fallthrough to memory filter
    }
  }

  // Filter in memory dataset dynamically
  if (category && category !== 'All') {
    result = result.filter((d) => d.category.toLowerCase() === category.toLowerCase());
  }

  if (search && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    result = result.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q) ||
        d.state.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        (d.activities && d.activities.some((a) => a.toLowerCase().includes(q)))
    );

    // If still no exact static match, dynamically synthesize a matching Indian destination object
    if (result.length === 0) {
      const formattedName = search.charAt(0).toUpperCase() + search.slice(1);
      result = [
        {
          _id: 'dynamic_' + Date.now(),
          name: formattedName,
          location: `${formattedName}, India`,
          state: 'India',
          description: `Discover ${formattedName}! A fascinating travel location offering rich cultural heritage, local cuisines, scenic viewpoints, and memorable adventures.`,
          images: [
            'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
          ],
          category: category && category !== 'All' ? category : 'Heritage',
          rating: 4.8,
          reviewCount: 150,
          averageBudget: 18000,
          activities: [`${formattedName} City Tour`, 'Local Market Walking', 'Cultural Heritage Sightseeing', 'Regional Food Tasting'],
          bestTime: 'October to March',
          hotels: [
            { name: `${formattedName} Grand Resort`, price: 4500, rating: 4.7, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80' }
          ],
          restaurants: [
            { name: `${formattedName} Heritage Bistro`, cuisine: 'Indian & Regional', rating: 4.7, priceRange: '₹800 for two' }
          ],
          lat: 20.5937,
          lng: 78.9629,
        }
      ];
    }
  }

  if (sort === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'budget-low') {
    result.sort((a, b) => a.averageBudget - b.averageBudget);
  } else if (sort === 'budget-high') {
    result.sort((a, b) => b.averageBudget - a.averageBudget);
  }

  return res.json(result);
};

const getDestinationById = async (req, res) => {
  const { id } = req.params;

  if (!getFallbackStatus()) {
    try {
      const destination = await Destination.findById(id);
      if (destination) {
        return res.json(destination);
      }
      const foundByName = await Destination.findOne({ name: new RegExp('^' + id + '$', 'i') });
      if (foundByName) return res.json(foundByName);
    } catch (error) {
      // Fallthrough to memory lookups
    }
  }

  const dest = memoryDestinations.find((d) => d._id === id || d.name.toLowerCase() === id.toLowerCase() || d.name.toLowerCase().includes(id.toLowerCase()));
  if (dest) return res.json(dest);

  // Return dynamic destination for any searched city name
  const formatted = id.charAt(0).toUpperCase() + id.slice(1);
  return res.json({
    _id: id,
    name: formatted,
    location: `${formatted}, India`,
    state: 'India',
    description: `Explore ${formatted}! A prime Indian travel destination filled with scenic landscapes, rich local markets, historic monuments, and delicious culinary specialties.`,
    images: [
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'Heritage',
    rating: 4.8,
    reviewCount: 220,
    averageBudget: 20000,
    activities: [`${formatted} City Sightseeing`, 'Sunset Viewpoint Trail', 'Local Bazaar Shopping', 'Traditional Cuisine Tasting'],
    bestTime: 'October to March',
    hotels: [
      { name: `${formatted} Palace Hotel`, price: 5000, rating: 4.8, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80' }
    ],
    restaurants: [
      { name: `${formatted} Royal Cafe`, cuisine: 'North & South Indian', rating: 4.7, priceRange: '₹900 for two' }
    ],
    lat: 20.5937,
    lng: 78.9629,
  });
};

const createDestination = async (req, res) => {
  if (getFallbackStatus()) {
    const newDest = { _id: 'dest_' + Date.now(), ...req.body };
    memoryDestinations.push(newDest);
    return res.status(201).json(newDest);
  }

  try {
    const destination = await Destination.create(req.body);
    res.status(201).json(destination);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateDestination = async (req, res) => {
  const { id } = req.params;

  if (getFallbackStatus()) {
    const idx = memoryDestinations.findIndex((d) => d._id === id);
    if (idx !== -1) {
      memoryDestinations[idx] = { ...memoryDestinations[idx], ...req.body };
      return res.json(memoryDestinations[idx]);
    }
  }

  try {
    const destination = await Destination.findByIdAndUpdate(id, req.body, { new: true });
    res.json(destination);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteDestination = async (req, res) => {
  const { id } = req.params;

  if (getFallbackStatus()) {
    const idx = memoryDestinations.findIndex((d) => d._id === id);
    if (idx !== -1) {
      memoryDestinations.splice(idx, 1);
      return res.json({ message: 'Destination removed' });
    }
  }

  try {
    await Destination.findByIdAndDelete(id);
    res.json({ message: 'Destination deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
  memoryDestinations,
};
