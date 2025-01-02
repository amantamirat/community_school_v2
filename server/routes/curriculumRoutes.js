const express = require("express");
const curriculumController = require("../controllers/curriculumController");
const router = express.Router();

// Routes
router.post("/create", curriculumController.createCurriculum);
router.get("/", curriculumController.getAllCurriculums);
router.put("/update/:id", curriculumController.updateCurriculum);
router.delete("/delete/:id", curriculumController.deleteCurriculum);

module.exports = router;