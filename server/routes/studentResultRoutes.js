const express = require("express");
const studentResultController = require("../controllers/studentResultController");
const router = express.Router();

router.get('/section_class/:term/:section_class', studentResultController.getStudentResultsBySectionClass);
//router.delete("/delete/:id", studentClassController.deleteStudentClass);
module.exports = router;