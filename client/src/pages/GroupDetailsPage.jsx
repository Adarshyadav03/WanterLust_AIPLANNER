import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import groupService from '../services/groupService';
import uploadService from '../services/uploadService';
import Loader from '../components/common/Loader';
import InviteBuddiesModal from '../components/group/InviteBuddiesModal';
import {
  Users,
  MessageSquare,
  Calendar,
  IndianRupee,
  Copy,
  Check,
  UserPlus,
  Send,
  ArrowLeft,
  MapPin,
  Shield,
  FileText,
  Sparkles,
  Paperclip,
} from 'lucide-react';

export default function GroupDetailsPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user: currentUser } = useAuth();

  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');
  const [loading, setLoading] = useState(true);

  // Chat states
  const [inputText, setInputText] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const messagesEndRef = useRef(null);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!groupId) return;
    fetchGroupDetails();
    fetchMessages();
  }, [groupId]);

  useEffect(() => {
    if (!socket || !groupId) return;

    // Join Group room
    socket.emit('join_group', { groupId });

    const handleReceiveGroupMessage = (newMsg) => {
      if (newMsg.group === groupId || newMsg.group?._id === groupId) {
        setMessages((prev) => [...prev, newMsg]);
        scrollToBottom();
      }
    };

    const handleMemberJoined = ({ groupId: joinedGroupId, user: newMember }) => {
      if (joinedGroupId === groupId && newMember) {
        setGroup((prev) => {
          if (!prev) return prev;
          const membersList = prev.members || [];
          const exists = membersList.some((m) => (m._id || m) === (newMember._id || newMember));
          if (exists) return prev;
          return {
            ...prev,
            members: [...membersList, newMember],
          };
        });
      }
    };

    const handleTypingStart = ({ senderId, name }) => {
      if (senderId !== currentUser?._id) {
        setTypingUsers((prev) => ({ ...prev, [senderId]: name }));
      }
    };

    const handleTypingStop = ({ senderId }) => {
      setTypingUsers((prev) => {
        const copy = { ...prev };
        delete copy[senderId];
        return copy;
      });
    };

    socket.on('receive_group_message', handleReceiveGroupMessage);
    socket.on('group_member_joined', handleMemberJoined);
    socket.on('group_typing_start', handleTypingStart);
    socket.on('group_typing_stop', handleTypingStop);

    return () => {
      socket.off('receive_group_message', handleReceiveGroupMessage);
      socket.off('group_member_joined', handleMemberJoined);
      socket.off('group_typing_start', handleTypingStart);
      socket.off('group_typing_stop', handleTypingStop);
    };
  }, [socket, groupId, currentUser]);

  const fetchGroupDetails = async () => {
    try {
      const data = await groupService.getGroupById(groupId);
      setGroup(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const data = await groupService.getGroupMessages(groupId);
      setMessages(data);
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const messageText = inputText.trim();
    setInputText('');

    if (socket) {
      socket.emit('group_typing_stop', { groupId });
    }

    try {
      const savedMsg = await groupService.sendGroupMessage(groupId, { message: messageText });
      setMessages((prev) => [...prev, savedMsg]);
      scrollToBottom();
    } catch (err) {
      console.error('Group msg send error:', err);
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!socket) return;
    socket.emit('group_typing_start', { groupId });
    setTimeout(() => {
      socket.emit('group_typing_stop', { groupId });
    }, 3000);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const uploadRes = await uploadService.uploadImage({ image: reader.result });
        if (uploadRes.url) {
          const savedMsg = await groupService.sendGroupMessage(groupId, {
            message: '📷 Image Attachment',
            attachments: [uploadRes.url],
          });
          setMessages((prev) => [...prev, savedMsg]);
          scrollToBottom();
        }
      } catch (err) {
        alert('Failed to upload image');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const copyInviteCode = () => {
    if (group?.inviteCode) {
      navigator.clipboard.writeText(group.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (loading) return <Loader message="Loading Group Details..." />;
  if (!group) return <div className="p-10 text-center text-slate-400">Group not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/groups')}
        className="flex items-center gap-2 text-xs font-extrabold text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Groups
      </button>

      {/* Group Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
        <div className="h-48 sm:h-64 relative">
          <img
            src={group.groupImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'}
            alt={group.name}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4 text-white">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> {group.destination}
              </span>
              <span className="px-3 py-1 bg-slate-800/80 text-slate-300 border border-slate-700 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
                Code: {group.inviteCode}
                <button onClick={copyInviteCode} className="text-emerald-400 hover:text-emerald-300">
                  {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black">{group.name}</h1>
            <p className="text-slate-300 text-xs max-w-2xl">{group.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-2xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Invite Buddies
            </button>
          </div>
        </div>
      </div>

      {/* Group Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        {[
          { id: 'chat', label: 'Group Chat', icon: MessageSquare },
          { id: 'overview', label: 'Overview', icon: Sparkles },
          { id: 'members', label: `Members (${group.members?.length || 0})`, icon: Users },
          { id: 'itinerary', label: 'Itinerary', icon: Calendar },
          { id: 'files', label: 'Files & Media', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-emerald-400 shadow-md'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content: CHAT */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          {/* Group Chat Subheader */}
          <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h3 className="font-bold text-sm">{group.name} Chat</h3>
                <span className="text-[10px] text-slate-400">{group.members?.length || 1} online group members</span>
              </div>
            </div>
            {Object.keys(typingUsers).length > 0 && (
              <span className="text-xs text-emerald-400 font-bold italic animate-bounce">
                {Object.values(typingUsers).join(', ')} typing...
              </span>
            )}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50">
            {messages.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-slate-500 font-bold text-sm">No group messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = (msg.sender?._id || msg.sender) === currentUser?._id;
                const senderName = msg.sender?.name || 'Member';
                const senderAvatar = msg.sender?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80';

                return (
                  <div key={msg._id || idx} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <img src={senderAvatar} alt={senderName} className="w-8 h-8 rounded-full object-cover ring-2 ring-white" />
                    <div className={`max-w-md space-y-1 ${isMe ? 'items-end text-right' : ''}`}>
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[11px] font-extrabold text-slate-600">{senderName}</span>
                        <span className="text-[9px] font-bold text-slate-400">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </span>
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-emerald-600 text-white font-medium rounded-tr-none shadow-md shadow-emerald-600/20'
                            : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none shadow-sm'
                        }`}
                      >
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mb-2 space-y-2">
                            {msg.attachments.map((img, i) => (
                              <img key={i} src={img} alt="Attachment" className="rounded-xl max-h-56 w-full object-cover" />
                            ))}
                          </div>
                        )}
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
            <label className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer transition-colors">
              <Paperclip className="w-5 h-5" />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
            </label>

            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Type a group message..."
              className="flex-1 bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-5 py-3 bg-slate-900 hover:bg-emerald-600 text-white font-extrabold rounded-2xl text-xs transition-all disabled:opacity-40 flex items-center gap-2 shadow-md"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </form>
        </div>
      )}

      {/* Tab Content: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-slate-900">About this Expedition</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{group.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <Calendar className="w-5 h-5 text-emerald-600 mb-1" />
                <div className="text-[10px] text-slate-400 font-bold uppercase">Dates</div>
                <div className="font-extrabold text-slate-900 text-xs">{group.travelDates}</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <IndianRupee className="w-5 h-5 text-emerald-600 mb-1" />
                <div className="text-[10px] text-slate-400 font-bold uppercase">Estimated Budget</div>
                <div className="font-extrabold text-slate-900 text-xs">₹{group.budget?.toLocaleString('en-IN')}</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <Users className="w-5 h-5 text-emerald-600 mb-1" />
                <div className="text-[10px] text-slate-400 font-bold uppercase">Max Capacity</div>
                <div className="font-extrabold text-slate-900 text-xs">{group.maxMembers || 10} Travelers</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-5">
            <h4 className="font-extrabold text-base flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" /> Group Host
            </h4>
            <div className="flex items-center gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              <img
                src={group.owner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                alt={group.owner?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-bold text-xs">{group.owner?.name || 'Group Owner'}</div>
                <div className="text-[10px] text-emerald-400 font-semibold">Verified Host</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: MEMBERS */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900">Group Members ({group.members?.length || 0})</h3>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-extrabold rounded-xl text-xs flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> Invite Buddy
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(group.members || []).map((member) => (
              <div key={member._id} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <img
                  src={member.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20"
                />
                <div>
                  <div className="font-extrabold text-slate-900 text-xs">{member.name}</div>
                  <div className="text-[10px] text-slate-500">{member.location || 'India'}</div>
                  <span className="inline-block mt-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Member
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: ITINERARY */}
      {activeTab === 'itinerary' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4 text-center py-16">
          <Calendar className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-xl font-black text-slate-900">Group Itinerary Plan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Use the AI Trip Planner to generate day-by-day schedules for {group.destination} and share them directly into this group.
          </p>
          <button
            onClick={() => navigate('/planner')}
            className="mt-2 px-5 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white hover:text-slate-950 font-extrabold rounded-2xl text-xs transition-all"
          >
            Open AI Planner
          </button>
        </div>
      )}

      {/* Tab Content: FILES */}
      {activeTab === 'files' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4 text-center py-16">
          <FileText className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-xl font-black text-slate-900">Shared Files & Photos</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">All images uploaded in Group Chat are automatically cataloged here.</p>
        </div>
      )}

      {/* INVITE BUDDIES MODAL */}
      {showInviteModal && (
        <InviteBuddiesModal
          groupId={groupId}
          groupName={group?.name}
          inviteCode={group?.inviteCode}
          groupMembers={group?.members || []}
          pendingInvites={group?.pendingInvites || []}
          onClose={() => setShowInviteModal(false)}
          onInviteSuccess={fetchGroupDetails}
        />
      )}
    </div>
  );
}
