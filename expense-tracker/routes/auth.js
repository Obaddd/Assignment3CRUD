const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Signup Route (GET)
router.get('/signup', (req, res) => {
  res.render('pages/signup');
});

// Signup Route (POST)
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = new User({ username, password });
    await user.save();
    req.session.userId = user._id; // Store user ID in session
    req.session.username = user.username; // Store username in session
    res.redirect('/home'); // Redirect to home after successful signup
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).send('Error signing up');
  }
});


// Login Route (GET)
router.get('/login', (req, res) => {
  res.render('pages/login');
});

// Login Route (POST)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).send('Invalid username or password');
    }
    req.session.userId = user._id; // Store user ID in session
    req.session.username = user.username; // Store username in session
    res.redirect('/home'); // Redirect to home after successful login
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).send('Error logging in');
  }
});


// Logout Route
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login'); // Redirect to login page
  });
});

module.exports = router;