// server.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');

// Initialize environment variables
dotenv.config();

// Create express app
const app = express();

// Middleware setup
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // for parsing form data
app.use(morgan('dev')); // Log HTTP requests (development mode)

// Import routes
const getfiles=require('./routes/getFiles');
const uploadRoute = require('./routes/upload');
const getuserSelectionFile=require('./routes/getUserSelectionFile')
const verifyFileRoute = require('./routes/verifyFile'); 
const deleteFileRoute = require('./routes/deleteFile'); 

// Use routes
app.use('/api/files',getfiles);
app.use('/api/upload', uploadRoute);
app.use('/api/getfile',getuserSelectionFile);
app.use('/api/verify', verifyFileRoute);
app.use('/api/deletefile', deleteFileRoute); 

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Server setup
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
