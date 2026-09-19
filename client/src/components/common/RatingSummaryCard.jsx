import React from 'react';
import StarRating from './StarRating';
import { Star, Edit, Plus } from 'lucide-react';

export default function RatingSummaryCard({
  summary = { averageRating: 4.7, totalReviews: 128, distribution: { '5': 82, '4': 31, '3': 10, '2': 3, '1': 2 } },
  onWriteReview,
  userReview = null,
  isAuthenticated = false,
  targetName = 'Manali',
}) {
  const avg = Number(summary?.averageRating || 0);
  const total = Number(summary?.totalReviews || 0);
  const dist = summary?.distribution || { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-6">
        {/* Left Score Box */}
        <div className="text-center md:text-left space-y-2">
          <div className="flex items-baseline justify-center md:justify-start gap-2">
            <span className="text-4xl sm:text-5xl font-black text-white">{avg > 0 ? avg.toFixed(1) : 'No reviews'}</span>
            {avg > 0 && <span className="text-slate-400 text-sm font-semibold">/ 5</span>}
          </div>

          <div>
            <StarRating rating={avg} readOnly size="md" />
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {total > 0 ? `Based on ${total} traveler review${total > 1 ? 's' : ''}` : 'Be the first traveler to review'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div>
          {userReview ? (
            <button
              onClick={onWriteReview}
              className="px-5 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg"
            >
              <Edit className="w-4 h-4 text-emerald-400" /> Edit Your Review
            </button>
          ) : (
            <button
              onClick={onWriteReview}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-2xl text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Write a Review
            </button>
          )}
        </div>
      </div>

      {/* Distribution Bars */}
      <div className="space-y-2 max-w-md mx-auto md:mx-0">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = Number(dist[String(star)] || 0);
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div key={star} className="flex items-center gap-3 text-xs">
              <span className="w-12 font-bold text-slate-300 flex items-center gap-1">
                {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
              </span>

              <div className="flex-grow bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 relative">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <span className="w-8 text-right font-mono text-[11px] text-slate-400 font-semibold">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
