const express = require("express");
const admissionClassificationController = require("../controllers/admissionClassificationController");
const router = express.Router();

router.post("/create", admissionClassificationController.createAdmissionClassification);
router.delete("/delete/:id", admissionClassificationController.deleteAdmissionClassification);
router.get("/academic_session/:academic_session", admissionClassificationController.getAcademicSessionClassifications);
router.put("/open/:id", admissionClassificationController.openAdmission);
router.put("/close/:id", admissionClassificationController.closeAdmission);
module.exports = router;
