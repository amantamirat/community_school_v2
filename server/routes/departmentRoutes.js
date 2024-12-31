const express = require("express");
const departmentController = require("../controllers/departmentController"); // Adjust path as needed
const router = express.Router();

// Routes
router.post("/create", departmentController.createDepartment);
router.get("/", departmentController.getAllDepartments);
router.put("/update/:id", departmentController.updateDepartment);
router.delete("/delete/:id", departmentController.deleteDepartment);

module.exports = router;
