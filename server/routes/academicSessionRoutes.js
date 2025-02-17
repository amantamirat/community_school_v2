const express = require("express");
const academicSessionController = require("../controllers/academicSessionController");
const router = express.Router();
const { authenticateToken, verifyPrinicipal } = require("../middleware/auth"); 
// Routes
router.post("/create", authenticateToken, verifyPrinicipal, academicSessionController.createAcademicSession);
router.get("/", academicSessionController.getAllAcademicSessions);
router.put("/update/:id", authenticateToken, verifyPrinicipal, academicSessionController.updateAcademicSession);
router.delete("/delete/:id", authenticateToken, verifyPrinicipal, academicSessionController.deleteAcademicSession);
router.put("/open/:id", authenticateToken, verifyPrinicipal, academicSessionController.openSession);
router.put("/close/:id", authenticateToken, verifyPrinicipal, academicSessionController.closeSession);

module.exports = router;
