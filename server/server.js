const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const gradeController = require('./controllers/gradeController');
const gradeRoutes = require('./routes/gradeRoutes');
const departmentRoutes = require("./routes/departmentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const studentRoutes = require("./routes/studentRoutes");
const curriculumRoutes = require("./routes/curriculumRoutes");
const curriculumGradeRoutes = require("./routes/curriculumGradeRoutes ");
const gradeSubjectRoutes = require("./routes/gradeSubjectRoutes");
const subjectWeightRoutes = require("./routes/subjectWeightRoutes");
const academicSessionRoutes = require("./routes/academicSessionRoutes");
const admissionClassificationRoutes = require("./routes/admissionClassificationRoutes");
const classificationGradeRoutes = require("./routes/classificationGradeRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/grades', gradeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/students", studentRoutes);

app.use("/api/curricula", curriculumRoutes);
app.use("/api/curriculum-grade", curriculumGradeRoutes);
app.use("/api/grade-subject", gradeSubjectRoutes);
app.use("/api/subject-weights", subjectWeightRoutes);

app.use("/api/academic-sessions", academicSessionRoutes);
app.use("/api/admission-classifications", admissionClassificationRoutes);
app.use("/api/classification-grades", classificationGradeRoutes);

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