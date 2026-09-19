import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import groupService from '../services/groupService';
import Loader from '../components/common/Loader';
import {
  Compass,
  MapPin,
  Users,
  Calendar,
  IndianRupee,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  UserPlus,
} from 'lucide-react';

export default function JoinGroupPage() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [joinedSuccess, setJoinedSuccess] = useState(false);

  useEffect(() => {
    fetchGroupPreview();
  }, [inviteCode]);

  const fetchGroupPreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await groupService.getGroupByInviteCode(inviteCode);
      if (res?.group) {
        setGroup(res.group);
      } else {
        setError('Group invitation link is invalid or expired.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired group invitation link.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!currentUser) {
      sessionStorage.setItem('redirectAfterAuth', `/groups/join/${inviteCode}`);
      navigate('/login');
      return;
    }

    setJoining(true);
    try {
      const res = await groupService.joinGroupByInviteCode(inviteCode);
      if (res?.success) {
        setJoinedSuccess(true);
        setTimeout(() => {
          navigate(`/groups/${res.groupId || group._id}`);
        }, 1200);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join group');
    } finally {
      setJoining(false);
    }
  };

  const handleAuthRedirect = (path) => {
    sessionStorage.setItem('redirectAfterAuth', `/groups/join/${inviteCode}`);
    navigate(path);
  };

  if (loading) return <Loader message="Loading Group Invitation..." />;

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-white shadow-2xl space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-black">Invitation Invalid</h2>
          <p className="text-xs text-slate-400">{error}</p>
          <button
            onClick={() => navigate('/groups')}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs transition-colors"
          >
            Explore WanderLust Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden text-white shadow-2xl relative">
        {/* Banner Image Header */}
        <div className="h-44 relative overflow-hidden">
          <img
            src={group.groupImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'}
            alt={group.name}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[11px] font-extrabold flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> You've been invited!
            </span>
          </div>
        </div>

        {/* Group Details Preview */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {group.destination}
              </span>
              <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-mono font-bold">
                Code: {group.inviteCode}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{group.name}</h1>
            <p className="text-xs text-slate-300 leading-relaxed">{group.description}</p>
          </div>

          {/* Host Card */}
          <div className="flex items-center gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <img
              src={group.owner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
              alt={group.owner?.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
            />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Invited By</div>
              <div className="font-extrabold text-xs text-white">{group.owner?.name || 'Group Owner'}</div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-400" /> Members
              </div>
              <div className="font-black text-white">{group.memberCount} / {group.maxMembers} Travelers</div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Dates
              </div>
              <div className="font-black text-white">{group.travelDates || 'Flexible'}</div>
            </div>
          </div>

          {/* Action Buttons */}
          {joinedSuccess ? (
            <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center space-y-2 animate-fadeIn">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="font-black text-sm text-emerald-300">You joined the group!</div>
              <div className="text-xs text-slate-300">Opening Group Chat...</div>
            </div>
          ) : currentUser ? (
            <div className="space-y-3 pt-2">
              <button
                onClick={handleJoinGroup}
                disabled={joining}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black rounded-2xl text-xs transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                {joining ? 'Joining Group...' : 'Join Group'} <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/groups')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="text-center text-xs text-slate-400 font-semibold mb-1">
                Sign in to join this travel group.
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAuthRedirect('/login')}
                  className="py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-2xl text-xs transition-all text-center shadow-lg shadow-emerald-500/20"
                >
                  Login
                </button>
                <button
                  onClick={() => handleAuthRedirect('/signup')}
                  className="py-3 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-2xl text-xs transition-all text-center border border-slate-700"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
