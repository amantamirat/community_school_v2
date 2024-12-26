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
            const departments = await Department.find().populate("teachers.teacher");
            res.status(200).json(departments);
        } catch (error) {
            res.status(500).json({ message: "Error fetching departments", error });
        }
    },

    // Add a teacher to a department
    addTeacherToDepartment: async (req, res) => {
        try {
            const { departmentId, teacherId } = req.body;

            // Verify teacher exists
            const teacher = await Teacher.findById(teacherId);
            if (!teacher) {
                return res.status(404).json({ message: "Teacher not found" });
            }

            const department = await Department.findById(departmentId);
            if (!department) {
                return res.status(404).json({ message: "Department not found" });
            }

            // Check if teacher is already in the department
            if (department.teachers.some(t => t.teacher.toString() === teacherId)) {
                return res.status(400).json({ message: "Teacher already added to the department" });
            }

            department.teachers.push({ teacher: teacherId });
            await department.save();
            res.status(200).json(department);
        } catch (error) {
            res.status(500).json({ message: "Error adding teacher to department", error });
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

            const department = await Department.findById(id);
            if (!department) {
                return res.status(404).json({ message: "Department not found" });
            }

            // Check if there are teachers in the department
            if (department.teachers.length > 0) {
                return res.status(400).json({ message: "Cannot delete a department with existing teachers" });
            }

            await Department.findByIdAndDelete(id);
            res.status(200).json({ message: "Department deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Error deleting department", error });
        }
    }
};

module.exports = departmentController;
