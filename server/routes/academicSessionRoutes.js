const express = require("express");
const academicSessionController = require("../controllers/academicSessionController");
const router = express.Router();

// Routes
router.post("/create", academicSessionController.createAcademicSession);
router.get("/", academicSessionController.getAllAcademicSessions);
router.put("/update/:id", academicSessionController.updateAcademicSession);
router.delete("/delete/:id", academicSessionController.deleteAcademicSession);

module.exports = router;
