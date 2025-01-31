const express = require("express");
const gradeSectionController = require("../controllers/gradeSectionController");
const router = express.Router();


router.get('/classification_grade/:classification_grade', gradeSectionController.getGradeSectionsByClassificationGrade);
router.post('/sync-section-classes/:classification_grade', gradeSectionController.syncClasses);
router.post("/create", gradeSectionController.createSection);
router.delete("/delete/:id", gradeSectionController.deleteSection);
module.exports = router;