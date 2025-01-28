const express = require("express");
const termClassController = require("../controllers/termClassController");
const router = express.Router();
router.get('/:section_class', termClassController.getTermClassesBySectionClass);
module.exports = router;