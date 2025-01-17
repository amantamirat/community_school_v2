const express = require("express");
const studentController = require("../controllers/studentController");
const router = express.Router();


router.post("/create", studentController.createStudent);
router.get("/", studentController.getAllStudents);
router.get("/new_students", studentController.getNewStudents);
router.put("/update/:id", studentController.updateStudent);
router.delete("/delete/:id", studentController.deleteStudent);

module.exports = router;
