// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');

dotenv.config();
const app = express();

// 1) CORS whitelist
const allowedOrigins = [
  'http://localhost:5173',
  'https://jntuh-exams-papers.onrender.com'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 2) Health‑check endpoint
app.get('/api/ping', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Import & mount your other routes
const getfiles = require('./routes/getFiles');
const uploadRoute = require('./routes/upload');
const getuserSelectionFile = require('./routes/getUserSelectionFile');
const verifyFileRoute = require('./routes/verifyFile');
const deleteFileRoute = require('./routes/deleteFile');

app.use('/api/files', getfiles);
app.use('/api/upload', uploadRoute);
app.use('/api/getfile', getuserSelectionFile);
app.use('/api/verify', verifyFileRoute);
app.use('/api/deletefile', deleteFileRoute);

// Connect to MongoDB and start server…
mongoose.connect(process.env.MONGO_URI, {/* options */})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB error:', err));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
