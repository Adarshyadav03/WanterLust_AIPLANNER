import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Heart, ArrowRight, IndianRupee } from 'lucide-react';

const destinationImageMap = {
  goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
  manali: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
  kerala: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
  alleppey: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
  mumbai: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
  ladakh: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
  leh: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
  rajasthan: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
  jaipur: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
  udaipur: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
  rishikesh: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
  uttarakhand: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
  kashmir: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80',
  srinagar: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80',
  ooty: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80',
  andaman: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
  varanasi: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
  agra: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
  coorg: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
};

const categoryDefaultMap = {
  beaches: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
  mountains: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
  nature: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
  'nature & wildlife': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
  wildlife: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
  heritage: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
  'heritage & cultural': 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
  adventure: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
};

export default function DestinationCard({ destination }) {
  const [isFavorite, setIsFavorite] = useState(false);

  const {
    _id,
    name = '',
    location = '',
    state = '',
    images = [],
    category = 'Travel',
    rating = 4.8,
    reviewCount = 120,
    averageBudget = 20000,
    description,
  } = destination;

  // Smart image lookup: check specific destination name -> check category -> check images array -> fallback
  const nameLower = name.toLowerCase();
  const catLower = category.toLowerCase();

  let cardImage = '';
  for (const [key, val] of Object.entries(destinationImageMap)) {
    if (nameLower.includes(key)) {
      cardImage = val;
      break;
    }
  }

  if (!cardImage) {
    if (categoryDefaultMap[catLower]) {
      cardImage = categoryDefaultMap[catLower];
    } else if (images && images.length > 0 && !images[0].includes('photo-1626621341517')) {
      cardImage = images[0];
    } else {
      cardImage = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
    }
  }

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Image Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={cardImage}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-slate-700/60 shadow-md">
            {category}
          </span>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`pointer-events-auto w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
              isFavorite
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-slate-950/60 text-white hover:bg-slate-950/90'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Rating overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>{rating}</span>
          <span className="text-slate-400 text-[10px]">({reviewCount})</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
        <div>
          <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold mb-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>{state || location}</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
            {name}
          </h3>
          <p className="text-slate-600 text-xs line-clamp-2 mt-1.5 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Price & CTA */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Avg. Budget</span>
            <span className="text-sm font-bold text-slate-900 flex items-center">
              <IndianRupee className="w-3.5 h-3.5" />
              {averageBudget.toLocaleString('en-IN')}
            </span>
          </div>

          <Link
            to={`/destinations/${_id || name.toLowerCase()}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white hover:text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md group-hover:shadow-emerald-500/20"
          >
            View Destination <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
