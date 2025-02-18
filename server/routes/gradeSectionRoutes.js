const express = require("express");
const gradeSectionController = require("../controllers/gradeSectionController");
const router = express.Router();
const { authenticateToken, verifyPrinicipal } = require("../middleware/auth");


router.get('/classification_grade/:classification_grade', gradeSectionController.getGradeSectionsByClassificationGrade);
router.post("/create", authenticateToken, verifyPrinicipal, gradeSectionController.createSection);
router.put("/update/:id", authenticateToken, verifyPrinicipal, gradeSectionController.updateSection);
router.put("/open/:id", authenticateToken, verifyPrinicipal, gradeSectionController.openSection);
router.put("/close/:id", authenticateToken, verifyPrinicipal, gradeSectionController.closeSection);
router.delete("/delete/:id", authenticateToken, verifyPrinicipal, gradeSectionController.deleteSection);
module.exports = router;