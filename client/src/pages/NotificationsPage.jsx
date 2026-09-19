import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { connectionService } from '../services/connectionService';
import groupService from '../services/groupService';
import { useSocket } from '../context/SocketContext';
import Loader from '../components/common/Loader';
import {
  Bell,
  CheckCheck,
  Users,
  UserCheck,
  MessageSquare,
  Sparkles,
  Check,
  X,
  ArrowRight,
  UserPlus,
  MapPin,
} from 'lucide-react';

export default function NotificationsPage() {
  const { socket, clearUnreadCount } = useSocket();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState({}); // { [notifId]: 'loading' | 'accepted' | 'declined' }

  useEffect(() => {
    fetchNotifications();
    clearUnreadCount();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('connection_request', fetchNotifications);
      socket.on('connection_accepted', fetchNotifications);
      socket.on('new_message_notification', fetchNotifications);
      socket.on('group_invitation', fetchNotifications);

      return () => {
        socket.off('connection_request', fetchNotifications);
        socket.off('connection_accepted', fetchNotifications);
        socket.off('new_message_notification', fetchNotifications);
        socket.off('group_invitation', fetchNotifications);
      };
    }
  }, [socket]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(notifications.map((n) => ({ ...n, read: true, isRead: true })));
    } catch (err) {
      setNotifications(notifications.map((n) => ({ ...n, read: true, isRead: true })));
    }
  };

  const handleAcceptConnection = async (connectionId) => {
    try {
      await connectionService.acceptRequest(connectionId);
      alert('Connection request accepted!');
      fetchNotifications();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept connection');
    }
  };

  const handleRejectConnection = async (connectionId) => {
    try {
      await connectionService.rejectRequest(connectionId);
      fetchNotifications();
    } catch (err) {
      alert('Failed to reject connection');
    }
  };

  const handleAcceptGroupInvite = async (groupId, notifId) => {
    setActionStatus((prev) => ({ ...prev, [notifId]: 'loading' }));
    try {
      await groupService.acceptGroupInvite(groupId);
      setActionStatus((prev) => ({ ...prev, [notifId]: 'accepted' }));
      setTimeout(() => {
        navigate(`/groups/${groupId}`);
      }, 800);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept group invitation');
      setActionStatus((prev) => ({ ...prev, [notifId]: null }));
    }
  };

  const handleDeclineGroupInvite = async (groupId, notifId) => {
    setActionStatus((prev) => ({ ...prev, [notifId]: 'loading' }));
    try {
      await groupService.rejectGroupInvite(groupId);
      setActionStatus((prev) => ({ ...prev, [notifId]: 'declined' }));
      fetchNotifications();
    } catch (err) {
      alert('Failed to decline group invitation');
      setActionStatus((prev) => ({ ...prev, [notifId]: null }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-3xl text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black">Notifications</h1>
            <p className="text-xs text-slate-400">Real-time travel buddy requests and group invitation alerts</p>
          </div>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-xl flex items-center gap-1.5 transition-all"
        >
          <CheckCheck className="w-4 h-4 text-emerald-400" /> Mark all read
        </button>
      </div>

      {loading ? (
        <Loader message="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-2">
          <Bell className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Notifications Yet</h3>
          <p className="text-xs text-slate-500">When travel buddies connect or invite you to groups, notifications will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const isRead = n.read || n.isRead;
            const senderName = n.sender?.name || 'Traveler';
            const senderAvatar = n.sender?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
            const currentAction = actionStatus[n._id];

            return (
              <div
                key={n._id}
                className={`p-5 rounded-3xl border transition-all space-y-3 ${
                  !isRead ? 'bg-slate-900 border-slate-700 text-white shadow-md' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img src={senderAvatar} alt={senderName} className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20" />
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-extrabold ${!isRead ? 'text-emerald-400' : 'text-slate-900'}`}>
                        {n.type === 'GROUP_INVITE'
                          ? 'Group Expedition Invitation'
                          : n.type === 'CONNECTION_REQUEST'
                          ? 'Travel Buddy Request'
                          : n.type === 'CONNECTION_ACCEPTED'
                          ? 'Request Accepted'
                          : 'Notification'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {new Date(n.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed font-medium mt-1">{n.message}</p>
                  </div>
                </div>

                {/* Group Invitation Action Buttons */}
                {n.type === 'GROUP_INVITE' && n.referenceId && (
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-800/60">
                    {currentAction === 'accepted' ? (
                      <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-extrabold rounded-xl flex items-center gap-1.5">
                        <Check className="w-4 h-4" /> Joined Group! Opening chat...
                      </span>
                    ) : currentAction === 'declined' ? (
                      <span className="px-4 py-1.5 bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold rounded-xl">
                        Invitation Declined
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAcceptGroupInvite(n.referenceId, n._id)}
                          disabled={currentAction === 'loading'}
                          className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
                        >
                          <Check className="w-4 h-4" /> Accept
                        </button>
                        <button
                          onClick={() => handleDeclineGroupInvite(n.referenceId, n._id)}
                          disabled={currentAction === 'loading'}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1 border border-slate-700 transition-all"
                        >
                          <X className="w-4 h-4" /> Decline
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Connection Request Action Buttons */}
                {n.type === 'CONNECTION_REQUEST' && n.referenceId && (
                  <div className="flex gap-2 pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => handleAcceptConnection(n.referenceId)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1 shadow-md"
                    >
                      <Check className="w-4 h-4" /> Accept Request
                    </button>
                    <button
                      onClick={() => handleRejectConnection(n.referenceId)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1 border border-slate-700"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}

                {/* Connection Accepted Action */}
                {n.type === 'CONNECTION_ACCEPTED' && n.sender && (
                  <div className="pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => navigate(`/chat/${n.sender._id || n.sender}`)}
                      className="px-4 py-2 bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4" /> Start 1-to-1 Chat <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
