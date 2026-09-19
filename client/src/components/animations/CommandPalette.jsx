import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, MapPin, Briefcase, Users, MessageSquare, Shield, X, Compass, Home } from 'lucide-react';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands = [
    { id: 'home', title: 'Go to Home', icon: Home, path: '/' },
    { id: 'plan', title: 'Plan Trip with AI', icon: Sparkles, path: '/plan-trip' },
    { id: 'destinations', title: 'Explore Destinations', icon: Compass, path: '/destinations' },
    { id: 'trips', title: 'My Saved Trips', icon: Briefcase, path: '/my-trips' },
    { id: 'groups', title: 'Group Trips & Chat', icon: Users, path: '/groups' },
    { id: 'buddies', title: 'Find Travel Buddies', icon: MapPin, path: '/buddies' },
    { id: 'community', title: 'Community Feed', icon: MessageSquare, path: '/community' },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path) => {
    setIsOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white"
          >
            {/* Search Input */}
            <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
              <Search className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search... (Esc to close)"
                autoFocus
                className="w-full bg-transparent text-sm font-medium text-white placeholder-slate-500 focus:outline-none"
              />
              <kbd className="hidden sm:inline-block text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                ESC
              </kbd>
            </div>

            {/* Suggestions List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => handleSelect(cmd.path)}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl hover:bg-slate-800/80 text-left transition-colors text-slate-200 hover:text-white group"
                  >
                    <div className="p-2 rounded-xl bg-slate-800 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                      <cmd.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold">{cmd.title}</span>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 font-medium">
                  No matching actions found.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
