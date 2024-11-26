const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');
const { Parser } = require('json2csv'); // Import json2csv
const { requireAuth } = require('../middlewares/auth');

router.get(['/home', '/'], (req, res) => {
  console.log('Rendering Home Page:', req.session);
  res.render('pages/home', { username: req.session.username }); // Pass the username
});

// Add Expense Page Route (Protected)
router.get('/add', requireAuth, (req, res) => {
  res.render('pages/add-expense', { username: req.session.username }); // Pass username for display
});

// Get all expenses or filter by query parameters
router.get('/expenses', async (req, res) => {
  const { startDate, endDate, category } = req.query;
  const filter = {};
  if (startDate) filter.date = { $gte: new Date(startDate) };
  if (endDate) filter.date = { ...filter.date, $lte: new Date(endDate) };
  if (category) filter.category = new RegExp(category, 'i'); // Case-insensitive search

  try {
    const expenses = await Expense.find(filter); // Fetch filtered expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0); // Calculate total
    const categoryBreakdown = expenses.reduce((breakdown, expense) => {
      breakdown[expense.category] = (breakdown[expense.category] || 0) + expense.amount;
      return breakdown;
    }, {});

    // Render the expenses page with the calculated data
    res.render('pages/list-expenses', { expenses, totalExpenses, categoryBreakdown });
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).send('Internal Server Error');
  }
});




// Export expenses as CSV
router.get('/expenses/export', async (req, res) => {
  try {
    const expenses = await Expense.find(); // Fetch all expenses
    const fields = ['date', 'category', 'description', 'amount']; // Fields for CSV
    const parser = new Parser({ fields });
    const csv = parser.parse(expenses);

    // Set the headers for CSV download
    res.header('Content-Type', 'text/csv');
    res.attachment('expenses.csv'); // Filename for the download
    res.send(csv);
  } catch (err) {
    console.error('Error exporting expenses:', err);
    res.status(500).send('Error exporting expenses');
  }
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
    res.render('pages/edit-expense', { expense, username: req.session.username }); // Pass username for display
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