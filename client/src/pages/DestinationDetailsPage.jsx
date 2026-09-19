import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import reviewService from '../services/reviewService';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import WeatherCard from '../components/weather/WeatherCard';
import InteractiveMap from '../components/map/InteractiveMap';
import StarRating from '../components/common/StarRating';
import RatingSummaryCard from '../components/common/RatingSummaryCard';
import ReviewFormModal from '../components/common/ReviewFormModal';
import {
  Star,
  MapPin,
  Calendar,
  IndianRupee,
  Sparkles,
  Heart,
  Hotel,
  Utensils,
  CheckCircle2,
  ArrowRight,
  ThumbsUp,
  Flag,
  Trash2,
  Edit3,
  MessageSquare,
  Share2,
} from 'lucide-react';

export default function DestinationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [destination, setDestination] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Rating & Review State
  const [ratingSummary, setRatingSummary] = useState({
    averageRating: 4.8,
    totalReviews: 342,
    distribution: { '5': 220, '4': 80, '3': 25, '2': 10, '1': 7 },
  });
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [reviewPage, setReviewPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOrder, setSortOrder] = useState('newest');
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Review Modals
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [hotelReviewTarget, setHotelReviewTarget] = useState(null); // If reviewing hotel

  useEffect(() => {
    fetchData();
    fetchReviews(1, sortOrder);
  }, [id, sortOrder]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const destRes = await API.get(`/destinations/${id}`);
      setDestination(destRes.data);

      const summaryRes = await reviewService.getDestinationRatingSummary(id);
      if (summaryRes && summaryRes.totalReviews > 0) {
        setRatingSummary(summaryRes);
      }

      const weatherRes = await API.get(`/destinations/${id}/weather`);
      setWeather(weatherRes.data);
    } catch (err) {
      console.error('Failed to load destination details', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (page = 1, sort = sortOrder) => {
    setLoadingReviews(true);
    try {
      const data = await reviewService.getDestinationReviews(id, { page, limit: 5, sort });
      if (page === 1) {
        setReviews(data.reviews || []);
      } else {
        setReviews((prev) => [...prev, ...(data.reviews || [])]);
      }
      setTotalPages(data.totalPages || 1);
      setReviewPage(page);
      setUserReview(data.userReview || null);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleOpenReviewModal = (review = null, hotel = null) => {
    if (!user) {
      sessionStorage.setItem('redirectAfterAuth', `/destinations/${id}`);
      return navigate('/login');
    }
    setHotelReviewTarget(hotel);
    setEditingReview(review || (hotel ? null : userReview));
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (payload) => {
    if (hotelReviewTarget) {
      if (editingReview) {
        await reviewService.updateHotelReview(hotelReviewTarget.name, editingReview._id, payload);
      } else {
        await reviewService.createHotelReview(hotelReviewTarget.name, {
          ...payload,
          hotelName: hotelReviewTarget.name,
          destination: id,
        });
      }
      alert(`Hotel review ${editingReview ? 'updated' : 'submitted'} successfully!`);
      return;
    }

    if (editingReview) {
      const res = await reviewService.updateDestinationReview(id, editingReview._id, payload);
      if (res?.summary) setRatingSummary(res.summary);
      alert('Your review has been updated!');
    } else {
      const res = await reviewService.createDestinationReview(id, payload);
      if (res?.summary) setRatingSummary(res.summary);
      alert('Thank you! Your review has been published.');
    }
    fetchReviews(1, sortOrder);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await reviewService.deleteDestinationReview(id, reviewId);
      if (res?.summary) setRatingSummary(res.summary);
      setUserReview(null);
      fetchReviews(1, sortOrder);
      alert('Review deleted successfully.');
    } catch (err) {
      alert(err.message || 'Could not delete review');
    }
  };

  const handleToggleHelpful = async (reviewId) => {
    if (!user) return navigate('/login');
    try {
      const res = await reviewService.toggleHelpful(reviewId, 'destination');
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, helpfulCount: res.helpfulCount, isHelpful: res.isHelpful } : r))
      );
    } catch (err) {
      console.error('Failed to toggle helpful', err);
    }
  };

  const handleReportReview = async (reviewId) => {
    if (!user) return navigate('/login');
    const reason = prompt('Reason for reporting (Spam, Offensive, Fake, Other):', 'Spam');
    if (!reason) return;
    try {
      await reviewService.reportReview(reviewId, { reviewType: 'destination', reason });
      alert('Review reported to moderation team.');
    } catch (err) {
      console.error('Failed to report review', err);
    }
  };

  if (loading) return <Loader message="Loading destination guide..." />;
  if (!destination) return <div className="text-center py-20 text-white">Destination not found</div>;

  const {
    name,
    location,
    state,
    description,
    images = [],
    averageBudget = 20000,
    bestTime = 'October to March',
    activities = [],
    hotels = [],
    restaurants = [],
    lat = 32.2432,
    lng = 77.1892,
  } = destination;

  const currentImg = images[selectedImage] || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Gallery & Overview */}
      <div className="space-y-6">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative h-[350px] sm:h-[480px] rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800">
            <img src={currentImg} alt={name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

            <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4 text-white">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                  <MapPin className="w-4 h-4" /> {state || location}
                </div>
                <h1 className="text-3xl sm:text-5xl font-black">{name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <StarRating rating={ratingSummary.averageRating} readOnly size="sm" />
                  <span className="text-xs font-bold text-slate-200">
                    ⭐ {ratingSummary.averageRating.toFixed(1)} ({ratingSummary.totalReviews} reviews)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`px-4 py-2.5 rounded-2xl backdrop-blur-md text-xs font-bold flex items-center gap-2 transition-all ${
                    isFavorite ? 'bg-rose-500 text-white' : 'bg-slate-900/80 text-white border border-slate-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Saved' : 'Add to Favorites'}
                </button>

                <button
                  onClick={() => navigate(`/plan-trip?destination=${encodeURIComponent(name)}`)}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Plan Trip with AI
                </button>
              </div>
            </div>
          </div>

          {/* Gallery thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImage === idx ? 'border-emerald-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${name} ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Info, Rating Breakdown, Reviews, Hotels */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Description */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">About {name}</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Rating</div>
                  <div className="text-sm font-bold text-slate-900">
                    {ratingSummary.averageRating.toFixed(1)} / 5 ({ratingSummary.totalReviews} reviews)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Best Time</div>
                  <div className="text-sm font-bold text-slate-900">{bestTime}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Avg. Budget</div>
                  <div className="text-sm font-bold text-slate-900">₹{averageBudget.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Summary Card & Distribution */}
          <RatingSummaryCard
            summary={ratingSummary}
            userReview={userReview}
            isAuthenticated={!!user}
            targetName={name}
            onWriteReview={() => handleOpenReviewModal()}
          />

          {/* Reviews List & Filter */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" /> Traveler Reviews ({ratingSummary.totalReviews})
              </h3>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-500 hidden sm:block">Sort by:</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                  <option value="helpful">Most Helpful</option>
                </select>
              </div>
            </div>

            {/* Review Cards Feed */}
            {reviews.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Star className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No reviews yet for {name}</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Be the first traveler to share your experience, travel tips, and photos!
                </p>
                <button
                  onClick={() => handleOpenReviewModal()}
                  className="px-5 py-2.5 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl shadow-md"
                >
                  Write the First Review ✨
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((rev) => {
                  const author = rev.user || {};
                  const isAuthor = user && String(user._id || user.id) === String(author._id || author);

                  return (
                    <div
                      key={rev._id}
                      className="p-5 sm:p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 hover:border-emerald-200 transition-all"
                    >
                      {/* User Info & Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              author.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                            }
                            alt={author.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                          />
                          <div>
                            <div className="text-sm font-extrabold text-slate-900">{author.name || 'Traveler'}</div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              📍 {author.location || 'India'} • {new Date(rev.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <StarRating rating={rev.rating} readOnly size="sm" />

                          {isAuthor && (
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={() => handleOpenReviewModal(rev)}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-200"
                                title="Edit Review"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteReview(rev._id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200"
                                title="Delete Review"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-1.5">
                        {rev.title && <h4 className="text-sm font-bold text-slate-900">"{rev.title}"</h4>}
                        <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
                      </div>

                      {/* Attached Photos */}
                      {rev.images && rev.images.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pt-1">
                          {rev.images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt="Review attachment"
                              className="w-20 h-20 rounded-xl object-cover border border-slate-200 cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => window.open(img, '_blank')}
                            />
                          ))}
                        </div>
                      )}

                      {/* Helpful & Report Actions */}
                      <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-200/60">
                        <button
                          onClick={() => handleToggleHelpful(rev._id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
                            rev.isHelpful
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : 'bg-white text-slate-600 hover:text-rose-600 border border-slate-200'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${rev.isHelpful ? 'fill-current' : ''}`} />
                          <span>Helpful {rev.helpfulCount > 0 ? `(${rev.helpfulCount})` : ''}</span>
                        </button>

                        <button
                          onClick={() => handleReportReview(rev._id)}
                          className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 font-medium"
                        >
                          <Flag className="w-3 h-3" /> Report
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Pagination Load More */}
                {reviewPage < totalPages && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() => fetchReviews(reviewPage + 1)}
                      disabled={loadingReviews}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
                    >
                      {loadingReviews ? 'Loading more reviews...' : 'Load More Reviews'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activities */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Popular Activities & Experiences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activities.map((act, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Hotels with Rating & Reviews */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Hotel className="w-5 h-5 text-emerald-600" /> Recommended Hotels & Stay Ratings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hotels.map((h, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-black text-slate-900">{h.name}</div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                      <StarRating rating={h.rating || 4.5} readOnly size="sm" />
                      <span>⭐ {h.rating || 4.5}</span>
                    </div>
                    <div className="text-xs font-extrabold text-emerald-600 mt-1">₹{h.price?.toLocaleString('en-IN')} / night</div>
                  </div>

                  <button
                    onClick={() => handleOpenReviewModal(null, h)}
                    className="w-full py-2 bg-slate-900 hover:bg-emerald-600 text-white hover:text-slate-950 font-extrabold text-xs rounded-xl transition-all text-center"
                  >
                    ✍ Rate & Review Hotel
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Weather & Interactive Map */}
        <div className="space-y-8">
          {weather && <WeatherCard weatherData={weather} />}

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Interactive Location Map</h3>
            <InteractiveMap lat={lat} lng={lng} name={name} />
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      <ReviewFormModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleReviewSubmit}
        targetName={hotelReviewTarget ? hotelReviewTarget.name : name}
        existingReview={editingReview}
        isEditing={!!editingReview}
        reviewType={hotelReviewTarget ? 'hotel' : 'destination'}
      />
    </div>
  );
}
