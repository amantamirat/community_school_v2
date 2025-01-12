const Department = require("../models/department");
const Teacher = require("../models/teacher");

// Controller functions
const departmentController = {
    // Create a new department
    createDepartment: async (req, res) => {
        try {
            const { name } = req.body;
            const newDepartment = new Department({ name });
            await newDepartment.save();
            res.status(201).json(newDepartment);
        } catch (error) {
            res.status(500).json({ message: "Error creating department", error });
        }
    },

    // Get all departments
    getAllDepartments: async (req, res) => {
        try {
            //console.log("request for department");
            const departments = await Department.find();
            res.status(200).json(departments);
        } catch (error) {
            res.status(500).json({ message: "Error fetching departments", error });
        }
    },

    // Update a department
    updateDepartment: async (req, res) => {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const updatedDepartment = await Department.findByIdAndUpdate(id, { name }, { new: true });
            if (!updatedDepartment) {
                return res.status(404).json({ message: "Department not found" });
            }

            res.status(200).json(updatedDepartment);
        } catch (error) {
            res.status(500).json({ message: "Error updating department", error });
        }
    },

    // Delete a department
    deleteDepartment: async (req, res) => {
        try {
            const { id } = req.params;
            // Check if any teacher is associated with the department
            const teacherExists = await Teacher.findOne({ department: id });
            if (teacherExists) {
                return res.status(400).json({
                    message: "Cannot delete the department. It is associated with one or more teachers.",
                });
            }
            const department = await Department.findByIdAndDelete(id);
            if (!department) {
                return res.status(404).json({ message: "Department not found" });
            }
            res.status(200).json({ message: "Department deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting department", error });
        }
    }
};

module.exports = departmentController;
