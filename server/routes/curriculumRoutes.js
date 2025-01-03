const express = require("express");
const curriculumController = require("../controllers/curriculumController");
const router = express.Router();

// Routes
router.get("/", curriculumController.getAllCurriculums);
router.post("/create", curriculumController.createCurriculum);
router.put("/update/:id", curriculumController.updateCurriculum);
router.delete("/delete/:id", curriculumController.deleteCurriculum);
router.post("/add-grade/:id", curriculumController.addGrade);
router.delete("/remove-grade/:curriculumId/:gradeId", curriculumController.removeGrade);
router.post("/add-subject/:curriculumId/:gradeId", curriculumController.addSubject);
router.delete("/remove-subject/:curriculumId/:gradeId/:subjectId", curriculumController.removeSubject);
module.exports = router;