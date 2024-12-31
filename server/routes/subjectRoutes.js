const express = require("express");
const subjectController = require("../controllers/subjectController");
const router = express.Router();

// Routes
router.post("/create", subjectController.createSubject);
router.get("/", subjectController.getAllSubjects);
router.put("/update/:id", subjectController.updateSubject);
router.delete("/delete/:id", subjectController.deleteSubject);

module.exports = router;
