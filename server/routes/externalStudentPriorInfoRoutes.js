const express = require("express");
const externalInfoController = require("../controllers/externalStudentPriorInfoController");
const router = express.Router();

router.post("/create", externalInfoController.createExternalStudentPriorInfo);
router.get("/", externalInfoController.getAllExternalStudentPriorInfo);
router.get('/student/:student_id', externalInfoController.getExternalInfoByStudent);
router.put("/update/:id", externalInfoController.updateExternalStudentPriorInfo);
router.delete("/delete/:id", externalInfoController.deleteExternalStudentPriorInfo);

module.exports = router;
