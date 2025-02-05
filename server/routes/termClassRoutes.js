const express = require("express");
const termClassController = require("../controllers/termClassController");
const router = express.Router();
router.get('/section_subject/:section_subject', termClassController.getTermClassBySubject);
module.exports = router;