import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import API from '../services/api';
import Loader from '../components/common/Loader';
import InteractiveMap from '../components/map/InteractiveMap';
import WeatherCard from '../components/weather/WeatherCard';
import BudgetChart from '../components/budget/BudgetChart';
import {
  Calendar,
  Clock,
  IndianRupee,
  MapPin,
  Sparkles,
  Users,
  Plus,
  Trash2,
  Edit2,
  Share2,
  Save,
  CheckCircle2,
  Navigation,
} from 'lucide-react';

export default function GeneratedItineraryPage() {
  const { id } = useParams();
  const location = useLocation();

  const [trip, setTrip] = useState(null);
  const [activeTab, setActiveTab] = useState('itinerary');
  const [selectedDay, setSelectedDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New activity form
  const [newTime, setNewTime] = useState('02:00 PM');
  const [newActivity, setNewActivity] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCost, setNewCost] = useState(500);

  useEffect(() => {
    fetchTripData();
  }, [id]);

  const fetchTripData = async () => {
    setLoading(true);
    try {
      if (location.state && location.state.itinerary) {
        const itin = location.state.itinerary;
        setTrip({
          _id: id || 'trip_1',
          tripTitle: itin.tripTitle || 'Generated Itinerary',
          destination: itin.destination || 'Manali',
          startDate: new Date(),
          endDate: new Date(Date.now() + 5 * 86400000),
          travelersCount: 4,
          budget: itin.totalBudget || 20000,
          itinerary: itin.days || [],
          inviteCode: 'TRIP2026',
        });
      } else {
        const res = await API.get(`/trips/${id || 'trip_1'}`);
        setTrip(res.data);
      }

      // Fetch weather
      const wRes = await API.get(`/destinations/${trip?.destination || 'Manali'}/weather`);
      setWeather(wRes.data);
    } catch (err) {
      console.error('Failed to load trip', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!newActivity) return;

    const updatedItinerary = [...(trip.itinerary || [])];
    const dayObj = updatedItinerary.find((d) => d.day === selectedDay);

    if (dayObj) {
      dayObj.activities.push({
        time: newTime,
        activity: newActivity,
        description: newDesc || 'User added custom activity',
        estimatedCost: Number(newCost),
        location: trip.destination,
      });
      setTrip({ ...trip, itinerary: updatedItinerary });
      setShowAddModal(false);
      setNewActivity('');
      setNewDesc('');
    }
  };

  const handleDeleteActivity = (dayNum, actIdx) => {
    const updatedItinerary = [...(trip.itinerary || [])];
    const dayObj = updatedItinerary.find((d) => d.day === dayNum);
    if (dayObj) {
      dayObj.activities.splice(actIdx, 1);
      setTrip({ ...trip, itinerary: updatedItinerary });
    }
  };

  if (loading) return <Loader message="Preparing your custom itinerary..." />;
  if (!trip) return <div className="text-center py-20 text-white">Trip itinerary not found</div>;

  const currentDayData = (trip.itinerary || []).find((d) => d.day === selectedDay) || (trip.itinerary || [])[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-10 rounded-3xl text-white shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-emerald-400" /> AI Customized Travel Plan
            </div>
            <h1 className="text-3xl sm:text-4xl font-black">{trip.tripTitle || `${trip.destination} Trip`}</h1>
            <p className="text-slate-400 text-xs mt-1">
              {trip.destination} • {trip.itinerary?.length || 5} Days • Share Code: <span className="text-emerald-400 font-mono font-bold">{trip.inviteCode || 'TRIP2026'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => alert(`Invitation Code: ${trip.inviteCode || 'TRIP2026'}. Share this with friends!`)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Share2 className="w-4 h-4 text-emerald-400" /> Share Code
            </button>
            <Link
              to="/budget"
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20"
            >
              <IndianRupee className="w-4 h-4" /> Manage Expenses
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['itinerary', 'map', 'budget', 'weather'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'itinerary' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Day Pills Selector */}
          <div className="space-y-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm h-fit">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest px-2">Days Schedule</h3>
            <div className="space-y-2">
              {(trip.itinerary || []).map((d) => (
                <button
                  key={d.day}
                  onClick={() => setSelectedDay(d.day)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all ${
                    selectedDay === d.day
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-bold text-emerald-400 uppercase">Day {d.day}</div>
                  <div className="text-xs font-extrabold line-clamp-1">{d.title}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{d.activities?.length || 0} Activities</div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Activities Timeline */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Day {currentDayData?.day}</span>
                <h2 className="text-2xl font-black text-slate-900">{currentDayData?.title}</h2>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white hover:text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" /> Add Activity
              </button>
            </div>

            {/* Activities List */}
            <div className="space-y-4">
              {(currentDayData?.activities || []).map((act, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-emerald-300 transition-all space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-emerald-600 font-extrabold">
                      <Clock className="w-4 h-4" /> {act?.time || '09:00 AM'}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-900 font-bold">Est: ₹{typeof act?.estimatedCost === 'number' && !isNaN(act.estimatedCost) ? act.estimatedCost : 500}</span>
                      {currentDayData?.day && (
                        <button
                          onClick={() => handleDeleteActivity(currentDayData.day, idx)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{act?.activity || 'Activity'}</h3>
                    <p className="text-slate-600 text-xs mt-1 leading-relaxed">{act?.description || 'Sightseeing and local exploration'}</p>
                  </div>

                  {act?.location && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{act.location}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Map Tab */}
      {activeTab === 'map' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xl font-bold text-slate-900">Trip Route & Activity Markers</h3>
          <InteractiveMap lat={32.2432} lng={77.1892} name={trip.destination} />
        </div>
      )}

      {/* Budget Tab */}
      {activeTab === 'budget' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Trip Budget Breakdown</h3>
              <p className="text-xs text-slate-500">Allocated budget: ₹{trip.budget?.toLocaleString('en-IN')}</p>
            </div>
            <Link to="/budget" className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl">
              Open Full Expense Tracker
            </Link>
          </div>
          <BudgetChart />
        </div>
      )}

      {/* Weather Tab */}
      {activeTab === 'weather' && (
        <div className="max-w-2xl mx-auto">
          <WeatherCard weatherData={weather} />
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-5 text-white shadow-2xl">
            <h3 className="text-xl font-black">Add Activity for Day {selectedDay}</h3>

            <form onSubmit={handleAddActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Time</label>
                <input
                  type="text"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="02:00 PM"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Activity Name</label>
                <input
                  type="text"
                  required
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  placeholder="e.g. Scuba diving session"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Brief summary of activity..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Estimated Cost (INR)</label>
                <input
                  type="number"
                  required
                  value={newCost}
                  onChange={(e) => setNewCost(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
