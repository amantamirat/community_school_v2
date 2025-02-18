const express = require('express');
const router = express.Router();
const curriculumGradeController = require('../controllers/curriculumGradeController'); // Adjust the path based on your file structure
const { authenticateToken, verifyPrinicipal } = require("../middleware/auth"); 

router.post('/create', authenticateToken, verifyPrinicipal, curriculumGradeController.createCurriculumGrade);
router.get('/curriculum/:curriculum', curriculumGradeController.getCurriculumGradesByCurriculum);
router.delete('/delete/:id', authenticateToken, verifyPrinicipal, curriculumGradeController.deleteCurriculumGrade);


module.exports = router;
