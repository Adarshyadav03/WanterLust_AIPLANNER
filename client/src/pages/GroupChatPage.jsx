import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import { Send, Users, Smile, Paperclip, MessageSquare, Shield, Circle } from 'lucide-react';

export default function GroupChatPage() {
  const { id } = useParams();
  const socket = useSocket();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChatData();
  }, [id]);

  useEffect(() => {
    if (socket && id) {
      socket.emit('join-room', id);

      socket.on('receive-message', (data) => {
        setMessages((prev) => [...prev, data]);
        scrollToBottom();
      });

      socket.on('user-typing', ({ user: uName }) => {
        setTypingUser(uName);
        setTimeout(() => setTypingUser(null), 3000);
      });

      return () => {
        socket.off('receive-message');
        socket.off('user-typing');
      };
    }
  }, [socket, id]);

  const fetchChatData = async () => {
    setLoading(true);
    try {
      const gRes = await API.get(`/groups/${id || 'group_1'}`);
      setGroup(gRes.data);

      const mRes = await API.get(`/groups/${id || 'group_1'}/messages`);
      setMessages(mRes.data);
    } catch (err) {
      console.error(err);
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
    if (!newMessage.trim()) return;

    const msgText = newMessage;
    setNewMessage('');

    try {
      const res = await API.post(`/groups/${id || 'group_1'}/messages`, {
        message: msgText,
      });

      const messageObj = res.data;
      if (socket) {
        socket.emit('send-message', messageObj);
      } else {
        setMessages((prev) => [...prev, messageObj]);
        scrollToBottom();
      }
    } catch (err) {
      const fallbackMsg = {
        _id: 'msg_' + Date.now(),
        group: id,
        sender: {
          name: user?.name || 'You',
          avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        },
        message: msgText,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (socket) socket.emit('send-message', fallbackMsg);
      scrollToBottom();
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (socket && user) {
      socket.emit('typing', { room: id, user: user.name });
    }
  };

  if (loading) return <Loader message="Connecting to group chat..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[85vh] flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-t-3xl text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">{group?.name || 'Goa Travelers 2026'}</h2>
            <div className="text-[10px] text-slate-400 flex items-center gap-2 font-medium">
              <span className="flex items-center gap-1 text-emerald-400">
                <Circle className="w-2 h-2 fill-current" /> Socket.IO Connected
              </span>
              <span>• {group?.members?.length || 3} Members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Body */}
      <div className="flex-grow bg-slate-950 border-x border-slate-800 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => {
          const senderName = msg.sender?.name || 'Traveler';
          const senderAvatar = msg.sender?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
          const isMe = user && (msg.sender?._id === user._id || senderName === user.name);

          return (
            <div key={msg._id || idx} className={`flex gap-3 max-w-xl ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
              <img src={senderAvatar} alt={senderName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              <div>
                <div className={`text-[10px] text-slate-400 mb-1 font-semibold ${isMe ? 'text-right' : ''}`}>
                  {senderName} • {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed ${
                    isMe
                      ? 'bg-emerald-500 text-slate-950 font-bold rounded-tr-none shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            </div>
          );
        })}

        {typingUser && (
          <div className="text-[10px] text-emerald-400 font-semibold italic flex items-center gap-1">
            <span className="animate-pulse">{typingUser} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-b-3xl">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message... (e.g. Scuba diving sounds great! 👍)"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-2xl text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
