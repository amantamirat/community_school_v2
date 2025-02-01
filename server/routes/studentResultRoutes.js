const express = require("express");
const studentResultController = require("../controllers/studentResultController");
const router = express.Router();

router.get('/section_class/:section_class', studentResultController.getStudentResultsBySectionClass);
router.get('/student_class/:student_class', studentResultController.getStudentResultsByStudentClass);
router.put('/update-student-results', studentResultController.updateStudentResults);
router.delete("/delete/:id", studentResultController.deleteStudentResult);
module.exports = router;