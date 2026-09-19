const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateItineraryWithAI = async ({
  startingCity,
  destination,
  budget,
  duration,
  travelStyle,
  foodPreference,
  interests,
}) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_google_gemini_api_key_here') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are an expert travel planner. Create a detailed, day-by-day travel itinerary in pure JSON format for a trip with the following details:
- Starting City: ${startingCity || 'Mumbai'}
- Destination: ${destination}
- Total Budget: ₹${budget}
- Duration: ${duration} Days
- Travel Style: ${travelStyle || 'Balanced'}
- Food Preference: ${foodPreference || 'Vegetarian'}
- Interests: ${Array.isArray(interests) ? interests.join(', ') : interests || 'Local attractions, Food, Nature'}

Output strictly valid JSON with no markdown block formatting, adhering exactly to this schema:
{
  "tripTitle": "${duration}-Day ${destination} ${travelStyle || 'Adventure'}",
  "destination": "${destination}",
  "totalBudget": ${Number(budget) || 20000},
  "days": [
    {
      "day": 1,
      "title": "Arrival & Local Sightseeing",
      "activities": [
        {
          "time": "08:00",
          "activity": "Morning Activity Name",
          "description": "Short vivid description of what to do",
          "location": "Location Name",
          "estimatedCost": 300,
          "travelTime": "20 mins"
        }
      ]
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean potential JSON markdown wrapping ```json ... ```
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedJSON = JSON.parse(text);
      if (parsedJSON && parsedJSON.days && Array.isArray(parsedJSON.days)) {
        return parsedJSON;
      }
    } catch (err) {
      console.warn('Gemini API call warning/fallback:', err.message);
    }
  }

  // Robust Smart Fallback Generator
  return createFallbackItinerary({
    startingCity,
    destination,
    budget: Number(budget) || 20000,
    duration: Number(duration) || 5,
    travelStyle: travelStyle || 'Adventure',
    foodPreference: foodPreference || 'Vegetarian',
    interests: Array.isArray(interests) ? interests : ['Nature', 'Sightseeing', 'Food'],
  });
};

const createFallbackItinerary = ({ startingCity, destination, budget, duration, travelStyle, foodPreference, interests }) => {
  const validDuration = Math.max(1, Math.min(14, Number(duration) || 5));
  const validBudget = Math.max(1000, Number(budget) || 20000);
  const validDest = (destination || 'Manali').trim() || 'Manali';
  const validStart = (startingCity || 'Mumbai').trim() || 'Mumbai';
  const validStyle = travelStyle || 'Adventure';
  const validFood = foodPreference || 'Vegetarian';
  const validInterests = Array.isArray(interests) && interests.length > 0 ? interests : ['Nature', 'Sightseeing', 'Food'];

  const days = [];
  const dailyBudget = Math.max(500, Math.round(validBudget / validDuration));

  const sampleActivities = [
    {
      day1: [
        { time: '08:00 AM', activity: `Departure from ${validStart}`, description: `Board scenic transport towards ${validDest}.`, location: validStart, estimatedCost: Math.max(100, Math.round(dailyBudget * 0.3)), travelTime: '3 hours' },
        { time: '01:00 PM', activity: `Arrival & Hotel Check-in`, description: `Check into local resort/hotel and enjoy a ${validFood} lunch.`, location: `${validDest} Town Center`, estimatedCost: Math.max(100, Math.round(dailyBudget * 0.2)), travelTime: '30 mins' },
        { time: '04:30 PM', activity: `Local Sightseeing & Walk`, description: `Explore nearby handicraft markets, heritage cafes and cultural spots.`, location: `${validDest} Mall Road / Main Street`, estimatedCost: Math.max(100, Math.round(dailyBudget * 0.15)), travelTime: '15 mins' },
        { time: '08:00 PM', activity: `Welcome Dinner & Rest`, description: `Relaxed evening dinner with local music and ambiance.`, location: `${validDest} Garden Restaurant`, estimatedCost: Math.max(100, Math.round(dailyBudget * 0.25)), travelTime: '10 mins' },
      ],
      day2: [
        { time: '07:30 AM', activity: `Sunrise Viewpoint & Breakfast`, description: `Early morning panoramic views of peaks/landscapes followed by breakfast.`, location: `${validDest} Heights`, estimatedCost: Math.max(100, Math.round(dailyBudget * 0.15)), travelTime: '25 mins' },
        { time: '10:00 AM', activity: `${validStyle} Outdoor Activity`, description: `Engage in ${validInterests[0] || 'trekking'} and nature photography.`, location: `${validDest} Valley Trail`, estimatedCost: Math.max(100, Math.round(dailyBudget * 0.4)), travelTime: '45 mins' },
        { time: '02:00 PM', activity: `Scenic Lunch Break`, description: `Relaxed lunch overlooking rivers or greenery with ${validFood} meals.`, location: `${validDest} River Cafe`, estimatedCost: Math.max(100, Math.round(dailyBudget * 0.25)), travelTime: '15 mins' },
        { time: '06:00 PM', activity: `Campfire / Cultural Show`, description: `Sunset photography followed by campfire storytelling with fellow travelers.`, location: `Basecamp Resort`, estimatedCost: Math.max(100, Math.round(dailyBudget * 0.2)), travelTime: '20 mins' },
      ],
      day3: [
        { time: '08:30 AM', activity: `Heritage & Temple Exploration`, description: `Visit iconic historical temples, shrines, and architectural landmarks.`, location: `${validDest} Historic Quarter`, estimatedCost: Math.max(100, Math.round(dailyBudget * 0.2)), travelTime: '20 mins' },
        { time: '11:30 AM', activity: `Adventure Sports / Water Rafting`, description: `Thrilling adventure activity tailored for ${validStyle} enthusiasts.`, location: `${validDest} Adventure Park`, estimatedCost: Math.max(100, Math.round(dailyBudget * 0.45)), travelTime: '30 mins' },
        { time: '03:30 PM', activity: `Artisan Souvenir Shopping`, description: `Pick up local handicrafts, spices, and handmade souvenirs for loved ones.`, location: `${validDest} Bazaar`, estimatedCost: Math.max(100, Math.round(dailyBudget * 0.2)), travelTime: '15 mins' },
        { time: '08:30 PM', activity: `Stargazing & Fine Dining`, description: `Night skyline view accompanied by gourmet culinary delights.`, location: `Rooftop Terrace`, estimatedCost: Math.max(100, Math.round(dailyBudget * 0.15)), travelTime: '10 mins' },
      ],
    },
  ];

  for (let i = 1; i <= validDuration; i++) {
    const dayIndex = (i - 1) % 3;
    let dayActivities;

    if (dayIndex === 0) dayActivities = sampleActivities[0].day1;
    else if (dayIndex === 1) dayActivities = sampleActivities[0].day2;
    else dayActivities = sampleActivities[0].day3;

    days.push({
      day: i,
      title: i === 1 ? 'Arrival & Orientation' : i === validDuration ? 'Final Sightseeing & Departure' : `${validDest} Exploration Day ${i}`,
      activities: dayActivities.map((act) => ({
        ...act,
        estimatedCost: Math.max(50, Math.round(act.estimatedCost) || 300),
      })),
    });
  }

  return {
    tripTitle: `${validDuration}-Day ${validDest} ${validStyle}`,
    destination: validDest,
    totalBudget: validBudget,
    days,
  };
};

module.exports = { generateItineraryWithAI };
