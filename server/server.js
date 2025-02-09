const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const { initializeGrades } = require('./services/gradeService');
const gradeRoutes = require('./routes/gradeRoutes');
app.use('/api/grades', gradeRoutes);
const departmentRoutes = require("./routes/departmentRoutes");
app.use("/api/departments", departmentRoutes);
const teacherRoutes = require("./routes/teacherRoutes");
app.use("/api/teachers", teacherRoutes);
const subjectRoutes = require("./routes/subjectRoutes");
app.use("/api/subjects", subjectRoutes);
const studentRoutes = require("./routes/studentRoutes");
app.use("/api/students", studentRoutes);
const externalInfoRoutes = require("./routes/externalStudentPriorInfoRoutes");
app.use("/api/external-student-info", externalInfoRoutes);
const studentGradeRoutes = require("./routes/studentGradeRoutes");//the registred_students
app.use("/api/student-grades", studentGradeRoutes);
const studentClassRoutes = require("./routes/studentClassRoutes");
app.use("/api/student-classes", studentClassRoutes);
const studentResultRoutes = require("./routes/studentResultRoutes");
app.use("/api/student-results", studentResultRoutes);

const curriculumRoutes = require("./routes/curriculumRoutes");
app.use("/api/curricula", curriculumRoutes);
const curriculumGradeRoutes = require("./routes/curriculumGradeRoutes ");
app.use("/api/curriculum-grade", curriculumGradeRoutes);
const gradeSubjectRoutes = require("./routes/gradeSubjectRoutes");
app.use("/api/grade-subject", gradeSubjectRoutes);
const subjectWeightRoutes = require("./routes/subjectWeightRoutes");
app.use("/api/subject-weights", subjectWeightRoutes);

const academicSessionRoutes = require("./routes/academicSessionRoutes");
app.use("/api/academic-sessions", academicSessionRoutes);
const admissionClassificationRoutes = require("./routes/admissionClassificationRoutes");
app.use("/api/admission-classifications", admissionClassificationRoutes);
const classificationGradeRoutes = require("./routes/classificationGradeRoutes");
app.use("/api/classification-grades", classificationGradeRoutes);
const gradeSectionRoutes = require("./routes/gradeSectionRoutes");
app.use("/api/grade-sections", gradeSectionRoutes);
const sectionSubjectRoutes = require("./routes/sectionSubjectRoutes");
app.use("/api/section-subjects", sectionSubjectRoutes);
const termClassRoutes = require("./routes/termClassRoutes");
app.use("/api/term-classes", termClassRoutes);
//this will be removed i think
const sectionClassRoutes = require("./routes/sectionClassRoutes");
app.use("/api/section-classs", sectionClassRoutes);

require('dotenv').config();
mongoose.connect(process.env.MONGO_URL)
  .then(async () => {
    console.log('databased connection established');
    await initializeGrades();
  })
  .catch(err => {
    console.error('database connection error:', err);
  });
app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server is running at http://127.0.0.1:${process.env.SERVER_PORT}`);
});