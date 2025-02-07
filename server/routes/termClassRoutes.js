const express = require("express");
const termClassController = require("../controllers/termClassController");
const router = express.Router();
router.get('/section_subject/:section_subject', termClassController.getTermClassBySubject);
router.put('/submit/:term_class', termClassController.submitTermClass);
router.put('/activate/:term_class', termClassController.activateTermClass);
router.put('/approve/:term_class', termClassController.approveTermClass);
router.put('/revoke/:term_class', termClassController.revokeTermClass);
module.exports = router;