const express = require("express");
const studentClassController = require("../controllers/studentClassController");
const router = express.Router();

router.get('/:student_grade', studentClassController.getStudentClasses);
router.post('/sync-student-class/:student_grade', studentClassController.syncStudentClasses);
router.delete("/delete/:id", studentClassController.deleteStudentClass);
module.exports = router;