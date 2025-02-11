// teacherRoutes.js
const express = require("express");
const teacherController = require("../controllers/teacherController"); // Adjust path as needed
const router = express.Router();
const upload = require('../middleware/uploadPhoto');

// Routes
router.post("/create", teacherController.createTeacher);
router.get("/", teacherController.getTeachers);
router.put("/update/:id", teacherController.updateTeacher);
router.delete("/delete/:id", teacherController.deleteTeacher);
router.put('/upload-photo/:type/:id', upload.single('photo'), teacherController.updateTeacherPhoto);

module.exports = router;
