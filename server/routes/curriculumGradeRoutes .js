const express = require('express');
const router = express.Router();
const curriculumGradeController = require('../controllers/curriculumGradeController'); // Adjust the path based on your file structure


router.post('/create', curriculumGradeController.createCurriculumGrade);

router.get('/curriculum/:curriculum', curriculumGradeController.getCurriculumGradesByCurriculum);

router.put('/update/:id', curriculumGradeController.updateCurriculumGrade);

router.delete('/delete/:id', curriculumGradeController.deleteCurriculumGrade);

router.get('/:id', curriculumGradeController.getCurriculumGradeById);

module.exports = router;
