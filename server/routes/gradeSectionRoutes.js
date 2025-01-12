const express = require("express");
const gradeSectionController = require("../controllers/gradeSectionController");
const router = express.Router();


router.get('/classification_grade/:classification_grade', gradeSectionController.getGradeSectionsByClassificationGrade);
router.post("/create", gradeSectionController.createGradeSection);
router.delete("/delete/:id", gradeSectionController.deleteGradeSection);
module.exports = router;