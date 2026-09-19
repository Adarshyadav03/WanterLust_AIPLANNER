import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';
import { Sparkles, MapPin, DollarSign, Calendar, Compass, Utensils, Heart, ArrowRight, CheckCircle2 } from 'lucide-react';
import AnimatedButton from '../components/animations/AnimatedButton';

const travelStyles = ['Adventure', 'Relaxed', 'Heritage', 'Luxury', 'Budget', 'Backpacker'];
const foodPreferences = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Jain', 'Anything'];
const availableInterests = ['Trekking', 'Photography', 'Nature', 'Water Sports', 'Culture', 'Nightlife', 'Shopping', 'Spiritual'];

const loadingMessages = [
  'Understanding your preferences...',
  'Finding destinations for your budget...',
  'Planning activities & daily schedules...',
  'Optimizing your itinerary...',
  'Finalizing your trip plan...',
];

export default function AITripPlannerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [startingCity, setStartingCity] = useState('Mumbai');
  const [destination, setDestination] = useState(searchParams.get('destination') || 'Manali');
  const [budget, setBudget] = useState(20000);
  const [duration, setDuration] = useState(5);
  const [travelStyle, setTravelStyle] = useState('Adventure');
  const [foodPreference, setFoodPreference] = useState('Vegetarian');
  const [selectedInterests, setSelectedInterests] = useState(['Trekking', 'Nature', 'Photography']);

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const toggleInterest = (item) => {
    if (selectedInterests.includes(item)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== item));
    } else {
      setSelectedInterests([...selectedInterests, item]);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!destination.trim()) {
      return setError('Please specify a destination');
    }

    setLoading(true);
    setError('');

    try {
      const res = await API.post('/ai/generate-itinerary', {
        startingCity,
        destination: destination.trim(),
        budget,
        duration,
        travelStyle,
        foodPreference,
        interests: selectedInterests,
        saveTrip: true,
      });

      if (res.data && (res.data.trip || res.data.itinerary)) {
        const tripObj = res.data.trip || {};
        const tripId = tripObj._id || 'trip_1';
        navigate(`/itinerary/${tripId}`, {
          state: {
            itinerary: res.data.itinerary || tripObj.itinerary,
            trip: tripObj,
          },
        });
      } else {
        setError('Failed to generate itinerary. Please try again.');
      }
    } catch (err) {
      console.error('Itinerary generation error:', err);
      setError(err.response?.data?.message || 'Unable to generate itinerary at the moment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative">
      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-2xl shadow-emerald-500/40 mb-8"
            >
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-emerald-400" />
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={loadingStep}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 max-w-md"
              >
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {loadingMessages[loadingStep]}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Crafting personalized schedules, budget breakdown & meal recommendations for {destination}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Progress Bar */}
            <div className="w-64 h-2 bg-slate-800 rounded-full mt-8 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                initial={{ width: '10%' }}
                animate={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" /> Powered by Google Gemini AI
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Let AI Plan Your Perfect Trip ✨
        </h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          Custom day-by-day activity timelines, hour-by-hour schedules, cost estimates, and meal recommendations tailored to your exact budget.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-2xl text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleGenerate} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
        {/* Step 1: Locations */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" /> 1. Cities & Destination
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Starting City</label>
              <input
                type="text"
                required
                value={startingCity}
                onChange={(e) => setStartingCity(e.target.value)}
                placeholder="e.g. Mumbai, Delhi, Bengaluru"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-semibold focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Destination</label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Manali, Goa, Kerala, Leh"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-semibold focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Budget & Duration */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" /> 2. Budget & Duration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Total Budget (INR)</label>
                <span className="text-sm font-extrabold text-emerald-600">₹{budget.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="100000"
                step="2500"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                <span>₹5,000 (Budget)</span>
                <span>₹50,000</span>
                <span>₹100,000+ (Luxury)</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Trip Duration (Days)</label>
                <span className="text-sm font-extrabold text-emerald-600">{duration} Days</span>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                <span>1 Day</span>
                <span>7 Days</span>
                <span>14 Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Travel Style & Food */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-600" /> 3. Travel Style & Food Preference
          </h3>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">Travel Style</label>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {travelStyles.map((style) => (
                <motion.button
                  type="button"
                  key={style}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setTravelStyle(style)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    travelStyle === style
                      ? 'bg-slate-900 text-emerald-400 border-slate-900 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {style}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-700">Food Preference</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {foodPreferences.map((pref) => (
                <motion.button
                  type="button"
                  key={pref}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setFoodPreference(pref)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    foodPreference === pref
                      ? 'bg-slate-900 text-emerald-400 border-slate-900 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pref}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 4: Interests */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Heart className="w-4 h-4 text-emerald-600" /> 4. Specific Interests
          </h3>

          <div className="flex flex-wrap gap-2">
            {availableInterests.map((interest) => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <motion.button
                  type="button"
                  key={interest}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleInterest(interest)}
                  className={`py-2 px-4 rounded-full text-xs font-bold border transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {interest} {isSelected && '✓'}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100">
          <AnimatedButton
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full py-4 text-base font-black"
          >
            Generate My Trip ✨ <ArrowRight className="w-5 h-5 ml-2" />
          </AnimatedButton>
        </div>
      </form>
    </div>
  );
}

