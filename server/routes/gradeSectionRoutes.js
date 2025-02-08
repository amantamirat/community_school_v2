const express = require("express");
const gradeSectionController = require("../controllers/gradeSectionController");
const router = express.Router();


router.get('/classification_grade/:classification_grade', gradeSectionController.getGradeSectionsByClassificationGrade);
router.post("/create", gradeSectionController.createSection);
router.put("/open/:id", gradeSectionController.openSection);
router.put("/close/:id", gradeSectionController.closeSection);
router.delete("/delete/:id", gradeSectionController.deleteSection);
module.exports = router;