const mongoose = require('mongoose');

// Expense Schema
const expenseSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
});

// Exports the model
module.exports = mongoose.model('Expense', expenseSchema);
