const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const gradeController = require('./controllers/gradeController');
const gradeRoutes = require('./routes/gradeRoutes');
const departmentRoutes = require("./routes/departmentRoutes"); 
const teacherRoutes = require("./routes/teacherRoutes"); 

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/grades', gradeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/teachers", teacherRoutes);

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