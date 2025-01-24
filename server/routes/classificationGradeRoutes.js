const express = require("express");
const classificationGradeController = require("../controllers/classificationGradeController");
const router = express.Router();

router.get('/admission_classification/:admission_classification', classificationGradeController.getClassificationGradesByClassification);
router.post('/sync-curriculum-grades/:admission_classification', classificationGradeController.syncCurriculumGrades);
router.delete("/delete/:id", classificationGradeController.deleteClassificationGrade);
module.exports = router;