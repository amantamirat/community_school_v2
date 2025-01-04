const express = require("express");
const admissionClassificationController = require("../controllers/admissionClassificationController");
const router = express.Router();

router.post("/create", admissionClassificationController.createAdmissionClassification);
router.get("/", admissionClassificationController.getAllAdmissionClassifications);
router.put("/update/:id", admissionClassificationController.updateAdmissionClassification);
router.delete("/delete/:id", admissionClassificationController.deleteAdmissionClassification);

module.exports = router;
