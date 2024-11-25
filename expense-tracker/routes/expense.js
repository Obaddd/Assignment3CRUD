const express = require('express');
const router = express.Router();
const Expense = require('../models/expense'); // Import the model

// Home Page Route for both "/" and "/home"
router.get(['/', '/home'], (req, res) => {
  res.render('pages/home'); // Render the home.ejs file
});

// View all expenses or filter by query parameters
router.get('/expenses', async (req, res) => {
  const { startDate, endDate, category } = req.query; // Extract filters from query params
  const filter = {};

  // Add conditions to the filter object
  if (startDate) filter.date = { $gte: new Date(startDate) };
  if (endDate) filter.date = { ...filter.date, $lte: new Date(endDate) };
  if (category) filter.category = category;

  try {
    const expenses = await Expense.find(filter); // Fetch filtered results
    res.render('pages/list-expenses', { expenses }); // Render with filtered data
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Adds a new expense (GET form)
router.get('/add', (req, res) => {
  res.render('pages/add-expense');
});

// Adds a new expense
router.post('/add', async (req, res) => {
  const { date, category, description, amount } = req.body;

  try {
    await Expense.create({ date, category, description, amount });
    res.redirect('/expenses');
  } catch (err) {
    res.status(500).send('Error adding expense');
  }
});

// Edits an expense (GET form)
router.get('/edit/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    res.render('pages/edit-expense', { expense });
  } catch (err) {
    res.status(500).send('Error fetching expense for editing');
  }
});

// Updates an expense (POST data)
router.post('/edit/:id', async (req, res) => {
  const { date, category, description, amount } = req.body;

  try {
    await Expense.findByIdAndUpdate(req.params.id, { date, category, description, amount });
    res.redirect('/expenses');
  } catch (err) {
    res.status(500).send('Error updating expense');
  }
});

// Deletes an expense
router.post('/delete/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.redirect('/expenses');
  } catch (err) {
    res.status(500).send('Error deleting expense');
  }
});

module.exports = router;
