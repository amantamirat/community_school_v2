const express = require("express");
const studentClassController = require("../controllers/studentClassController");
const router = express.Router();

router.get('/student_grade/:student_grade', studentClassController.getStudentClassesByStudentGrade);
router.get('/term_class/:term_class', studentClassController.getStudentClassesBySectionClass);
router.delete("/delete/:id", studentClassController.deleteStudentClass);
module.exports = router;