const Expense = require('../models/Expense');
const { getFallbackStatus } = require('../config/db');

const memoryExpenses = [
  {
    _id: 'exp_1',
    trip: 'trip_1',
    category: 'Transportation',
    description: 'Volvo Bus from Delhi to Manali',
    amount: 3200,
    date: new Date('2026-12-12'),
    createdBy: '65f8a09b1234567890abcdef',
  },
  {
    _id: 'exp_2',
    trip: 'trip_1',
    category: 'Accommodation',
    description: 'Solang Valley Resort (2 Nights)',
    amount: 5500,
    date: new Date('2026-12-12'),
    createdBy: '65f8a09b1234567890abcdef',
  },
  {
    _id: 'exp_3',
    trip: 'trip_1',
    category: 'Food',
    description: 'Dinner at Cafe 1947 & Riverside Lunch',
    amount: 1850,
    date: new Date('2026-12-13'),
    createdBy: '65f8a09b1234567890abcdef',
  },
  {
    _id: 'exp_4',
    trip: 'trip_1',
    category: 'Activities',
    description: 'Paragliding Tandem Flight Ticket',
    amount: 1900,
    date: new Date('2026-12-14'),
    createdBy: '65f8a09b1234567890abcdef',
  },
];

const getExpensesByTrip = async (req, res) => {
  const { tripId } = req.params;

  if (getFallbackStatus()) {
    const list = memoryExpenses.filter((e) => e.trip === tripId || tripId === 'trip_1');
    return res.json(list);
  }

  try {
    const expenses = await Expense.find({ trip: tripId }).sort({ date: -1 });
    if (expenses.length === 0) {
      return res.json(memoryExpenses.filter((e) => e.trip === tripId || tripId === 'trip_1'));
    }
    res.json(expenses);
  } catch (error) {
    res.json(memoryExpenses.filter((e) => e.trip === tripId || tripId === 'trip_1'));
  }
};

const createExpense = async (req, res) => {
  const { tripId } = req.params;
  const { category, description, amount, date } = req.body;

  if (!category || !description || !amount) {
    return res.status(400).json({ message: 'Category, description, and amount are required' });
  }

  const payload = {
    trip: tripId,
    category,
    description,
    amount: Number(amount),
    date: date || new Date(),
    createdBy: req.user ? req.user._id : '65f8a09b1234567890abcdef',
  };

  if (getFallbackStatus()) {
    const newExp = { _id: 'exp_' + Date.now(), ...payload };
    memoryExpenses.unshift(newExp);
    return res.status(201).json(newExp);
  }

  try {
    const expense = await Expense.create(payload);
    res.status(201).json(expense);
  } catch (error) {
    const newExp = { _id: 'exp_' + Date.now(), ...payload };
    memoryExpenses.unshift(newExp);
    res.status(201).json(newExp);
  }
};

const updateExpense = async (req, res) => {
  const { id } = req.params;

  if (getFallbackStatus()) {
    const idx = memoryExpenses.findIndex((e) => e._id === id);
    if (idx !== -1) {
      memoryExpenses[idx] = { ...memoryExpenses[idx], ...req.body };
      return res.json(memoryExpenses[idx]);
    }
  }

  try {
    const expense = await Expense.findByIdAndUpdate(id, req.body, { new: true });
    res.json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteExpense = async (req, res) => {
  const { id } = req.params;

  if (getFallbackStatus()) {
    const idx = memoryExpenses.findIndex((e) => e._id === id);
    if (idx !== -1) {
      memoryExpenses.splice(idx, 1);
      return res.json({ message: 'Expense deleted' });
    }
  }

  try {
    await Expense.findByIdAndDelete(id);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getExpensesByTrip,
  createExpense,
  updateExpense,
  deleteExpense,
  memoryExpenses,
};
