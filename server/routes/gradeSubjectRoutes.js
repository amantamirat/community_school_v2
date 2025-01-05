const express = require('express');
const router = express.Router();
const gradeSubjectController = require('../controllers/gradeSubjectController'); // Adjust the path based on your file structure


router.post('/create', gradeSubjectController.createGradeSubject);
router.get('/curriculum-grade/:curriculum_grade', gradeSubjectController.getGradeSubjectsByCurriculumGrade);
router.put('/update/:id', gradeSubjectController.updateGradeSubject);
router.delete('/delete/:id', gradeSubjectController.deleteGradeSubject);

module.exports = router;
