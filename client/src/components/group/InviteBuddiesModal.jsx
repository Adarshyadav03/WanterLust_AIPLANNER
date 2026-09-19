import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  UserPlus,
  Check,
  MapPin,
  Compass,
  AlertCircle,
  RefreshCw,
  Loader2,
  Send,
  Link,
  Copy,
  Share2,
  Users,
  Shield,
} from 'lucide-react';
import connectionService from '../../services/connectionService';
import groupService from '../../services/groupService';

export default function InviteBuddiesModal({ groupId, groupName = 'Expedition Group', groupMembers = [], pendingInvites = [], inviteCode: initialCode, onClose, onInviteSuccess }) {
  const [activeTab, setActiveTab] = useState('buddies'); // 'buddies' | 'find' | 'share'

  // Tab 1: Travel Buddies State
  const [buddies, setBuddies] = useState([]);
  const [loadingBuddies, setLoadingBuddies] = useState(true);
  const [buddyError, setBuddyError] = useState(null);
  const [buddySearch, setBuddySearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sendingBatch, setSendingBatch] = useState(false);

  // Tab 2: Find Users State
  const [userQuery, setUserQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  // Tab 3: Share Link State
  const [inviteCode, setInviteCode] = useState(initialCode || '');
  const [inviteEnabled, setInviteEnabled] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // General State
  const [invitedIds, setInvitedIds] = useState(new Set());
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchInvitableBuddies();
    fetchOrCreateInviteCode();
  }, [groupId]);

  // Tab 1 Fetcher
  const fetchInvitableBuddies = async () => {
    setLoadingBuddies(true);
    setBuddyError(null);
    try {
      let friendsList = [];
      try {
        const invitableRes = await groupService.getInvitableBuddies(groupId);
        if (invitableRes?.buddies) {
          friendsList = invitableRes.buddies;
        }
      } catch (e) {
        const response = await connectionService.getFriends();
        friendsList = Array.isArray(response)
          ? response
          : Array.isArray(response?.friends)
          ? response.friends
          : Array.isArray(response?.data)
          ? response.data
          : [];
      }
      setBuddies(friendsList);
    } catch (err) {
      console.error('Failed to fetch travel buddies:', err);
      setBuddyError('Unable to load travel buddies. Please try again.');
    } finally {
      setLoadingBuddies(false);
    }
  };

  // Tab 3 Fetcher
  const fetchOrCreateInviteCode = async () => {
    try {
      const res = await groupService.generateInviteCode(groupId);
      if (res.inviteCode) {
        setInviteCode(res.inviteCode);
      }
    } catch (err) {
      console.warn('Invite code fetch warning:', err);
    }
  };

  // Tab 2 Search Handler
  const handleSearchUsers = async (q) => {
    setUserQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchingUsers(true);
    try {
      const res = await groupService.searchUsers(q);
      setSearchResults(res.users || []);
    } catch (err) {
      console.error('Search users error:', err);
    } finally {
      setSearchingUsers(false);
    }
  };

  // Single Direct User Invite
  const handleInviteSingleUser = async (targetId) => {
    try {
      await groupService.inviteBuddyToGroup(groupId, targetId);
      setInvitedIds((prev) => new Set(prev).add(targetId));
      showToast('Invitation sent successfully!');
      if (onInviteSuccess) onInviteSuccess();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send invite', 'error');
    }
  };

  // Batch Invites for Tab 1
  const toggleSelectBuddy = (buddyId) => {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(buddyId)) copy.delete(buddyId);
      else copy.add(buddyId);
      return copy;
    });
  };

  const handleSendBatchInvitations = async () => {
    const userIds = Array.from(selectedIds);
    if (userIds.length === 0) return;

    setSendingBatch(true);
    try {
      await groupService.inviteBuddyToGroup(groupId, { userIds });
      setInvitedIds((prev) => {
        const copy = new Set(prev);
        userIds.forEach((id) => copy.add(id));
        return copy;
      });
      setSelectedIds(new Set());
      showToast(`Successfully sent ${userIds.length} invitation(s)!`);
      if (onInviteSuccess) onInviteSuccess();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send invitations', 'error');
    } finally {
      setSendingBatch(false);
    }
  };

  // Copy & Share Handlers
  const getInviteUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    return `${origin}/groups/join/${inviteCode || 'MANALI8X2'}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getInviteUrl());
    setCopiedLink(true);
    showToast('Invite link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode || 'MANALI8X2');
    setCopiedCode(true);
    showToast('Group invite code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleNativeShare = async () => {
    const link = getInviteUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${groupName} on WanderLust`,
          text: `Join my trip to ${groupName} on WanderLust!`,
          url: link,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleToggleInviteLink = async () => {
    try {
      const res = await groupService.toggleInviteLink(groupId);
      setInviteEnabled(res.inviteEnabled);
      showToast(res.inviteEnabled ? 'Group invite link enabled' : 'Group invite link disabled');
    } catch (err) {
      setInviteEnabled((prev) => !prev);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Lookup helper sets
  const memberIdSet = new Set(groupMembers.map((m) => (typeof m === 'object' ? m._id || m.id : m)?.toString()));
  const pendingInviteIdSet = new Set(pendingInvites.map((p) => (typeof p === 'object' ? p._id || p.id || p.user : p)?.toString()));

  const filteredBuddies = buddies.filter((buddy) => {
    if (!buddySearch.trim()) return true;
    const q = buddySearch.toLowerCase();
    return (
      buddy.name?.toLowerCase().includes(q) ||
      buddy.location?.toLowerCase().includes(q) ||
      buddy.targetDestination?.toLowerCase().includes(q) ||
      buddy.travelStyle?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full max-h-[88vh] flex flex-col text-white shadow-2xl overflow-hidden relative">
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-2 transition-all ${
              toastMessage.type === 'error'
                ? 'bg-rose-500/90 text-white border border-rose-400'
                : 'bg-emerald-500/90 text-slate-950 border border-emerald-400'
            }`}
          >
            {toastMessage.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
            {toastMessage.text}
          </div>
        )}

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-400" />
              Invite People to {groupName}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Invite friends to join your travel expedition group.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Navigation Tabs */}
        <div className="grid grid-cols-3 bg-slate-950/80 p-1.5 border-b border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('buddies')}
            className={`py-2.5 rounded-2xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'buddies' ? 'bg-slate-900 text-emerald-400 shadow-md border border-slate-800' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Travel Buddies
          </button>
          <button
            onClick={() => setActiveTab('find')}
            className={`py-2.5 rounded-2xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'find' ? 'bg-slate-900 text-emerald-400 shadow-md border border-slate-800' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" /> Find Users
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`py-2.5 rounded-2xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'share' ? 'bg-slate-900 text-emerald-400 shadow-md border border-slate-800' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" /> Share Invite
          </button>
        </div>

        {/* TAB 1: TRAVEL BUDDIES */}
        {activeTab === 'buddies' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-4 bg-slate-950/40 border-b border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={buddySearch}
                  onChange={(e) => setBuddySearch(e.target.value)}
                  placeholder="Search connected buddies by name, location, destination..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-3">
              {loadingBuddies ? (
                <div className="py-12 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">Fetching connected travel buddies...</p>
                </div>
              ) : buddyError ? (
                <div className="py-8 text-center space-y-3 bg-slate-950/60 rounded-2xl p-6 border border-slate-800">
                  <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
                  <p className="text-xs text-slate-300 font-semibold">{buddyError}</p>
                  <button
                    onClick={fetchInvitableBuddies}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs inline-flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retry
                  </button>
                </div>
              ) : filteredBuddies.length === 0 ? (
                <div className="py-10 text-center space-y-4 bg-slate-950/60 rounded-2xl p-6 border border-slate-800/80">
                  <Compass className="w-10 h-10 text-emerald-400 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-white">No connected buddies yet</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      You can still invite anyone to join this travel group! Use Search or Share your link below:
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('find')}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-md"
                    >
                      Find WanderLust Users
                    </button>
                    <button
                      onClick={() => setActiveTab('share')}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-extrabold rounded-xl text-xs transition-all"
                    >
                      Share Group Invite Link
                    </button>
                  </div>
                </div>
              ) : (
                filteredBuddies.map((buddy) => {
                  const buddyIdStr = (buddy._id || buddy.id)?.toString();
                  const isAlreadyMember = memberIdSet.has(buddyIdStr);
                  const isAlreadyInvited = pendingInviteIdSet.has(buddyIdStr) || invitedIds.has(buddyIdStr);
                  const isSelected = selectedIds.has(buddyIdStr);

                  return (
                    <div
                      key={buddyIdStr}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all gap-4 ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                          : 'bg-slate-950 hover:bg-slate-950/80 border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={buddy.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                          alt={buddy.name}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-800 flex-shrink-0"
                        />
                        <div className="min-w-0 space-y-1">
                          <h4 className="font-extrabold text-xs text-white truncate">{buddy.name}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap">
                            {buddy.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-emerald-400" />
                                {buddy.location}
                              </span>
                            )}
                            {buddy.targetDestination && (
                              <span className="text-emerald-400 font-semibold">• {buddy.targetDestination}</span>
                            )}
                            {buddy.travelStyle && (
                              <span className="bg-slate-800 px-2 py-0.5 rounded-md text-slate-300">{buddy.travelStyle}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {isAlreadyMember ? (
                          <span className="px-3.5 py-1.5 bg-slate-800/80 text-slate-400 border border-slate-700 rounded-xl text-[11px] font-extrabold inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> Member
                          </span>
                        ) : isAlreadyInvited ? (
                          <span className="px-3.5 py-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 rounded-xl text-[11px] font-extrabold inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> Invited
                          </span>
                        ) : isSelected ? (
                          <button
                            onClick={() => toggleSelectBuddy(buddyIdStr)}
                            className="px-4 py-1.5 bg-emerald-500 text-slate-950 font-extrabold rounded-xl text-xs inline-flex items-center gap-1 transition-all shadow-md shadow-emerald-500/20"
                          >
                            <Check className="w-3.5 h-3.5" /> Selected
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleSelectBuddy(buddyIdStr)}
                            className="px-4 py-1.5 bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-200 border border-slate-700 hover:border-emerald-500/40 rounded-xl text-xs font-extrabold transition-all"
                          >
                            + Invite
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Batch Action Footer for Tab 1 */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
              <div className="text-xs font-bold text-slate-300">
                Selected: <span className="text-emerald-400 font-extrabold">{selectedIds.size}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendBatchInvitations}
                  disabled={selectedIds.size === 0 || sendingBatch}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  {sendingBatch ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Invitations ({selectedIds.size})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FIND USERS */}
        {activeTab === 'find' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-5 bg-slate-950/40 border-b border-slate-800 space-y-3">
              <div>
                <h3 className="font-extrabold text-sm text-white">Find WanderLust Users</h3>
                <p className="text-[11px] text-slate-400">Search registered travelers by name or email to invite directly.</p>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  placeholder="🔍 Search by name or email..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-3">
              {searchingUsers ? (
                <div className="py-12 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">Searching registered users...</p>
                </div>
              ) : !userQuery.trim() ? (
                <div className="py-12 text-center space-y-3 bg-slate-950/40 rounded-2xl p-6 border border-slate-800/60">
                  <Search className="w-10 h-10 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400 font-bold">Type a name or email address above to search registered travelers.</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-12 text-center space-y-3 bg-slate-950/40 rounded-2xl p-6 border border-slate-800/60">
                  <Compass className="w-10 h-10 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400 font-bold">No registered users found matching "{userQuery}".</p>
                </div>
              ) : (
                searchResults.map((user) => {
                  const uIdStr = (user._id || user.id)?.toString();
                  const isAlreadyMember = memberIdSet.has(uIdStr);
                  const isAlreadyInvited = pendingInviteIdSet.has(uIdStr) || invitedIds.has(uIdStr);

                  return (
                    <div
                      key={uIdStr}
                      className="flex items-center justify-between p-4 bg-slate-950 hover:bg-slate-950/80 border border-slate-800/80 rounded-2xl transition-all gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                          alt={user.name}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-800 flex-shrink-0"
                        />
                        <div className="min-w-0 space-y-1">
                          <h4 className="font-extrabold text-xs text-white truncate">{user.name}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap">
                            {user.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-emerald-400" />
                                {user.location}
                              </span>
                            )}
                            {user.targetDestination && (
                              <span className="text-emerald-400 font-semibold">• {user.targetDestination}</span>
                            )}
                            {user.travelStyle && (
                              <span className="bg-slate-800 px-2 py-0.5 rounded-md text-slate-300">{user.travelStyle}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {isAlreadyMember ? (
                          <span className="px-3.5 py-1.5 bg-slate-800/80 text-slate-400 border border-slate-700 rounded-xl text-[11px] font-extrabold inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> Member
                          </span>
                        ) : isAlreadyInvited ? (
                          <span className="px-3.5 py-1.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 rounded-xl text-[11px] font-extrabold inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> Invited
                          </span>
                        ) : (
                          <button
                            onClick={() => handleInviteSingleUser(uIdStr)}
                            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
                          >
                            + Invite to Group
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SHARE INVITE */}
        {activeTab === 'share' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Link className="w-5 h-5 text-emerald-400" />
                Invite Friends Using Link
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Anyone with this invite link can view group details and join your trip.
              </p>
            </div>

            {/* Invite Link Box */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Group Invite Link</div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getInviteUrl()}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400 font-mono focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-md inline-flex items-center gap-1.5 flex-shrink-0"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  onClick={handleNativeShare}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs inline-flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4 text-emerald-400" /> Share Link
                </button>

                <button
                  onClick={handleToggleInviteLink}
                  className={`text-[11px] font-bold ${inviteEnabled ? 'text-rose-400 hover:underline' : 'text-emerald-400 hover:underline'}`}
                >
                  {inviteEnabled ? 'Disable Link' : 'Re-enable Link'}
                </button>
              </div>
            </div>

            {/* Invite Code Box */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Group Invite Code</div>
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl">
                <span className="font-mono font-black text-lg text-emerald-400 tracking-widest">
                  {inviteCode || 'MANALI8X2'}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition-all"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Copied Code!' : 'Copy Code'}
                </button>
              </div>
            </div>

            <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">
                When friends open this link, they will see a group preview page with a <strong className="text-emerald-400">[ Join Group ]</strong> button to join your trip directly.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
