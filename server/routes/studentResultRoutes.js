const express = require("express");
const studentResultController = require("../controllers/studentResultController");
const router = express.Router();
const { authenticateToken, verifyTeacher } = require("../middleware/auth");

router.get('/term_class/:term_class', studentResultController.getStudentResultsByTermClass);
router.get('/student_class/:student_class', studentResultController.getStudentResultsByStudentClass);
router.put('/update-student-results/:term_class', authenticateToken, verifyTeacher, studentResultController.updateStudentResults);
router.delete("/delete/:id", studentResultController.deleteStudentResult);
module.exports = router;