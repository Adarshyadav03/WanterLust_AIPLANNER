import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import TripCard from '../components/trip/TripCard';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { Briefcase, Sparkles, Plus, Calendar, Compass } from 'lucide-react';

export default function MyTripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await API.get('/trips');
      setTrips(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (id) => {
    if (window.confirm('Are you sure you want to delete this trip itinerary?')) {
      try {
        await API.delete(`/trips/${id}`);
        setTrips(trips.filter((t) => t._id !== id));
      } catch (err) {
        setTrips(trips.filter((t) => t._id !== id));
      }
    }
  };

  const filteredTrips = trips.filter((t) => (statusFilter === 'All' ? true : t.status === statusFilter));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-8 rounded-3xl text-white shadow-xl">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Personal Dashboard</span>
          <h1 className="text-3xl font-black">My Saved Trips</h1>
          <p className="text-slate-400 text-xs mt-1">Manage your AI-generated travel itineraries and group plans</p>
        </div>

        <Link
          to="/plan-trip"
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-2xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 w-fit"
        >
          <Sparkles className="w-4 h-4" /> Plan New Trip
        </Link>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
        {['All', 'Upcoming', 'Ongoing', 'Completed'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === st
                ? 'bg-slate-900 text-emerald-400 shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Trips Grid */}
      {loading ? (
        <Loader message="Loading your trips..." />
      ) : filteredTrips.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No trips found"
          message="You haven't generated or saved any trip itineraries in this category yet."
          actionLabel="Generate Trip with AI"
          onAction={() => (window.location.href = '/plan-trip')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <TripCard key={trip._id} trip={trip} onDelete={handleDeleteTrip} />
          ))}
        </div>
      )}
    </div>
  );
}
