const express = require('express');
const router = express.Router();
const studentGradeController = require('../controllers/studentGradeController'); // Import the controller

// Define routes for studentGrade operations
router.post("/register_external_students/:classification_grade", studentGradeController.registerExternalStudents);
router.get('/registered_students/:classification_grade', studentGradeController.getRegisteredStudentsByClassificationGrade); 
router.delete("/deregister_students/:classification_grade", studentGradeController.deregisterStudents);


module.exports = router;