const express = require("express");
const termClassController = require("../controllers/termClassController");
const router = express.Router();
router.get('/section_subject/:section_subject', termClassController.getTermClassBySubject);
router.put('/approve/:term_class', termClassController.approveTermClass);
module.exports = router;