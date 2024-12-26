const mongoose = require('mongoose');
const express = require('express');
const gradeRoutes = require('./routes/gradeRoutes');
const gradeController = require('./controllers/gradeController')
const app = express();
app.use(express.json());
app.use('/api/grades', gradeRoutes);

require('dotenv').config();
mongoose.connect(process.env.MONGO_URL)
  .then(async () => {
    console.log('databased connection established');
    await gradeController.initializeGrades();
  })
  .catch(err => {
    console.error('database connection error:', err);
  });
app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server is running at http://127.0.0.1:${process.env.SERVER_PORT}`);
});