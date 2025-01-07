const express = require("express");
const classificationGradeController = require("../controllers/classificationGradeController");
const router = express.Router();

// Routes
router.get('/admission_classification/:admission_classification', classificationGradeController.getClassificationGradesByClassification);
router.post("/create", classificationGradeController.createClassificationGrade);
router.put("/update/:id", classificationGradeController.updateClassificationGrade);
router.delete("/delete/:id", classificationGradeController.deleteClassificationGrade);
module.exports = router;