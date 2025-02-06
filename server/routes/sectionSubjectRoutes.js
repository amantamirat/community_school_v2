const express = require("express");
const sectionSubjectController = require("../controllers/sectionSubjectController");
const router = express.Router();
router.get('/grade_section/:grade_section', sectionSubjectController.getSectionSubjectsBySection);
router.put('/allocate-teacher/:id', sectionSubjectController.allocateTeacher);
router.delete("/remove-teacher/:id", sectionSubjectController.removeTeacher);
module.exports = router;