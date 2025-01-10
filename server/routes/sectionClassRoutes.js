const express = require("express");
const sectionClassController = require("../controllers/sectionClassController");
const router = express.Router();


router.get('/grade_section/:grade_section', sectionClassController.getAllSectionClasssBySection);
router.post("/create", sectionClassController.createSectionClass);
router.put('/update/:id', sectionClassController.updateSectionClass);
router.delete("/delete/:id", sectionClassController.deleteSectionClass);
module.exports = router;