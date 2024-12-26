const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController'); // Import the controller

// Define routes for grade operations
router.get('/', gradeController.getAllGrades); // Get all grades
router.get('/:id', gradeController.getGradeById); // Get a grade by ID

module.exports = router;