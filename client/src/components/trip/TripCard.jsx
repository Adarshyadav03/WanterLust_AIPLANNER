import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, IndianRupee, Sparkles, Trash2, Share2, ArrowRight } from 'lucide-react';

export default function TripCard({ trip, onDelete }) {
  const {
    _id,
    tripTitle,
    destination,
    startDate,
    endDate,
    travelersCount = 2,
    budget = 20000,
    status = 'Upcoming',
    itinerary = [],
  } = trip;

  const getStatusColor = (st) => {
    if (st === 'Ongoing') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (st === 'Completed') return 'bg-slate-800 text-slate-400 border-slate-700';
    return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
  };

  const formattedStartDate = new Date(startDate || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(status)}`}>
            {status}
          </span>
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> AI Generated
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">{tripTitle || `${destination} Trip`}</h3>
        <p className="text-sm text-slate-400 mb-6">{destination} • {itinerary.length || 5} Days Itinerary</p>

        <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 mb-6">
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Start Date</div>
              <div className="text-xs font-bold">{formattedStartDate}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <IndianRupee className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Budget</div>
              <div className="text-xs font-bold">₹{budget.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={() => onDelete(_id)}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
              title="Delete Trip"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <Link
          to={`/itinerary/${_id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
        >
          View Itinerary <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
