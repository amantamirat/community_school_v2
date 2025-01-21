const express = require("express");
const curriculumController = require("../controllers/curriculumController");
const router = express.Router();

// Routes
router.get("/", curriculumController.getCurriculums);
router.post("/create", curriculumController.createCurriculum);
router.put("/update/:id", curriculumController.updateCurriculum);
router.delete("/delete/:id", curriculumController.deleteCurriculum);
module.exports = router;