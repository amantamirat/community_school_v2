const express = require('express');
const router = express.Router();
const curriculumGradeController = require('../controllers/curriculumGradeController'); // Adjust the path based on your file structure


router.post('/create', curriculumGradeController.createCurriculumGrade);
router.get('/curriculum/:curriculum', curriculumGradeController.getCurriculumGradesByCurriculum);
router.delete('/delete/:id', curriculumGradeController.deleteCurriculumGrade);


module.exports = router;
