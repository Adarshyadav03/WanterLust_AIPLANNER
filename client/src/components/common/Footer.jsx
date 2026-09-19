import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, Send, Shield, Sparkles, MapPin } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-emerald-500/20 bg-slate-900 border border-emerald-500/30">
                <img src={logoImg} alt="WanderLust Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-2xl font-extrabold text-white">
                Wander<span className="text-emerald-400">Lust</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Your AI-powered travel companion for unforgettable journeys. Generate smart day-by-day itineraries, track trip budgets in real-time, connect with travel buddies, and coordinate group trips effortlessly.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5" /> Powered by Google Gemini AI
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/destinations" className="hover:text-emerald-400 transition-colors">
                  Explore Destinations
                </Link>
              </li>
              <li>
                <Link to="/plan-trip" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  AI Trip Planner <Sparkles className="w-3 h-3 text-emerald-400" />
                </Link>
              </li>
              <li>
                <Link to="/my-trips" className="hover:text-emerald-400 transition-colors">
                  My Saved Trips
                </Link>
              </li>
              <li>
                <Link to="/buddies" className="hover:text-emerald-400 transition-colors">
                  Find Travel Buddies
                </Link>
              </li>
              <li>
                <Link to="/groups" className="hover:text-emerald-400 transition-colors">
                  Group Trips & Chat
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4">Categories</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/destinations?category=Mountains" className="hover:text-emerald-400 transition-colors">
                  Himalayan Mountains
                </Link>
              </li>
              <li>
                <Link to="/destinations?category=Beaches" className="hover:text-emerald-400 transition-colors">
                  Coastal Beaches
                </Link>
              </li>
              <li>
                <Link to="/destinations?category=Heritage" className="hover:text-emerald-400 transition-colors">
                  Royal Heritage & Forts
                </Link>
              </li>
              <li>
                <Link to="/destinations?category=Adventure" className="hover:text-emerald-400 transition-colors">
                  Adventure Sports
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-emerald-400 transition-colors">
                  Travel Community Posts
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4">Stay Inspired</h3>
            <p className="text-xs text-slate-400 mb-3">
              Subscribe for weekly AI travel recommendations and destination guides.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} WanderLust. Built for Final Year MCA Project & Placement Portfolio.
          </div>
          <div className="flex items-center gap-6">
            <span>React.js</span>
            <span>Node.js</span>
            <span>Express</span>
            <span>MongoDB</span>
            <span>Socket.IO</span>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
