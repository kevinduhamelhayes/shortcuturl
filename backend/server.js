const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { redirectToUrl } = require('./controllers/urlController');
const urlRoutes = require('./routes/urlRoutes');
const userRoutes = require('./routes/userRoutes');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/urls', urlRoutes);
app.use('/api/users', userRoutes);

// Redirect route - must be after API routes
app.get('/:shortCode', redirectToUrl);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ShortcutURL API' });
});

// Error handling middleware
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});