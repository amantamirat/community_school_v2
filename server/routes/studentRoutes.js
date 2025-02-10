const express = require("express");
const studentController = require("../controllers/studentController");
const router = express.Router();
const upload = require('../middleware/upload');


router.post("/create", studentController.createStudent);
router.get("/", studentController.getAllStudents);
router.get("/new_students", studentController.getNewStudents);
router.put("/update/:id", studentController.updateStudent);
router.delete("/delete/:id", studentController.deleteStudent);
router.put('/upload-photo/:id', upload.single('photo'), studentController.updateStudentPhoto);


module.exports = router;
