import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import DestinationCard from '../components/destination/DestinationCard';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { Search, Filter, SlidersHorizontal, Mountain, Compass } from 'lucide-react';

const categories = ['All', 'Mountains', 'Beaches', 'Heritage', 'Adventure', 'Wildlife', 'Nature'];

export default function DestinationDiscoveryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    fetchDestinations();
  }, [selectedCategory, sortBy]);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const res = await API.get('/destinations', {
        params: {
          category: selectedCategory,
          search: search,
          sort: sortBy,
        },
      });
      setDestinations(res.data);
    } catch (err) {
      console.error('Failed to fetch destinations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDestinations();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-8 sm:p-12 rounded-3xl text-center space-y-4 shadow-xl">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Explore Top Locations</span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Discover Your Next Adventure</h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Browse top Himalayan peaks, golden tropical beaches, royal Rajasthani forts, and pristine natural backwaters.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto pt-4 flex gap-2">
          <div className="relative w-full">
            <Search className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search destinations, activities, or experiences..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-2xl text-sm transition-all shadow-md shadow-emerald-500/20"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter & Sort Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSearchParams(cat !== 'All' ? { category: cat } : {});
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-emerald-400 shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="rating">Highest Rated</option>
            <option value="budget-low">Budget: Low to High</option>
            <option value="budget-high">Budget: High to Low</option>
          </select>
        </div>
      </div>

      {/* Destination Grid */}
      {loading ? (
        <Loader message="Loading destinations..." />
      ) : destinations.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No destinations match your search"
          message="Try adjusting your category filters or search keywords."
          actionLabel="Clear Filters"
          onAction={() => {
            setSelectedCategory('All');
            setSearch('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {destinations.map((dest) => (
            <DestinationCard key={dest._id} destination={dest} />
          ))}
        </div>
      )}
    </div>
  );
}
