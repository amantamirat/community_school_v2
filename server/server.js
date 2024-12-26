const mongoose = require('mongoose');
const express = require('express');
const app = express();
require('dotenv').config();

// Basic route to handle requests
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('databased connection established');
  })
  .catch(err => {
    console.error('database connection error:', err);
  });

// Start the server
app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server is running at http://127.0.0.1:${process.env.SERVER_PORT}`);
});