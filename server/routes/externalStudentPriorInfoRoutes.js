const express = require('express');
const externalInfoController = require("../controllers/externalStudentPriorInfoController");
const router = express.Router();


router.get('/student/:student', externalInfoController.getExternalInfoByStudent);
router.get('/classification_grade/:classification_grade', externalInfoController.getExternalElligibleStudentsByGrade);
router.post("/create/:student_id", externalInfoController.createExternalStudentPriorInfo);
router.post("/register_external_students/:classification_grade", externalInfoController.registerExternalStudents);
router.put("/update/:id", externalInfoController.updateExternalStudentPriorInfo);
router.delete("/delete/:id", externalInfoController.deleteExternalStudentPriorInfo);

module.exports = router;
