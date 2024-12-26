const mongoose = require('mongoose');
const express = require('express');
const gradeController = require('./controllers/gradeController');
const gradeRoutes = require('./routes/gradeRoutes');
const departmentRoutes = require("./routes/departmentRoutes"); 

const app = express();
app.use(express.json());
app.use('/api/grades', gradeRoutes);
app.use("/api/departments", departmentRoutes);

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