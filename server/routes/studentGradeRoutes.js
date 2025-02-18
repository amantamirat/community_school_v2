const express = require('express');
const router = express.Router();
const studentGradeController = require('../controllers/studentGradeController'); // Import the controller
const { authenticateToken, verifyPrinicipal } = require("../middleware/auth"); 
// Define routes for studentGrade operations
router.get('/get_elligible_students/:classification_grade', studentGradeController.getElligibleStudentsByGrade);
router.put("/allocate_section/:grade_section", authenticateToken, verifyPrinicipal,studentGradeController.allocateSection);
router.put("/detach_section/:grade_section", authenticateToken, verifyPrinicipal,studentGradeController.detachSection);
router.get('/nan_section_registered_students/:classification_grade',authenticateToken, studentGradeController.getUnSectionedRegisteredStudents);
router.get('/sectioned_registered_students/:grade_section',authenticateToken, studentGradeController.getSectionedRegisteredStudents);
router.delete("/deregister_students/:classification_grade", authenticateToken, verifyPrinicipal,studentGradeController.deregisterStudents);
router.post("/register_students/:classification_grade", authenticateToken, verifyPrinicipal,studentGradeController.registerStudents);


module.exports = router;