// teacherRoutes.js
const express = require("express");
const teacherController = require("../controllers/teacherController"); // Adjust path as needed
const router = express.Router();

// Routes
router.post("/create", teacherController.createTeacher);
router.get("/", teacherController.getAllTeachers);
router.put("/update/:id", teacherController.updateTeacher);
router.delete("/delete/:id", teacherController.deleteTeacher);

module.exports = router;
