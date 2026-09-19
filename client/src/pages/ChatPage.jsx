import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { messageService } from '../services/messageService';
import { connectionService } from '../services/connectionService';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import { Send, ArrowLeft, ShieldAlert, Circle, CheckCheck, MapPin } from 'lucide-react';

export default function ChatPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();

  const [buddy, setBuddy] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('accepted');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchBuddyAndHistory();
  }, [userId]);

  useEffect(() => {
    if (socket && userId) {
      // Join canonical conversation room
      socket.emit('join_conversation', { targetUserId: userId });

      socket.on('receive_private_message', (msg) => {
        if (msg.conversationId === [user?._id, userId].sort().join('_')) {
          setMessages((prev) => [...prev, msg]);
          scrollToBottom();
        }
      });

      socket.on('typing_start', ({ senderId }) => {
        if (senderId === userId) setIsTyping(true);
      });

      socket.on('typing_stop', ({ senderId }) => {
        if (senderId === userId) setIsTyping(false);
      });

      return () => {
        socket.off('receive_private_message');
        socket.off('typing_start');
        socket.off('typing_stop');
      };
    }
  }, [socket, userId, user]);

  const fetchBuddyAndHistory = async () => {
    setLoading(true);
    setError('');

    try {
      // Check connection status
      const connRes = await connectionService.getStatus(userId);
      setConnectionStatus(connRes.status);

      if (connRes.status !== 'accepted') {
        setError('You can only chat with connected travel buddies after accepting a connection request.');
        setLoading(false);
        return;
      }

      // Fetch target buddy details
      const bRes = await API.get('/users/buddies');
      const foundBuddy = (bRes.data || []).find((b) => b._id === userId || b.id === userId);
      setBuddy(
        foundBuddy || {
          _id: userId,
          name: 'Travel Buddy',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          destination: 'India',
          travelStyle: 'Explorer',
        }
      );

      // Fetch chat history
      const historyRes = await messageService.getPrivateChatHistory(userId);
      setMessages(historyRes.messages || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || connectionStatus !== 'accepted') return;

    const msgText = newMessage.trim();
    setNewMessage('');

    if (socket) {
      socket.emit('typing_stop', { receiverId: userId });
    }

    try {
      const res = await messageService.sendPrivateMessage(userId, msgText);
      const createdMsg = res.message;

      if (socket) {
        socket.emit('send_private_message', { receiverId: userId, message: msgText });
      } else {
        setMessages((prev) => [...prev, createdMsg]);
        scrollToBottom();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Message could not be delivered');
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (socket) {
      socket.emit('typing_start', { receiverId: userId });
      setTimeout(() => socket.emit('typing_stop', { receiverId: userId }), 2500);
    }
  };

  if (loading) return <Loader message="Opening secure private chat..." />;

  const isOnline = onlineUsers.includes(userId.toString());

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[85vh] flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-t-3xl text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/buddies')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <img
            src={buddy?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
            alt={buddy?.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
          />

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">{buddy?.name}</h2>
              <span className={`text-[10px] font-bold flex items-center gap-1 ${isOnline ? 'text-emerald-400' : 'text-slate-400'}`}>
                <Circle className="w-2 h-2 fill-current" /> {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Target: {buddy?.destination || buddy?.targetDestination || 'India'} • {buddy?.travelStyle || 'Traveler'}
            </p>
          </div>
        </div>
      </div>

      {/* Security Error Banner if not connected */}
      {error || connectionStatus !== 'accepted' ? (
        <div className="flex-grow bg-slate-950 border-x border-slate-800 p-8 flex flex-col items-center justify-center text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-rose-500" />
          <h3 className="text-lg font-bold text-white">Private Chat Locked</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            {error || 'You can only chat with connected travel buddies after accepting a connection request.'}
          </p>
          <button
            onClick={() => navigate('/buddies')}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all"
          >
            Back to Travel Buddies
          </button>
        </div>
      ) : (
        <>
          {/* Messages Feed */}
          <div className="flex-grow bg-slate-950 border-x border-slate-800 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Start your 1-to-1 conversation with {buddy?.name}! Discuss travel dates, itineraries, and accommodations.
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = user && (msg.sender?._id === user._id || msg.sender === user._id);

                return (
                  <div key={msg._id || idx} className={`flex max-w-md ${isMe ? 'ml-auto justify-end' : ''}`}>
                    <div>
                      <div className={`text-[10px] text-slate-400 mb-1 font-semibold ${isMe ? 'text-right' : ''}`}>
                        {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-sm ${
                          isMe
                            ? 'bg-emerald-500 text-slate-950 font-extrabold rounded-tr-none shadow-emerald-500/10'
                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {isTyping && (
              <div className="text-[10px] text-emerald-400 font-semibold italic animate-pulse">
                {buddy?.name} is typing...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-b-3xl">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder={`Message ${buddy?.name || 'travel buddy'}...`}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-2xl text-xs transition-all shadow-md shadow-emerald-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
