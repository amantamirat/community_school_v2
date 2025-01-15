const express = require('express');
const router = express.Router();
const studentGradeController = require('../controllers/studentGradeController'); // Import the controller

// Define routes for studentGrade operations
router.post("/register_external_students/:classification_grade", studentGradeController.registerExternalStudents);
//router.get('/', studentGradeController.getAllStudentGrades); 
//router.get('/:id', studentGradeController.getStudentGradeById); 

module.exports = router;