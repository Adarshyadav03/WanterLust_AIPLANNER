import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import reviewService from '../services/reviewService';
import { useAuth } from '../context/AuthContext';

import {
  Sparkles,
  Search,
  Compass,
  DollarSign,
  Users,
  MessageSquare,
  MapPin,
  ArrowRight,
  Star,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  MessageCircle,
  Plus,
  X,
} from 'lucide-react';
import DestinationCard from '../components/destination/DestinationCard';

const popularDestinations = [
  {
    _id: 'dest_1',
    name: 'Manali',
    location: 'Himachal Pradesh',
    state: 'Himachal Pradesh',
    description: 'High-altitude Himalayan resort town famous for snow sports, pine forests, and Solang valley adventures.',
    images: ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80'],
    category: 'Mountains',
    rating: 4.8,
    reviewCount: 342,
    averageBudget: 20000,
  },
  {
    _id: 'dest_2',
    name: 'Goa',
    location: 'North & South Goa',
    state: 'Goa',
    description: 'Golden beaches, Portuguese heritage architecture, vibrant night markets, and watersports.',
    images: ['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80'],
    category: 'Beaches',
    rating: 4.7,
    reviewCount: 512,
    averageBudget: 18000,
  },
  {
    _id: 'dest_3',
    name: 'Kerala',
    location: 'Alleppey & Munnar',
    state: 'Kerala',
    description: 'Serene backwaters, tea gardens, houseboat stays, and refreshing Ayurvedic retreats.',
    images: ['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80'],
    category: 'Nature',
    rating: 4.9,
    reviewCount: 428,
    averageBudget: 22000,
  },
  {
    _id: 'dest_4',
    name: 'Leh-Ladakh',
    location: 'Ladakh',
    state: 'Jammu & Kashmir',
    description: 'Dramatic mountain passes, Pangong Tso reflections, monasteries, and motorcycle roadtrips.',
    images: ['https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80'],
    category: 'Adventure',
    rating: 4.9,
    reviewCount: 290,
    averageBudget: 35000,
  },
  {
    _id: 'dest_5',
    name: 'Rajasthan',
    location: 'Jaipur & Udaipur',
    state: 'Rajasthan',
    description: 'Royal fort palaces, desert camel safaris, lakeside luxury, and rich cultural traditions.',
    images: ['https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80'],
    category: 'Heritage',
    rating: 4.8,
    reviewCount: 610,
    averageBudget: 24000,
  },
  {
    _id: 'dest_6',
    name: 'Uttarakhand',
    location: 'Rishikesh',
    state: 'Uttarakhand',
    description: 'White-water river rafting, Ganga Aarti, yoga retreats, and Himalayan foothill treks.',
    images: ['https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'],
    category: 'Adventure',
    rating: 4.7,
    reviewCount: 380,
    averageBudget: 15000,
  },
];

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [role, setRole] = useState('Solo Traveler');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const data = await reviewService.getReviews();
      setReviews(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/destinations?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/destinations');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const newRev = await reviewService.createReview({
        rating,
        comment: comment.trim(),
        role: role.trim() || 'Traveler',
      });
      setReviews([newRev, ...reviews]);
      setShowReviewModal(false);
      setComment('');
      alert('Thank you for sharing your experience!');
    } catch (err) {
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-slate-950 overflow-hidden pt-12 pb-20">
        <div className="absolute inset-0 z-0">
          <motion.img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=90"
            alt="WanderLust Hero Mountain Lake"
            initial={{ scale: 1 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 12, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md text-emerald-400 text-xs font-bold tracking-wide uppercase"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
            Next-Gen AI Travel Companion
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]"
          >
            Explore. <br />
            Plan. <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Travel Together.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Your AI-powered travel companion for unforgettable journeys. Custom day-by-day itineraries, smart budget tracking, and real-time group collaboration.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <form onSubmit={handleSearch} className="bg-slate-900/90 backdrop-blur-xl p-2.5 rounded-2xl sm:rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col sm:flex-row items-center gap-2 focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all">
              <div className="flex items-center gap-3 px-4 py-2 w-full">
                <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Where do you want to go? (e.g. Manali, Goa, Kerala)"
                  className="w-full bg-transparent text-white placeholder-slate-400 text-sm font-medium focus:outline-none"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl sm:rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" /> Search
              </motion.button>
            </form>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-6 max-w-4xl mx-auto text-left">
            {[
              { icon: Sparkles, title: 'AI Itinerary', desc: 'Personalized in seconds', color: 'text-emerald-400', border: 'hover:border-emerald-500/50' },
              { icon: DollarSign, title: 'Budget Planner', desc: 'Charts & alerts', color: 'text-teal-400', border: 'hover:border-teal-400/50' },
              { icon: Users, title: 'Travel Buddies', desc: 'Connect & explore', color: 'text-cyan-400', border: 'hover:border-cyan-400/50' },
              { icon: MessageSquare, title: 'Group Chat', desc: 'Real-time planning', color: 'text-indigo-400', border: 'hover:border-indigo-400/50' },
              { icon: Compass, title: 'Destinations', desc: 'Ratings & Reviews', color: 'text-amber-400', border: 'hover:border-amber-400/50' },
            ].map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + idx * 0.08 }}
                whileHover={{ y: -4 }}
                className={`bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80 ${feature.border} transition-all cursor-pointer`}
              >
                <feature.icon className={`w-5 h-5 ${feature.color} mb-2`} />
                <div className="text-xs font-bold text-white">{feature.title}</div>
                <div className="text-[10px] text-slate-400">{feature.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Main Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 rounded-3xl p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 z-10 max-w-xl">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-200">Start Planning Now</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Ready for your next dream adventure?</h2>
            <p className="text-slate-100 text-sm font-medium">
              Tell Google Gemini your destination, starting city, budget, and travel style to get a complete daily schedule with estimated costs.
            </p>
          </div>
          <Link
            to="/plan-trip"
            className="z-10 px-8 py-4 bg-slate-950 hover:bg-slate-900 text-emerald-400 font-extrabold rounded-2xl text-base transition-all shadow-xl hover:scale-105 flex items-center gap-2.5 whitespace-nowrap"
          >
            <Sparkles className="w-5 h-5 text-emerald-400" /> Plan Your Trip
          </Link>
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Handpicked Locations</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Popular Destinations</h2>
          </div>
          <Link
            to="/destinations"
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
          >
            View All Destinations <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {popularDestinations.map((dest) => (
            <DestinationCard key={dest._id} destination={dest} />
          ))}
        </div>
      </section>

      {/* How WanderLust Works Section */}
      <section className="bg-slate-900 text-white py-16 sm:py-24 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Simple 4-Step Process</span>
            <h2 className="text-3xl sm:text-4xl font-black">How WanderLust Works</h2>
            <p className="text-slate-400 text-sm">
              From preference selection to real-time group collaboration, experience frictionless travel planning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 relative">
              <span className="text-4xl font-black text-emerald-500/30">01</span>
              <h3 className="text-lg font-bold text-white">Choose Destination</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Select from top Indian & global destinations or type your own custom location.
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 relative">
              <span className="text-4xl font-black text-emerald-500/30">02</span>
              <h3 className="text-lg font-bold text-white">Tell Preferences</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Set your budget, food preferences, travel duration, and activity interests.
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 relative">
              <span className="text-4xl font-black text-emerald-500/30">03</span>
              <h3 className="text-lg font-bold text-white">AI Creates Itinerary</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                WanderLust AI generates structured hour-by-hour activity timelines with costs.
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4 relative">
              <span className="text-4xl font-black text-emerald-500/30">04</span>
              <h3 className="text-lg font-bold text-white">Travel Together</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Invite friends via unique group code and chat in real-time with Socket.IO.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DYNAMIC USER PLATFORM REVIEWS & TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">User Experiences</span>
            <h2 className="text-3xl font-black text-slate-900">Platform Reviews & Feedback</h2>
          </div>

          <button
            onClick={() => setShowReviewModal(true)}
            className="px-5 py-3 bg-slate-900 hover:bg-emerald-600 text-white hover:text-slate-950 font-extrabold rounded-2xl text-xs transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Share Your Experience
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div key={rev._id} className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < (rev.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed italic font-medium">"{rev.comment}"</p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <img
                  src={rev.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                  alt={rev.user?.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                />
                <div>
                  <div className="text-xs font-extrabold text-slate-900">{rev.user?.name || 'WanderLust Traveler'}</div>
                  <div className="text-[10px] text-slate-500 font-semibold">{rev.role || 'Solo Traveler'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WRITE REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-5 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black">Review WanderLust Platform</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-extrabold text-amber-400 ml-2">{rating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Your Title / Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Solo Traveler, Backpacking Enthusiast"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Experience Review & Feedback</label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your thoughts about WanderLust AI planner, travel buddy connections, or group chat..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="w-full py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !comment.trim()}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs disabled:opacity-40"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
