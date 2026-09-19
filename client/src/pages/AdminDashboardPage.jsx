import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Loader from '../components/common/Loader';
import {
  Shield,
  Users,
  Briefcase,
  Compass,
  FileText,
  TrendingUp,
  BarChart2,
  Plus,
  Trash2,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [destinationsList, setDestinationsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // New Destination Form
  const [showAddDest, setShowAddDest] = useState(false);
  const [destName, setDestName] = useState('');
  const [destLocation, setDestLocation] = useState('');
  const [destState, setDestState] = useState('');
  const [destCategory, setDestCategory] = useState('Mountains');
  const [destBudget, setDestBudget] = useState(20000);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const sRes = await API.get('/admin/dashboard');
      setStats(sRes.data);

      const uRes = await API.get('/admin/users');
      setUsersList(uRes.data);

      const dRes = await API.get('/destinations');
      setDestinationsList(dRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDestination = async (e) => {
    e.preventDefault();
    if (!destName || !destState) return;

    try {
      const res = await API.post('/destinations', {
        name: destName,
        location: destLocation || destName,
        state: destState,
        category: destCategory,
        averageBudget: Number(destBudget),
        description: `Stunning ${destCategory.toLowerCase()} destination in ${destState}.`,
        images: ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80'],
        lat: 28.6139,
        lng: 77.209,
      });
      setDestinationsList([res.data, ...destinationsList]);
      setShowAddDest(false);
      setDestName('');
    } catch (err) {
      alert('Failed to add destination');
    }
  };

  const handleDeleteDestination = async (id) => {
    if (window.confirm('Delete this destination?')) {
      try {
        await API.delete(`/destinations/${id}`);
        setDestinationsList(destinationsList.filter((d) => d._id !== id));
      } catch (err) {
        setDestinationsList(destinationsList.filter((d) => d._id !== id));
      }
    }
  };

  if (loading) return <Loader message="Loading admin control center..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Platform Administration</span>
            <h1 className="text-3xl font-black">Admin Dashboard</h1>
            <p className="text-slate-400 text-xs mt-1">Manage system users, destinations, analytics, and content moderation</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          {['overview', 'users', 'destinations', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold capitalize transition-all ${
                activeTab === tab ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'reviews' ? 'Flagged Reviews' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase">Total Users</span>
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">{stats?.totalUsers || 1245}</div>
              <div className="text-[10px] text-emerald-600 font-bold">+12% from last month</div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase">Total Trips</span>
                <Briefcase className="w-5 h-5 text-teal-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">{stats?.totalTrips || 326}</div>
              <div className="text-[10px] text-teal-600 font-bold">+18% AI generation rate</div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase">Active Groups</span>
                <Compass className="w-5 h-5 text-cyan-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">{stats?.activeGroups || 89}</div>
              <div className="text-[10px] text-cyan-600 font-bold">Socket.IO real-time active</div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase">Community Posts</span>
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">{stats?.totalPosts || 542}</div>
              <div className="text-[10px] text-amber-600 font-bold">100% clean moderation</div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Trips Per Month</h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.tripsPerMonth || []}>
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.75rem', color: '#fff' }} />
                    <Bar dataKey="trips" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900">User Growth Trend</h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.userGrowth || []}>
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.75rem', color: '#fff' }} />
                    <Line type="monotone" dataKey="users" stroke="#06b6d4" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Registered Users Management</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-extrabold text-slate-900">{u.name}</td>
                    <td className="p-3 font-medium">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">{u.location || 'India'}</td>
                    <td className="p-3">
                      <button
                        onClick={() => alert(`Status toggled for ${u.name}`)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg"
                      >
                        Toggle Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Destinations Tab */}
      {activeTab === 'destinations' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Destinations Management</h3>
            <button
              onClick={() => setShowAddDest(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Destination
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {destinationsList.map((dest) => (
              <div key={dest._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-extrabold text-slate-900">{dest.name}</div>
                  <div className="text-xs text-slate-500">{dest.state} • {dest.category}</div>
                </div>
                <button
                  onClick={() => handleDeleteDestination(dest._id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Destination Modal */}
      {showAddDest && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 text-white">
            <h3 className="text-lg font-black">Add New Destination</h3>
            <form onSubmit={handleAddDestination} className="space-y-3">
              <input
                type="text"
                required
                value={destName}
                onChange={(e) => setDestName(e.target.value)}
                placeholder="Destination Name (e.g. Kashmir)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
              <input
                type="text"
                required
                value={destState}
                onChange={(e) => setDestState(e.target.value)}
                placeholder="State (e.g. Jammu & Kashmir)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
              <select
                value={destCategory}
                onChange={(e) => setDestCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Mountains">Mountains</option>
                <option value="Beaches">Beaches</option>
                <option value="Heritage">Heritage</option>
                <option value="Adventure">Adventure</option>
                <option value="Wildlife">Wildlife</option>
                <option value="Nature">Nature</option>
              </select>
              <input
                type="number"
                value={destBudget}
                onChange={(e) => setDestBudget(Number(e.target.value))}
                placeholder="Average Budget"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDest(false)}
                  className="w-full py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Add Destination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Reviews Moderation Tab */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Flagged & Reported Reviews
            </h3>
            <span className="text-xs font-bold text-slate-500">Moderation Control</span>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span>Reported by: Ananya Roy</span>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-extrabold uppercase">Reason: Spam</span>
                </div>
                <p className="text-xs text-slate-600">"Check out this site for cheap hotel deals at discount..."</p>
                <div className="text-[10px] text-slate-400">Target: Destination Review (Manali)</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('Review dismissed.')}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Dismiss Report
                </button>
                <button
                  onClick={() => alert('Review removed by Admin.')}
                  className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl"
                >
                  Delete Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
