require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express(); // Initialize the Express app

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Session Configuration
app.use(
  session({
    secret: 'your-secret-key', // Replace with a strong secret in production
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }), // Use MongoDB to store sessions
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day session
  })
);

// Middleware to pass username to all views
app.use((req, res, next) => {
  res.locals.username = req.session.username || null; // Pass username or null
  next();
});

// Import Routes
const expenseRoutes = require('./routes/expense');
const authRoutes = require('./routes/auth'); // Authentication routes

// Middleware to Protect Routes
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect('/login'); // Redirect to login if session is missing
  }
  next();
}

// Route Middleware
app.use(authRoutes); // Add authentication routes
app.use('/', expenseRoutes); // Mount expense routes at the root level

// Catch-All 404 Middleware
app.use((req, res) => {
  res.status(404).render('pages/404'); // Renders the 404.ejs file
});

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));