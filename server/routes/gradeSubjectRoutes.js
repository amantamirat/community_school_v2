const express = require('express');
const router = express.Router();
const gradeSubjectController = require('../controllers/gradeSubjectController'); // Adjust the path based on your file structure
const { authenticateToken, verifyPrinicipal } = require("../middleware/auth"); 

router.post('/create', authenticateToken, verifyPrinicipal, gradeSubjectController.createGradeSubject);
router.get('/curriculum-grade/:curriculum_grade', gradeSubjectController.getGradeSubjectsByCurriculumGrade);
router.put('/update/:id', authenticateToken, verifyPrinicipal, gradeSubjectController.updateGradeSubject);
router.delete('/delete/:id', authenticateToken, verifyPrinicipal, gradeSubjectController.deleteGradeSubject);

module.exports = router;
