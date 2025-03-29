// test-connection.js
require('dotenv').config();
const mongoose = require('mongoose');

console.log('Attempting to connect to MongoDB Atlas...');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection failed:', err);
    process.exit(1);
  });