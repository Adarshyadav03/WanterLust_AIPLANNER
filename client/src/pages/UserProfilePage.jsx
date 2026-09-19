import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import postService from '../services/postService';
import connectionService from '../services/connectionService';
import groupService from '../services/groupService';
import {
  User,
  Mail,
  MapPin,
  Edit3,
  Compass,
  Heart,
  Camera,
  Bookmark,
  Users,
  MessageSquare,
  Sparkles,
  Luggage,
} from 'lucide-react';

export default function UserProfilePage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const [name, setName] = useState(user?.name || 'Demo Traveler');
  const [bio, setBio] = useState(user?.bio || 'Passionate traveler exploring the world with WanderLust.');
  const [location, setLocation] = useState(user?.location || 'Mumbai, India');
  const [travelStyle, setTravelStyle] = useState(user?.travelStyle || 'Adventure');
  const [avatar, setAvatar] = useState(user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');

  // Dynamic user data
  const [allPosts, setAllPosts] = useState([]);
  const [buddies, setBuddies] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [postsData, friendsData, groupsData] = await Promise.all([
        postService.getPosts(),
        connectionService.getFriends(),
        groupService.getGroups(),
      ]);
      setAllPosts(postsData);
      setBuddies(friendsData);
      setGroups(groupsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await updateProfile({ name, bio, location, travelStyle, avatar });
    setEditing(false);
  };

  const myPosts = allPosts.filter((p) => (p.author?._id || p.author) === user?._id);
  const savedPosts = allPosts.filter((p) => (p.savedBy || []).some((s) => (s._id || s) === user?._id));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-white shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="relative group">
            <img src={avatar} alt={name} className="w-24 h-24 rounded-3xl object-cover ring-4 ring-emerald-500/30" />
            <button
              onClick={() => setEditing(!editing)}
              className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 text-slate-950 rounded-xl shadow-lg hover:scale-110 transition-transform"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1 flex-grow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h1 className="text-2xl font-black">{name}</h1>
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 justify-center"
              >
                <Edit3 className="w-4 h-4 text-emerald-400" /> {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-xs">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {location}
              </span>
              <span className="bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                {travelStyle} Traveler
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="pt-4 border-t border-slate-800 text-xs text-slate-300 leading-relaxed">
          {bio}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
          <div>
            <div className="text-xl font-black text-emerald-400">3</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Trips</div>
          </div>
          <div>
            <div className="text-xl font-black text-teal-400">{buddies.length}</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Buddies</div>
          </div>
          <div>
            <div className="text-xl font-black text-cyan-400">{myPosts.length}</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Posts</div>
          </div>
          <div>
            <div className="text-xl font-black text-amber-400">{groups.length}</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Groups</div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      {editing && (
        <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Edit Profile Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Avatar Image URL</label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
          >
            Save Profile Changes
          </button>
        </form>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        {[
          { id: 'posts', label: `My Posts (${myPosts.length})`, icon: Sparkles },
          { id: 'saved', label: `Saved Posts (${savedPosts.length})`, icon: Bookmark },
          { id: 'buddies', label: `Travel Buddies (${buddies.length})`, icon: Users },
          { id: 'groups', label: `Groups (${groups.length})`, icon: MessageSquare },
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

      {/* Tab Content: MY POSTS */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {myPosts.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl text-center text-slate-400 text-xs font-bold border border-slate-200">
              You haven't posted any stories yet.
            </div>
          ) : (
            myPosts.map((post) => (
              <div key={post._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-600">📍 {post.destination}</span>
                  <span className="text-[10px] text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-800 text-xs font-medium">{post.content}</p>
                {post.images && post.images.length > 0 && (
                  <img src={post.images[0]} alt="post" className="w-full h-40 object-cover rounded-2xl" />
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content: SAVED POSTS */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedPosts.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl text-center text-slate-400 text-xs font-bold border border-slate-200">
              No saved posts found. Bookmark travel stories from Community page!
            </div>
          ) : (
            savedPosts.map((post) => (
              <div key={post._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-600">📍 {post.destination}</span>
                  <span className="text-[10px] text-slate-400">Saved Story</span>
                </div>
                <p className="text-slate-800 text-xs font-medium">{post.content}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content: TRAVEL BUDDIES */}
      {activeTab === 'buddies' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {buddies.length === 0 ? (
            <div className="col-span-full bg-white p-10 rounded-3xl text-center text-slate-400 text-xs font-bold border border-slate-200">
              No active travel connections.
            </div>
          ) : (
            buddies.map((buddy) => (
              <div key={buddy._id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                <img src={buddy.avatar} alt={buddy.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs">{buddy.name}</h4>
                  <p className="text-[10px] text-slate-500">{buddy.location || 'India'}</p>
                  <button
                    onClick={() => navigate(`/chat/${buddy._id}`)}
                    className="mt-1 text-[10px] font-bold text-emerald-600 hover:underline"
                  >
                    💬 Chat
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content: GROUPS */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {groups.map((group) => (
            <div
              key={group._id}
              onClick={() => navigate(`/groups/${group._id}`)}
              className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-all"
            >
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">{group.name}</h4>
                <p className="text-[11px] text-slate-500">📍 {group.destination} • {group.members?.length || 1} Members</p>
              </div>
              <span className="px-3 py-1 bg-slate-900 text-emerald-400 text-[10px] font-bold rounded-xl">Open</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
