import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { messageService } from '../services/messageService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Loader from '../components/common/Loader';
import { MessageSquare, Circle, ArrowRight } from 'lucide-react';

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await messageService.getConversations();
      setConversations(res.conversations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Loading your conversations..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Messages & Chats</h1>
            <p className="text-xs text-slate-400">Private 1-to-1 conversations with connected travel buddies</p>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      {conversations.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4">
          <MessageSquare className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Active Conversations</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Connect with travel buddies on the Travel Buddies page. Once accepted, you can initiate private real-time chats here.
          </p>
          <button
            onClick={() => navigate('/buddies')}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-md"
          >
            Find Travel Buddies
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => {
            const partner = (conv.participants || []).find(
              (p) => (p._id || p).toString() !== (user?._id || '').toString()
            ) || { name: 'Travel Buddy', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' };

            const isOnline = onlineUsers.includes((partner._id || partner).toString());

            return (
              <div
                key={conv._id}
                onClick={() => navigate(`/chat/${partner._id || partner}`)}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={partner.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                      alt={partner.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white ${
                        isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-sm">{partner.name}</h3>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                        {partner.targetDestination || 'Traveler'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">{conv.lastMessage || 'No messages yet'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {new Date(conv.lastMessageAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
