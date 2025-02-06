const express = require("express");
const studentResultController = require("../controllers/studentResultController");
const router = express.Router();

router.get('/term_class/:term_class', studentResultController.getStudentResultsByTermClass);
router.get('/student_class/:student_class', studentResultController.getStudentResultsByStudentClass);
router.put('/update-student-results/:term_class', studentResultController.updateStudentResults);
router.put('/submit/:term_class', studentResultController.submitStudentResultsBySectionClass);
router.put('/activate/:term_class', studentResultController.activateStudentResultsBySectionClass);
router.delete("/delete/:id", studentResultController.deleteStudentResult);
module.exports = router;