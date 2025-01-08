const express = require('express');
const router = express.Router();
const SubjectWeightController = require('../controllers/SubjectWeightController');

// Route to create multiple SubjectWeight entries
router.post('/create', SubjectWeightController.createByGradeSubject);

// Route to delete all SubjectWeight entries for a specific grade_subject
router.delete('/delete/:grade_subject', SubjectWeightController.deleteByGradeSubject);

// Route to get all SubjectWeight entries for a specific grade_subject
router.get('/:grade_subject', SubjectWeightController.getByGradeSubject);

module.exports = router;
