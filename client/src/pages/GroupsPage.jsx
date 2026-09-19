import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import groupService from '../services/groupService';
import uploadService from '../services/uploadService';
import Loader from '../components/common/Loader';
import { Users, Plus, KeyRound, MessageSquare, Calendar, IndianRupee, Copy, Check, MapPin, Image as ImageIcon } from 'lucide-react';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [travelDates, setTravelDates] = useState('');
  const [budget, setBudget] = useState(20000);
  const [maxMembers, setMaxMembers] = useState(10);
  const [description, setDescription] = useState('');
  const [groupImage, setGroupImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const data = await groupService.getGroups();
      setGroups(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await uploadService.uploadImage({ image: reader.result });
        setGroupImage(res.url);
      } catch (err) {
        alert('Failed to upload image');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!name || !destination) return;

    try {
      const newGroup = await groupService.createGroup({
        name,
        destination,
        travelDates: travelDates || '20 Dec - 25 Dec',
        budget: Number(budget),
        maxMembers: Number(maxMembers),
        description,
        groupImage: groupImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      });
      setGroups([newGroup, ...groups]);
      setShowCreateModal(false);
      setName('');
      setDestination('');
      setGroupImage('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create group');
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;

    try {
      const res = await groupService.joinGroupByCode(inviteCodeInput.trim());
      alert(res.message || 'Joined group successfully');
      setShowJoinModal(false);
      setInviteCodeInput('');
      fetchGroups();
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid invite code');
    }
  };

  const copyToClipboard = (e, code) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900 border border-slate-800 p-8 rounded-3xl text-white shadow-xl">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Collaborative Expeditions</span>
          <h1 className="text-3xl font-black">Travel Groups & Real-Time Rooms</h1>
          <p className="text-slate-400 text-xs mt-1">Join travel groups, invite connected buddies, and plan itineraries together</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs transition-all flex items-center gap-2 border border-slate-700"
          >
            <KeyRound className="w-4 h-4 text-emerald-400" /> Join with Code
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-2xl text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Group
          </button>
        </div>
      </div>

      {/* Group Cards Grid */}
      {loading ? (
        <Loader message="Loading active groups..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group._id}
              onClick={() => navigate(`/groups/${group._id}`)}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="h-44 relative overflow-hidden bg-slate-900">
                  <img
                    src={group.groupImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'}
                    alt={group.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/90 text-slate-950 shadow-md">
                      📍 {group.destination}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4">
                    <button
                      onClick={(e) => copyToClipboard(e, group.inviteCode)}
                      className="flex items-center gap-1 text-[11px] text-white font-mono bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700/80 hover:border-emerald-500"
                    >
                      <span>{group.inviteCode}</span>
                      {copiedCode === group.inviteCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    </button>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-black drop-shadow-md line-clamp-1">{group.name}</h3>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">{group.description}</p>

                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase">Dates</div>
                        <div className="font-bold text-slate-900 text-[11px]">{group.travelDates}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase">Budget</div>
                        <div className="font-bold text-slate-900 text-[11px]">₹{group.budget?.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  </div>

                  {/* Members preview */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center -space-x-2 overflow-hidden">
                      {(group.members || []).slice(0, 4).map((m, idx) => (
                        <img
                          key={idx}
                          src={m.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                          alt={m.name}
                          className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 font-bold">
                      👥 {group.members?.length || 1} / {group.maxMembers || 10} Members
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => navigate(`/groups/${group._id}`)}
                  className="w-full py-3 bg-slate-900 group-hover:bg-emerald-600 text-white group-hover:text-slate-950 font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageSquare className="w-4 h-4" /> Open Group
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-5 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black">Create New Travel Group</h3>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Goa December Travelers"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Destination</label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Goa, Manali, Kerala"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Travel Dates</label>
                  <input
                    type="text"
                    value={travelDates}
                    onChange={(e) => setTravelDates(e.target.value)}
                    placeholder="20 Dec - 25 Dec"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Budget (₹)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Max Members</label>
                <input
                  type="number"
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Looking for travelers interested in beaches, food..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Group Banner Image</label>
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold rounded-xl cursor-pointer flex items-center gap-2 border border-slate-700">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  </label>
                  {groupImage && <span className="text-[10px] text-emerald-400 font-bold">✓ Image attached</span>}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-full py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Code Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-sm w-full space-y-5 text-white shadow-2xl text-center">
            <KeyRound className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-black">Join Group with Code</h3>
            <p className="text-xs text-slate-400">Enter unique invitation code (e.g. GOA8X29P)</p>

            <form onSubmit={handleJoinGroup} className="space-y-4">
              <input
                type="text"
                required
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value)}
                placeholder="e.g. GOA8X29P"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold text-emerald-400 uppercase tracking-widest focus:outline-none focus:border-emerald-500"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="w-full py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-500 text-slate-950 font-extrabold rounded-xl text-xs"
                >
                  Join Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
