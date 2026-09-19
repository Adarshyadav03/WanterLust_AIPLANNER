import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  Sparkles,
  MapPin,
  Users,
  MessageSquare,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  Bell,
  Heart,
  Briefcase,
} from 'lucide-react';

import logoImg from '../../assets/logo.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };


  return (
    <header className={`sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 text-white transition-all duration-300 ${isScrolled ? 'shadow-xl shadow-slate-950/50 py-0' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-emerald-500/20 bg-slate-900 border border-emerald-500/30"
            >
              <img src={logoImg} alt="WanderLust Logo" className="w-full h-full object-cover" />
            </motion.div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Wander<span className="text-emerald-400">Lust</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 tracking-wider font-semibold uppercase -mt-1">
                Travel Smarter. Together.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {[
              { path: '/', label: 'Home' },
              { path: '/destinations', label: 'Destinations' },
              { path: '/my-trips', label: 'My Trips' },
              { path: '/groups', label: 'Groups' },
              { path: '/buddies', label: 'Travel Buddies' },
              { path: '/messages', label: 'Messages' },
              { path: '/community', label: 'Community' },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                  isActive(link.path)
                    ? 'text-emerald-400 bg-slate-900/90 shadow-sm border border-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <span>{link.label}</span>
                {isActive(link.path) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}

            {/* Glowing AI Trip Planner CTA */}
            <Link
              to="/plan-trip"
              className={`ml-1 px-3.5 py-2 rounded-xl text-xs xl:text-sm font-extrabold whitespace-nowrap flex items-center gap-2 transition-all duration-300 ${
                isActive('/plan-trip')
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/10 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-500/25 hover:shadow-md hover:shadow-emerald-500/20'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Plan Trip (AI)</span>
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  isActive('/admin') ? 'text-amber-400 bg-amber-400/10 border border-amber-400/30' : 'text-amber-400/90 hover:bg-amber-400/10'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
          </nav>


          {/* Right Action Icons & Auth */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/notifications"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-950 animate-ping" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-950" />
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-900 transition-colors focus:outline-none"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/50"
                  />
                  <div className="text-left hidden xl:block">
                    <div className="text-xs font-semibold text-slate-200 line-clamp-1">{user.name}</div>
                    <div className="text-[10px] text-emerald-400 font-medium capitalize">{user.role || 'Traveler'}</div>
                  </div>
                </button>

                {/* Dropdown menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl py-2 text-sm z-50"
                    >
                      <div className="px-4 py-2 border-b border-slate-800">
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/60"
                      >
                        <User className="w-4 h-4 text-emerald-400" />
                        View Profile
                      </Link>
                      <Link
                        to="/my-trips"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/60"
                      >
                        <Briefcase className="w-4 h-4 text-teal-400" />
                        My Saved Trips
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-amber-400 hover:bg-amber-400/10"
                        >
                          <Shield className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <div className="border-t border-slate-800 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-rose-400 hover:bg-rose-500/10 text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2 overflow-hidden"
          >

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-900"
          >
            Home
          </Link>
          <Link
            to="/destinations"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-900"
          >
            Destinations
          </Link>
          <Link
            to="/plan-trip"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
          >
            <Sparkles className="w-5 h-5" />
            AI Trip Planner
          </Link>
          <Link
            to="/my-trips"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-900"
          >
            My Trips
          </Link>
          <Link
            to="/groups"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-900"
          >
            Group Trips & Chat
          </Link>
          <Link
            to="/buddies"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-900"
          >
            Find Travel Buddies
          </Link>
          <Link
            to="/community"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-base font-medium text-slate-200 hover:bg-slate-900"
          >
            Community Posts
          </Link>

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-semibold text-amber-400 bg-amber-400/10"
            >
              <Shield className="w-5 h-5" />
              Admin Dashboard
            </Link>
          )}

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-white">{user.name}</div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-xs font-semibold text-rose-400 bg-rose-500/10 rounded-xl"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 w-full">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 font-semibold text-slate-200 bg-slate-900 rounded-xl"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 font-semibold bg-emerald-500 text-slate-950 rounded-xl"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

        </motion.div>
      )}
    </AnimatePresence>


    </header>
  );
}


