const express = require('express');
const router = express.Router();
const studentGradeController = require('../controllers/studentGradeController'); // Import the controller

// Define routes for studentGrade operations
router.put("/allocate_section/:grade_section", studentGradeController.allocateSection);
router.put("/detach_section/:grade_section", studentGradeController.detachSection);
router.get('/nan_section_registered_students/:classification_grade', studentGradeController.getUnSectionedRegisteredStudents); 
router.get('/sectioned_registered_students/:grade_section', studentGradeController.getSectionedRegisteredStudents); 
router.delete("/deregister_students/:classification_grade", studentGradeController.deregisterStudents);


module.exports = router;