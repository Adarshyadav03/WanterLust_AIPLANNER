import React, { useState, useEffect } from 'react';
import API from '../services/api';
import BudgetChart from '../components/budget/BudgetChart';
import Loader from '../components/common/Loader';
import { IndianRupee, AlertTriangle, Plus, Trash2, Calendar, Tag, FileText } from 'lucide-react';

const categories = ['Transportation', 'Accommodation', 'Food', 'Activities', 'Shopping', 'Other'];

export default function BudgetManagementPage() {
  const [expenses, setExpenses] = useState([]);
  const [totalBudget, setTotalBudget] = useState(20000);
  const [loading, setLoading] = useState(true);

  // Form states
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await API.get('/trips/trip_1/expenses');
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    try {
      const res = await API.post('/trips/trip_1/expenses', {
        category,
        description,
        amount: Number(amount),
        date,
      });
      setExpenses([res.data, ...expenses]);
      setDescription('');
      setAmount('');
    } catch (err) {
      const fallbackNew = {
        _id: 'exp_' + Date.now(),
        category,
        description,
        amount: Number(amount),
        date: new Date(date),
      };
      setExpenses([fallbackNew, ...expenses]);
      setDescription('');
      setAmount('');
    }
  };

  const handleDeleteExpense = async (expId) => {
    try {
      await API.delete(`/budget/expenses/${expId}`);
      setExpenses(expenses.filter((e) => e._id !== expId));
    } catch (err) {
      setExpenses(expenses.filter((e) => e._id !== expId));
    }
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const remainingBudget = totalBudget - totalSpent;
  const percentageUsed = Math.round((totalSpent / totalBudget) * 100);
  const isBudgetWarning = percentageUsed >= 85;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Financial Dashboard</span>
          <h1 className="text-3xl font-black">Trip Budget Management</h1>
          <p className="text-slate-400 text-xs mt-1">Track expenditure across transport, stay, meals, and adventure activities</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-bold">Set Budget Goal:</label>
          <input
            type="number"
            value={totalBudget}
            onChange={(e) => setTotalBudget(Number(e.target.value))}
            className="w-32 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm font-bold text-emerald-400 text-right focus:outline-none"
          />
        </div>
      </div>

      {/* Budget Warning Alert Banner */}
      {isBudgetWarning && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold shadow-lg animate-pulse">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span>Warning: You have utilized {percentageUsed}% of your allocated budget! Only ₹{remainingBudget.toLocaleString('en-IN')} remaining.</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase">Total Budget</span>
          <div className="text-3xl font-black text-slate-900 flex items-center">
            <IndianRupee className="w-6 h-6 text-slate-400" />
            {totalBudget.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase">Total Spent</span>
          <div className="text-3xl font-black text-emerald-600 flex items-center">
            <IndianRupee className="w-6 h-6 text-emerald-500" />
            {totalSpent.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-400 font-semibold">{percentageUsed}% used</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase">Remaining</span>
          <div className={`text-3xl font-black flex items-center ${remainingBudget < 0 ? 'text-rose-600' : 'text-teal-600'}`}>
            <IndianRupee className="w-6 h-6" />
            {remainingBudget.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Main Grid: Add Expense & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form: Add Expense */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-600" /> Add Expense
          </h3>

          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Solang Resort hotel bill"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount (INR)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 3500"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
            >
              Save Expense
            </button>
          </form>
        </div>

        {/* Visual Donut Chart & Expenses List */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Category Distribution</h3>
            <BudgetChart expenses={expenses} />
          </div>

          {/* Expenses Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Recorded Expenses ({expenses.length})</h3>

            {loading ? (
              <Loader message="Loading expenses..." />
            ) : (
              <div className="space-y-2">
                {expenses.map((exp) => (
                  <div key={exp._id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100 hover:border-slate-200 transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 text-emerald-400">
                          {exp.category}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{exp.description}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {new Date(exp.date || Date.now()).toLocaleDateString('en-IN')}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-slate-900">₹{exp.amount?.toLocaleString('en-IN')}</span>
                      <button
                        onClick={() => handleDeleteExpense(exp._id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
