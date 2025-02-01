const express = require('express');
const router = express.Router();
const subjectWeightController = require("../controllers/subjectWeightController");

// Route to create multiple SubjectWeight entries
router.post('/create', subjectWeightController.createByGradeSubject);

// Route to delete all SubjectWeight entries for a specific grade_subject
router.delete('/delete/:grade_subject', subjectWeightController.deleteByGradeSubject);

// Route to get all SubjectWeight entries for a specific grade_subject
router.get('/:grade_subject', subjectWeightController.getByGradeSubject);

module.exports = router;
