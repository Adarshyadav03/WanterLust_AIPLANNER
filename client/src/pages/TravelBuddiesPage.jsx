import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { connectionService } from '../services/connectionService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Loader from '../components/common/Loader';
import {
  Users,
  MapPin,
  Check,
  Clock,
  UserPlus,
  MessageSquare,
  X,
  Compass,
  Circle,
} from 'lucide-react';

export default function TravelBuddiesPage() {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const navigate = useNavigate();

  const [buddies, setBuddies] = useState([]);
  const [connectionStates, setConnectionStates] = useState({}); // userId -> { status, direction, connectionId }
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState('All');
  const [selectedStyle, setSelectedStyle] = useState('All');

  useEffect(() => {
    fetchBuddiesAndConnections();
  }, [selectedDestination, selectedStyle, user]);

  useEffect(() => {
    if (socket) {
      socket.on('connection_accepted', ({ sender }) => {
        fetchBuddiesAndConnections();
      });

      socket.on('connection_request', ({ sender }) => {
        fetchBuddiesAndConnections();
      });

      return () => {
        socket.off('connection_accepted');
        socket.off('connection_request');
      };
    }
  }, [socket]);

  const fetchBuddiesAndConnections = async () => {
    setLoading(true);
    try {
      const res = await API.get('/users/buddies', {
        params: {
          destination: selectedDestination,
          travelStyle: selectedStyle,
        },
      });
      const buddiesList = res.data;
      setBuddies(buddiesList);

      // Fetch status for each buddy
      const statesObj = {};
      await Promise.all(
        buddiesList.map(async (b) => {
          try {
            const st = await connectionService.getStatus(b._id);
            statesObj[b._id] = st;
          } catch (err) {
            statesObj[b._id] = { status: 'none', direction: 'none' };
          }
        })
      );
      setConnectionStates(statesObj);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (targetUserId) => {
    try {
      const res = await connectionService.sendRequest(targetUserId);
      if (res.success) {
        setConnectionStates((prev) => ({
          ...prev,
          [targetUserId]: { status: 'pending', direction: 'sent', connectionId: res.connection?._id },
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request');
    }
  };

  const handleAcceptRequest = async (targetUserId, connectionId) => {
    try {
      const res = await connectionService.acceptRequest(connectionId);
      if (res.success) {
        setConnectionStates((prev) => ({
          ...prev,
          [targetUserId]: { status: 'accepted', direction: 'sent', connectionId },
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept');
    }
  };

  const handleRejectRequest = async (targetUserId, connectionId) => {
    try {
      await connectionService.rejectRequest(connectionId);
      setConnectionStates((prev) => ({
        ...prev,
        [targetUserId]: { status: 'none', direction: 'none' },
      }));
    } catch (err) {
      alert('Failed to reject');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-white text-center space-y-3 shadow-xl">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Community Matchmaker</span>
        <h1 className="text-3xl sm:text-5xl font-black">Find Travel Buddies</h1>
        <p className="text-slate-400 text-xs max-w-xl mx-auto">
          Connect with like-minded solo travelers headed to your destination. Send connection requests and start 1-to-1 real-time conversations once accepted.
        </p>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <select
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-white text-xs font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Destinations</option>
            <option value="Manali">Manali</option>
            <option value="Goa">Goa</option>
            <option value="Kerala">Kerala</option>
            <option value="Rajasthan">Rajasthan</option>
          </select>

          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-white text-xs font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Travel Styles</option>
            <option value="Adventure">Adventure</option>
            <option value="Relaxed">Relaxed</option>
            <option value="Heritage">Heritage</option>
            <option value="Nature">Nature</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <Loader message="Finding travel buddies..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {buddies.map((buddy) => {
            const connInfo = connectionStates[buddy._id] || { status: 'none', direction: 'none' };
            const isOnline = onlineUsers.includes(buddy._id.toString());

            return (
              <div
                key={buddy._id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={buddy.avatar}
                        alt={buddy.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/30"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-white ${
                          isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                        title={isOnline ? 'Online' : 'Offline'}
                      />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">{buddy.name}, {buddy.age || 24}</h3>
                      <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" /> {buddy.city || buddy.location}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic">{buddy.bio}</p>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Target:</span>
                      <span className="font-bold text-slate-900">{buddy.destination || buddy.targetDestination}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Style:</span>
                      <span className="font-bold text-emerald-600">{buddy.travelStyle}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Budget:</span>
                      <span className="font-bold text-slate-900">{buddy.budget}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {(buddy.interests || []).map((int, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {int}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dynamic Connection Button Bar */}
                <div>
                  {connInfo.status === 'accepted' ? (
                    <div className="flex gap-2">
                      <div className="flex-grow py-2.5 bg-slate-900 text-emerald-400 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm">
                        <Check className="w-4 h-4" /> Connected
                      </div>
                      <button
                        onClick={() => navigate(`/chat/${buddy._id}`)}
                        className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20"
                        title="Start 1-to-1 Private Chat"
                      >
                        <MessageSquare className="w-4 h-4" /> Message
                      </button>
                    </div>
                  ) : connInfo.status === 'pending' && connInfo.direction === 'sent' ? (
                    <button
                      disabled
                      className="w-full py-2.5 bg-slate-800 text-slate-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-700"
                    >
                      <Clock className="w-4 h-4" /> Request Sent
                    </button>
                  ) : connInfo.status === 'pending' && connInfo.direction === 'received' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(buddy._id, connInfo.connectionId)}
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20"
                      >
                        <Check className="w-4 h-4" /> Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(buddy._id, connInfo.connectionId)}
                        className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1 border border-rose-500/20"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSendRequest(buddy._id)}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                    >
                      <UserPlus className="w-4 h-4" /> Connect Buddy
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
