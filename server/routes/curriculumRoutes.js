const express = require("express");
const curriculumController = require("../controllers/curriculumController");
const router = express.Router();
const { authenticateToken, verifyPrinicipal } = require("../middleware/auth");
// Routes
router.get("/", curriculumController.getCurriculums);
router.post("/create", authenticateToken, verifyPrinicipal, curriculumController.createCurriculum);
router.put("/update/:id", authenticateToken, verifyPrinicipal, curriculumController.updateCurriculum);
router.delete("/delete/:id", authenticateToken, verifyPrinicipal, curriculumController.deleteCurriculum);
module.exports = router;