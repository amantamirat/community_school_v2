const express = require("express");
const studentClassController = require("../controllers/studentClassController");
const router = express.Router();

router.get('/student_grade/:student_grade', studentClassController.getStudentClassesByStudentGrade);
router.get('/section_class/:section_class', studentClassController.getStudentClassesBySectionClass);
router.post('/sync-student-class/:student_grade', studentClassController.syncStudentClasses);
router.delete("/delete/:id", studentClassController.deleteStudentClass);
module.exports = router;