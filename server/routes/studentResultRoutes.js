const express = require("express");
const studentResultController = require("../controllers/studentResultController");
const router = express.Router();

router.get('/term_class/:term_class', studentResultController.getStudentResultsByTermClass);
router.get('/student_class/:student_class', studentResultController.getStudentResultsByStudentClass);
router.put('/update-student-results', studentResultController.updateStudentResults);
router.put('/submit/:section_class', studentResultController.submitStudentResultsBySectionClass);
router.put('/activate/:section_class', studentResultController.activateStudentResultsBySectionClass);
router.delete("/delete/:id", studentResultController.deleteStudentResult);
module.exports = router;